import { PluginOptions } from '.'

export enum IMG_FORMATS_ENUM {
    png = 'png',
    jpg = 'jpg',
    jpeg = 'jpeg',
    webp = 'webp',
}

const imgFormats: string[] = []
for (const key in IMG_FORMATS_ENUM) {
    if (Object.prototype.hasOwnProperty.call(IMG_FORMATS_ENUM, key)) {
        imgFormats.push(IMG_FORMATS_ENUM[key])
    }
}
export const DEFAULT_CONFIG: PluginOptions = {
    quality: 80,
    enableDev: false,
    enableDevWebp: false,
    enableWebP: true,
    regExp: `\\.(${imgFormats.join('|')})$`,
    include: imgFormats,
    cacheDir: 'node_modules/.cache/vite-plugin-image',
}
