// vite-plugin-image-compress.ts
import type { PluginOption, ResolvedConfig } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { processImage, handleImgBundle } from './press'
import { filterImage } from './utils'
import type { PluginOptions } from './types'
import {
  getGlobalConfig,
  handleImgMap,
  handleReplaceWebp,
  setGlobalConfig
} from './cache'
import { transformWebpExtInHtml } from './transform'

export default function ImageTools(
  options: Partial<PluginOptions> = {}
): PluginOption {
  setGlobalConfig(options)

  const {
    enableDevWebp,
    cacheDir,
    enableDev,
    filter,
    compatibility,
    bodyWebpClassName
  } = getGlobalConfig()

  let isBuild = false
  const cachePath = path.resolve(process.cwd(), cacheDir)

  if (!existsSync(cachePath)) {
    mkdirSync(cachePath, { recursive: true })
  }

  return {
    name: 'vite-plugin-image-tools',
    config(config, { command }) {
      isBuild = command === 'build'
    },
    configureServer(server) {
      if (!enableDev) {
        return
      }
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!filterImage(url)) return next()

        try {
          const filePath = decodeURIComponent(
            path.resolve(process.cwd(), url.split('?')[0].slice(1) || '')
          )

          if (filter && filter instanceof Function) {
            const isTrue = filter(url)
            if (!isTrue) {
              return next()
            }
          }

          const { ext } = parse(filePath)
          const type = enableDevWebp
            ? IMG_FORMATS_ENUM.webp
            : ext.replace('.', '')

          const buffer = await processImage(filePath)

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
      if (!compatibility) {
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
            attrs: { type: 'module' },
            children: `
              ;(async () => {
                const supportsWebp = () =>
                  new Promise((resolve) => {
                    const img = new Image()
                    img.onload = () => resolve(img.width > 0 && img.height > 0)
                    img.onerror = () => resolve(false)
                    img.src =
                      'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
                  })

                try {
                  const isSupport = await Promise.race([
                    supportsWebp(),
                    new Promise((resolve) => setTimeout(() => resolve(false), 300))
                  ])

                  if (isSupport) {
                    document.querySelector('body').classList.add('${bodyWebpClassName}')
                    document.querySelectorAll('[${bodyWebpClassName}]').forEach((domEl) => {
                      var url = domEl.getAttribute('${bodyWebpClassName}')
                      if (domEl.tagName.toLocaleLowerCase() === 'img') {
                        domEl.setAttribute('src', url)
                      } else if (domEl.tagName.toLocaleLowerCase() === 'source') {
                        if (domEl.getAttribute('src')) {
                          domEl.setAttribute('src', url)
                        }
                        if (domEl.getAttribute('srcset')) {
                          domEl.setAttribute('srcset', url)
                        }
                      } else {
                        domEl.setAttribute('style', url)
                      }
                    })
                  }
                } catch (error) {
                  console.error('WebP error:', error)
                }
              })()
            `
          }
        ]
      }
    },
    async generateBundle(_options, bundle) {
      if (!isBuild) return

      handleImgMap(bundle)

      await handleImgBundle(bundle)
    },
    async writeBundle(opt, bundle) {
      const { enableWebp } = getGlobalConfig()
      if (!enableWebp) {
        return
      }
      for (const key in bundle) {
        const chunk = bundle[key] as any

        if (/(html)$/.test(key)) {
          const htmlCode = await transformWebpExtInHtml(chunk.source)
          writeFileSync(join(opt.dir!, chunk.fileName), htmlCode)
        }
      }
    }
  }
}
