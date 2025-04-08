import type {
  FormatEnum,
  WebpOptions,
  PngOptions,
  Jp2Options,
  JpegOptions,
  JxlOptions,
  AvifOptions,
  TiffOptions,
  GifOptions,
  OutputOptions
} from 'sharp'

export type AnyObject = {
  [key: string | number | symbol]: any
}

interface sharpConfigType {
  jpeg?: JpegOptions
  jpg?: JpegOptions
  png?: PngOptions
  webp?: WebpOptions
  avif?: AvifOptions
  tiff?: TiffOptions
  gif?: GifOptions
}

export type PluginOptions = {
  quality: number
  enableDev: boolean
  enableDevWebp: boolean
  enableWebp: boolean
  include: string[]
  cacheDir: string
  sharpConfig: sharpConfigType
  filter?: (path: string) => boolean
}

export type ImgFormatType = keyof sharpConfigType

export type SharpOptionsType = sharpConfigType[keyof sharpConfigType]
