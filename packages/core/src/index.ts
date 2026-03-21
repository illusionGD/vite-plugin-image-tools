// vite-plugin-image-compress.ts
import type { PluginOption, UserConfig } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path, { join, parse } from 'path'
import { processImage, handleImgBundle, handlePublicImg } from './compress'
import {
    filterImage,
    setGlobalConfig,
    handleConvertImgMap,
    getGlobalConfig,
    handleReplaceConverted,
    compressCache,
    isCssFile
} from './utils'
import type { PluginOptions } from './types'
import { transformExtInHtml } from './transform'
import {
    handleSpriteCss,
    handleSpritesCssBundle,
    initBundleStyles,
    initOriginalFileNames,
    initSprite,
    clearSpriteCache,
    getSpriteDevWatchInfo
} from './sprites'
import { printLog } from './log'
import { generateCssArtifacts, generateCssArtifactsForDev } from './css-gen'

export default function ImageTools(
    options: Partial<Omit<PluginOptions, 'viteConfig' | 'isBuild'>> = {}
): PluginOption {
    setGlobalConfig(options)

    const {
        enableDevConvert,
        cacheDir,
        enableDev,
        compatibility
    } = getGlobalConfig()

    let isBuild = false
    let viteConfig: UserConfig
    const cachePath = path.resolve(process.cwd(), cacheDir)

    if (!existsSync(cachePath)) {
        mkdirSync(cachePath, { recursive: true })
    }
    return {
        name: 'vite-plugin-image-tools',

        config(config, { command }) {
            viteConfig = config
            isBuild = command === 'build'
            const globalConfig = getGlobalConfig()
            globalConfig.viteConfig = viteConfig
            globalConfig.isBuild = isBuild
        },

        async buildStart() {
            try {
                await initSprite(this, viteConfig, isBuild)
            } catch (error) {
                console.error('❌ [DEBUG] Sprite initialization failed:', error)
            }
        },

        async transform(code: string, id: string) {
            if (
                isBuild ||
                id.includes('node_modules') ||
                id.startsWith('\0') ||
                !isCssFile(id)
            )
                return
            const result = await handleSpriteCss(code, id, viteConfig)

            return {
                code: result && result.css !== code ? result.css : code
            }
        },
        configureServer(server) {
            if (!enableDev) {
                return
            }
            const cssGenOutputFiles = new Set(
                (getGlobalConfig().cssGen?.rules || []).map((rule) =>
                    path.resolve(process.cwd(), rule.stylePath)
                )
            )
            const cssGenWatchDirs =
                getGlobalConfig().cssGen?.rules?.map((rule) =>
                    path.resolve(process.cwd(), rule.inputDir)
                ) || []
            const spriteWatchDirs =
                getGlobalConfig().spritesConfig?.rules?.map((rule) =>
                    path.resolve(process.cwd(), rule.dir)
                ) || []
            const { extraWatchDirs, generatedPngAbsPaths } =
                getSpriteDevWatchInfo()
            const spriteGeneratedOutputs = new Set(
                generatedPngAbsPaths.map((p) => path.resolve(p))
            )
            const isFileUnderDir = (file: string, dir: string) => {
                const f = path.resolve(file)
                const d = path.resolve(dir)
                if (f === d) return true
                const rel = path.relative(d, f)
                return (
                    rel !== '' &&
                    !rel.startsWith('..') &&
                    !path.isAbsolute(rel)
                )
            }
            let spriteRebuildTimer: ReturnType<typeof setTimeout> | undefined
            let cssGenRebuildTimer: ReturnType<typeof setTimeout> | undefined
            const scheduleCssGenRebuild = () => {
                if (!cssGenWatchDirs.length) {
                    return
                }
                if (cssGenRebuildTimer) {
                    clearTimeout(cssGenRebuildTimer)
                }
                cssGenRebuildTimer = setTimeout(async () => {
                    try {
                        const changed = await generateCssArtifactsForDev()
                        if (changed) {
                            server.moduleGraph.invalidateAll()
                            server.ws.send({ type: 'full-reload' })
                        }
                    } catch (error) {
                        console.error('❌ [DEBUG] CSS generation failed:', error)
                    }
                }, 120)
            }
            const scheduleSpriteRebuild = () => {
                if (!spriteWatchDirs.length) {
                    return
                }
                if (spriteRebuildTimer) {
                    clearTimeout(spriteRebuildTimer)
                }
                spriteRebuildTimer = setTimeout(async () => {
                    try {
                        clearSpriteCache()
                        await initSprite({} as any, viteConfig, false)
                        server.moduleGraph.invalidateAll()
                        server.ws.send({ type: 'full-reload' })
                    } catch (error) {
                        console.error('❌ [DEBUG] Sprite rebuild failed:', error)
                    }
                }, 120)
            }
            if (cssGenWatchDirs.length) {
                // Generate once on dev server start.
                void generateCssArtifactsForDev()
            }
            cssGenWatchDirs.forEach((dir) => server.watcher.add(dir))
            spriteWatchDirs.forEach((dir) => server.watcher.add(dir))
            extraWatchDirs.forEach((dir) => server.watcher.add(dir))
            generatedPngAbsPaths.forEach((p) => server.watcher.add(p))
            const onCssGenChange = (file: string) => {
                const absFile = path.resolve(file)
                if (cssGenOutputFiles.has(absFile)) {
                    return
                }
                if (
                    cssGenWatchDirs.some((dir) => isFileUnderDir(absFile, dir))
                ) {
                    scheduleCssGenRebuild()
                }
            }
            const onSpriteChange = (file: string) => {
                const absFile = path.resolve(file)
                if (spriteGeneratedOutputs.has(absFile)) {
                    return
                }
                if (
                    spriteWatchDirs.some((dir) => isFileUnderDir(absFile, dir))
                ) {
                    scheduleSpriteRebuild()
                }
            }
            server.watcher.on('add', onCssGenChange)
            server.watcher.on('add', onSpriteChange)
            server.watcher.on('change', onCssGenChange)
            server.watcher.on('change', onSpriteChange)
            server.watcher.on('unlink', onCssGenChange)
            server.watcher.on('unlink', onSpriteChange)
            server.middlewares.use(async (req, res, next) => {
                const url = req.url || ''
                const isFilter = await filterImage(url)
                if (!isFilter) return next()
                try {
                    const filePath = decodeURIComponent(
                        path.resolve(
                            process.cwd(),
                            url.split('?')[0].slice(1) || ''
                        )
                    )

                    const { buffer, type } =
                        (await processImage(filePath)) || {}

                    if (!buffer) {
                        return next()
                    }
                    if (type !== 'svg') {
                        res.setHeader('Content-Type', `image/${type}`)
                    } else {
                        res.setHeader('Content-Type', 'image/svg+xml')
                    }
                    res.end(buffer)
                } catch (e) {
                    return next()
                }
            })
        },
        async transformIndexHtml(html) {
            const globalConfig = getGlobalConfig()
            const enableMainWebp =
                globalConfig.convert.enable &&
                globalConfig.convert.format === 'webp'
            if (
                !compatibility ||
                (isBuild && !enableMainWebp) ||
                (!isBuild && enableDevConvert)
            ) {
                return {
                    html,
                    tags: []
                }
            }
            const { bodyWebpClassName } = getGlobalConfig()
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        children: `
            ;(function () {
              var img = document.createElement('img')
              img.src =
                'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEacQERGIiP4HAA=='
              img.onerror = img.onload = function () {
                var isSupport = img.width > 0 && img.height > 0
                document.documentElement
                  .querySelector('body')
                  .classList.add(
                    isSupport ? '${bodyWebpClassName}' : 'no-${bodyWebpClassName}'
                  )
              }
            })()
            `
                    }
                ]
            }
        },
        async generateBundle(options, bundle) {
            if (!isBuild) return
            const globalConfig = getGlobalConfig()
           
            await initOriginalFileNames(bundle, viteConfig)
            await initBundleStyles(bundle)
            await handleSpritesCssBundle(this, bundle)
            if (globalConfig.convert.enable) {
                await handleConvertImgMap(bundle)
            }

            await handleImgBundle(bundle)
            const outDir = path.resolve(
                process.cwd(),
                options.dir || viteConfig.build?.outDir || 'dist'
            )
            await generateCssArtifacts(outDir)
        },
        async writeBundle(opt, bundle) {
            const { compatibility, log, publicConfig, convert } =
                getGlobalConfig()
            const enableMainWebp =
                convert.enable && convert.format === 'webp'
            if (publicConfig && publicConfig.enable) {
                await handlePublicImg(viteConfig)
            }
            if (log) {
                printLog()
            }
            if (!enableMainWebp) {
                return
            }
            for (const key in bundle) {
                const chunk = bundle[key] as any

                if (/(html)$/.test(key)) {
                    const htmlCode = compatibility
                        ? await transformExtInHtml(chunk.source, convert.format)
                        : await handleReplaceConverted(chunk.source)
                    writeFileSync(join(opt.dir!, chunk.fileName), htmlCode)
                }
            }
        }
    }
}
