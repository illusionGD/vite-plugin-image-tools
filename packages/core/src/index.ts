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

export default function ImageTools(
  options: Partial<PluginOptions> = {}
): PluginOption {
  setGlobalConfig(options)

  const { enableDevWebp, cacheDir, enableDev } = getGlobalConfig()

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
        if (!filterImage(req.url || '')) return next()

        try {
          const filePath = decodeURIComponent(
            path.resolve(process.cwd(), req.url?.split('?')[0].slice(1) || '')
          )

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
          const htmlCode = handleReplaceWebp(chunk.source)
          writeFileSync(join(opt.dir!, chunk.fileName), htmlCode)
        }
      }
    }
  }
}
