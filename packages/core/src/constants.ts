import type { ImgFormatType, PluginOptions } from './types'
import { AnyObject } from './types'

export const IMG_FORMATS_ENUM: { [key: string]: ImgFormatType } = {
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpeg',
  webp: 'webp',
  avif: 'avif',
  tiff: 'tiff',
  gif: 'gif'
} as const

const imgFormats: ImgFormatType[] = []
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
  include: imgFormats,
  cacheDir: 'node_modules/.cache/vite-plugin-image',
  sharpConfig: {},
  compatibility: true,
  isAllExtWebp: false,
  bodyWebpClassName: 'v-p-m-t-webp',
  filter: () => true
}
