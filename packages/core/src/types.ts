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
import { type Config as svgoConfig } from 'svgo'
import { IMG_FORMATS_ENUM } from './constants'
import { UserConfig } from 'vite'

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
  /** Compression quality */
  quality: number
  /** Whether to enable in development environment */
  enableDev: boolean
  /** Whether to enable WebP in development environment */
  enableDevWebp: boolean
  /** Whether to enable WebP during build */
  enableWebp: boolean
  /** Include patterns */
  includes: string | RegExp
  /** Exclude patterns */
  excludes: string | RegExp
  /** Development environment image cache directory, default: node_modules/.cache/vite-plugin-image */
  cacheDir: string
  /** Sharp configuration */
  sharpConfig: sharpConfigType
  /** SVGO configuration */
  svgoConfig: svgoConfig
  compatibility: boolean
  bodyWebpClassName: string
  /** File size limit, files <= this value will not be compressed or converted */
  limitSize?: number
  /** Whether to print logs, default: true */
  log?: boolean
  /** Whether to print debug logs */
  debugLog?: boolean
  /**
   * Filter function
   * @param path Image path
   */
  filter?: (path: string) => boolean
  /** Build WebP configuration */
  webpConfig?: {
    /**
     * Filter function
     * @param path Image path
     */
    filter?: (path: string) => boolean
    /** Whether to delete original image */
    deleteOriginImg?: boolean
    /** File size limit, files <= this value will not be compressed or converted */
    limitSize?: number
  }
  /** Sprite image configuration */
  spritesConfig?: {
    rules: {
      /** Directory */
      dir: string
      /** Output directory */
      outputDir?: string
      /** Suffix, default: sprites */
      suffix?: string
      padding?: number
      /** CSS scaling */
      scale?: number
      algorithm?:
        | 'top-down'
        | 'left-right'
        | 'diagonal'
        | 'alt-diagonal'
        | 'binary-tree'
    }[]
    /** Output directory */
    outputDir?: string
    /** Include patterns */
    includes?: string | RegExp
    /** Exclude patterns */
    excludes?: string | RegExp
    /** Suffix, default: sprites */
    suffix?: string
    algorithm?:
      | 'top-down'
      | 'left-right'
      | 'diagonal'
      | 'alt-diagonal'
      | 'binary-tree'
    aliasPath?: string
    /**
     * Unit conversion
     * @param unit unit
     * @param filePath single image path
     */
    transformUnit?: (unit: number, filePath: string) => string
    /**
     * Root value, conversion unit for rem
     */
    rootValue?: number
    /** Whether to delete original images */
    deleteOriginImg?: boolean
  }
  /** Public image configuration */
  publicConfig?: {
    enable?: boolean
    /** Compression quality */
    quality?: number
    /** File size limit, files <= this value will not be compressed or converted */
    limitSize?: number
  }
  /** Image assets directory, compatible with vite@4.x version not finding original image paths */
  imgAssetsDir?: string | string[]
  viteConfig?: UserConfig
  isBuild?: boolean
}

export type ImgFormatType = keyof typeof IMG_FORMATS_ENUM

export type SharpImgFormatType = Exclude<ImgFormatType, 'svg'>

export type SharpOptionsType = sharpConfigType[keyof sharpConfigType]

export interface SpritesStylesType {
  coordinates: {
    [key: string]: {
      x: number
      y: number
      width: number
      height: number
    }
  }
  properties: {
    width: number
    height: number
  }
  image?: Buffer
  outPathName: string
  outputDir?: string
  referenceId?: string
}