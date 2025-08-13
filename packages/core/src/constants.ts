import type { PluginOptions } from './types'

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

export const DEFAULT_CONFIG: PluginOptions = {
    quality: 80,
    enableDev: false,
    enableDevWebp: false,
    enableWebp: false,
    includes: /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i,
    excludes: '',
    cacheDir: 'node_modules/.cache/vite-plugin-image',
    sharpConfig: {},
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
    spritesConfig: {
        rules: [],
        suffix: 'sprites',
        algorithm: 'binary-tree'
    }
}
