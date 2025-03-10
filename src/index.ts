import type { Plugin, ResolvedConfig } from 'vite'
import path from 'path'
import { DEFAULT_QUALITY, IMG_FORMATS } from './constants'
import { initQuality } from './utils'
import { pressDirImage } from './press'

export interface PluginOptionsType {
    /** 质量：1-100 */
    quality?: number
    /** 图片格式：['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg'] */
    formats?: string[]
    /** 开发环境是否开启 */
    devOpen?: boolean
    /** 缓存路径：devOpen为true生效 */
    cacheDir?: string
    /** sharp配置 */
    sharpOptions?: Record<string, any>
    /** svgo配置 */
    svgoOptions?: Record<string, any>
    jpgOptions?: Record<string, any>
    pngOptions?: Record<string, any>
    webpOptions?: Record<string, any>
    avifOptions?: Record<string, any>
    gifOptions?: Record<string, any>
}

const defaultConfig: PluginOptionsType = {
    quality: DEFAULT_QUALITY,
    formats: IMG_FORMATS,
}

export default function ImageTools(
    userConfig?: Partial<PluginOptionsType>
): Plugin {
    const config = Object.assign({}, defaultConfig, userConfig)
    initQuality(config)
    let viteConfig: ResolvedConfig

    return {
        name: 'vite:image-tools',
        configResolved(c: ResolvedConfig) {
            viteConfig = Object.assign(viteConfig || {}, c)
        },
        async closeBundle() {
            const { isProduction, root, build } = viteConfig
            if (isProduction) {
                const assetsPath = path.join(root, build.outDir)
                await pressDirImage(assetsPath, config)
            }
        },
    }
}
