// vite-plugin-image-compress.ts
import type { PluginOption } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path, { join, parse } from 'path'
import { processImage, handleImgBundle } from './compress'
import {
  filterImage,
  setGlobalConfig,
  handleWebpImgMap,
  getGlobalConfig,
  handleReplaceWebp,
  compressCache,
  isCssFile
} from './utils'
import type { PluginOptions } from './types'
import { transformWebpExtInHtml } from './transform'
import { handleSpriteCss, handleSpritesCssBundle, initBundleStyles, initSprite } from './sprites'
import { printLog } from './log'

export default function ImageTools(
  options: Partial<PluginOptions> = {}
): PluginOption {
  setGlobalConfig(options)

  const { enableDevWebp, cacheDir, enableDev, compatibility, enableWebp } =
    getGlobalConfig()

  let isBuild = false
  const cachePath = path.resolve(process.cwd(), cacheDir)

  if (!existsSync(cachePath)) {
    mkdirSync(cachePath, { recursive: true })
  }
  return {
    name: 'vite-plugin-image-tools',
    async buildStart() {
      try {
        await initSprite(this)
      } catch (error) {
        console.error('❌ [DEBUG] 精灵图初始化失败:', error)
        // 不阻断构建流程，只是警告
      }
    },

    config(config, { command }) {
      isBuild = command === 'build'
    },

    async transform(code: string, id: string) {
      if (isBuild || id.includes('node_modules') || id.startsWith('\0') || !isCssFile(id))
        return
      const result = await handleSpriteCss(code, id)

      return {
        code: result && result.css !== code ? result.css : code
      }
    },
    configureServer(server) {
      if (!enableDev) {
        return
      }
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const isFilter = await filterImage(url)
        if (!isFilter) return next()
        try {
          const filePath = decodeURIComponent(
            path.resolve(process.cwd(), url.split('?')[0].slice(1) || '')
          )

          const { buffer, type } = (await processImage(filePath)) || {}

          if (!buffer) {
            return next()
          }

          res.setHeader('Content-Type', `image/${type}`)
          res.end(buffer)
        } catch (e) {
          return next()
        }
      })
    },
    async transformIndexHtml(html) {
      if (
        !compatibility ||
        (isBuild && !enableWebp) ||
        (!isBuild && enableDevWebp)
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
    async generateBundle(_options, bundle) {
      if (!isBuild) return
      await initBundleStyles(bundle)
    await handleSpritesCssBundle(this, bundle)
      if (enableWebp) {
        await handleWebpImgMap(bundle)
      }

      await handleImgBundle(bundle)
    },
    async writeBundle(opt, bundle) {
      const { enableWebp, compatibility, log } = getGlobalConfig()
      if (log) {
        printLog()
      }
      if (!enableWebp) {
        return
      }
      for (const key in bundle) {
        const chunk = bundle[key] as any

        if (/(html)$/.test(key)) {
          const htmlCode = compatibility
            ? await transformWebpExtInHtml(chunk.source)
            : await handleReplaceWebp(chunk.source)
          writeFileSync(join(opt.dir!, chunk.fileName), htmlCode)
        }
      }
    }
  }
}
