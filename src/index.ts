// vite-plugin-image-compress.ts
import type { PluginOption, ResolvedConfig } from 'vite'
import { existsSync, mkdirSync } from 'fs'
import path, { parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { processImage } from './press'
import { filterImage, handleImgBundle } from './utils'
export type PluginOptions = {
    quality?: number
    enableDev?: boolean
    enableDevWebp?: boolean
    enableWebP?: boolean
    include?: string[]
    exclude?: string[]
    cacheDir?: string
    regExp?: string
}

export default function ImageTools(options: PluginOptions = {}): PluginOption {
    // 初始化图片过滤正则
    if (options && !options.regExp && options.include) {
        DEFAULT_CONFIG.regExp = `\\.(${options.include.join('|')})$`
    }

    const { enableDevWebp, cacheDir, enableDev } = Object.assign(
        DEFAULT_CONFIG,
        options
    )

    let isBuild = false
    let viteConfig: ResolvedConfig
    const cachePath = path.resolve(process.cwd(), cacheDir)

    // 创建缓存目录
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath, { recursive: true })
    }

    return {
        name: 'vite-plugin-image-tools',
        config(config, { command }) {
            isBuild = command === 'build'
        },
        configResolved(config) {
            viteConfig = config
        },
        // 开发模式：拦截图片请求，处理图片压缩和转webp
        configureServer(server) {
            if (!enableDev) {
                return
            }
            server.middlewares.use(async (req, res, next) => {
                if (!filterImage(req.url)) return next()

                try {
                    const filePath = decodeURIComponent(
                        path.resolve(
                            process.cwd(),
                            req.url.split('?')[0].slice(1)
                        )
                    )

                    // filter image
                    if (!filterImage(filePath)) {
                        next()
                    }

                    const { ext } = parse(filePath)
                    const type = enableDevWebp
                        ? IMG_FORMATS_ENUM.webp
                        : ext.replace('.', '')

                    const buffer = await processImage(filePath)

                    if (!buffer) {
                        next()
                    }

                    res.setHeader('Content-Type', `image/${type}`)
                    res.end(buffer)
                } catch (e) {
                    next()
                }
            })
        },
        // 构建模式：替换最终产物中的资源
        async generateBundle(_options, bundle) {
            if (!isBuild) return
            await handleImgBundle(bundle)
        },
    }
}
