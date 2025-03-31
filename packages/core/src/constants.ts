import type { PluginOptions } from './types'
import { AnyObject } from './types'

export const IMG_FORMATS_ENUM: AnyObject = {
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpeg',
  webp: 'webp'
} as const

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
  enableWebp: false,
  regExp: `\\.(${imgFormats.join('|')})$`,
  include: imgFormats,
  cacheDir: 'node_modules/.cache/vite-plugin-image'
}
