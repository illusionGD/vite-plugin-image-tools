import type { ImgFormatType, PluginOptions } from './types'
import type { AnyObject } from './types'

/** Image format enum */
export const IMG_FORMATS_ENUM = {
    png: 'png',
    jpg: 'jpg',
    jpeg: 'jpeg',
    webp: 'webp',
    avif: 'avif',
    tiff: 'tiff',
    gif: 'gif',
    svg: 'svg'
} as const

/** Default configuration */
export const DEFAULT_CONFIG: PluginOptions = {
    quality: 80,
    enableDev: false,
    enableDevConvert: false,
    convert: {
        enable: true,
        format: 'webp',
        deleteOriginImg: false
    },
    includes: /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i,
    excludes: '',
    cacheDir: 'node_modules/.cache/vite-plugin-image',
    sharpConfig: {},
    log: true,
    svgoConfig: {
        plugins: [
            'preset-default',
            { name: 'removerXMLNS', fn: () => null },
            { name: 'removeViewBox' }
        ],
        js2svg: { indent: 2, pretty: true }
    },
    compatibility: false,
    bodyWebpClassName: 'webp',
    filter: () => true,
    perImage: async () => ({}),
    cssGen: {
        rules: [],
        format: 'css'
    },
    spritesConfig: {
        rules: [],
        algorithm: 'binary-tree'
    },
    deviceCss: {
        enable: false
    }
}

/** Built-in device profiles used when deviceCss.devices is omitted */
export const DEFAULT_DEVICE_PROFILES = [
    { name: 'android', match: /android/i, quality: 65, scale: 1 },
    { name: 'ios', match: /iphone|ipad|ipod/i, quality: 60, scale: 1 },
    { name: 'mb', match: /mobile/i, quality: 70, scale: 1 }
] as const

export const isWindows =
    typeof process !== 'undefined' && process.platform === 'win32'
