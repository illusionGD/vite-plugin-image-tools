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
  /** 
   * @en Compression quality, default: 80
   * @zh 压缩质量，默认值：80
   */
  quality: number

  /** 
   * @en Whether to enable in development environment
   * @zh 是否在开发环境启用
   */
  enableDev: boolean

  /** 
   * @en Whether to enable WebP in development environment
   * @zh 是否在开发环境启用 WebP
   */
  enableDevWebp: boolean

  /** 
   * @en Whether to enable WebP during build
   * @zh 是否在构建时启用 WebP
   */
  enableWebp: boolean

  /** 
   * @en Include patterns
   * @zh 包含规则
   */
  includes: string | RegExp

  /** 
   * @en Exclude patterns
   * @zh 排除规则
   */
  excludes: string | RegExp

  /** 
   * @en Development image cache directory, default: node_modules/.cache/vite-plugin-image
   * @zh 开发环境图片缓存目录，默认为 node_modules/.cache/vite-plugin-image
   */
  cacheDir: string

  /** 
   * @en Sharp library configuration
   * @zh Sharp 图片处理库配置
   */
  sharpConfig: sharpConfigType

  /** 
   * @en SVGO configuration
   * @zh SVGO 配置
   */
  svgoConfig: svgoConfig

  /** 
   * @en Compatibility mode
   * @zh 兼容性模式
   */
  compatibility: boolean

  /** 
   * @en Class name added to body element when WebP is supported
   * @zh 当支持 WebP 时添加到 body 的类名
   */
  bodyWebpClassName: string

  /** 
   * @en File size limit, files <= this value will not be compressed or converted
   * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
   */
  limitSize?: number

  /** 
   * @en Whether to print output logs, default: true
   * @zh 是否打印输出日志，默认为 true
   */
  log?: boolean

  /** 
   * @en Whether to print debug logs
   * @zh 是否打印调试日志
   */
  debugLog?: boolean

  /**
   * @en Filter function
   * @zh 过滤函数
   * @param path Image path
   * @zh 图片路径
   */
  filter?: (path: string) => boolean

  /** 
   * @en Build WebP configuration
   * @zh 构建 WebP 配置
   */
  webpConfig?: {
    /**
     * @en Filter function
     * @zh 过滤函数
     * @param path Image path
     * @zh 图片路径
     */
    filter?: (path: string) => boolean

    /** 
     * @en Whether to delete original images
     * @zh 是否删除原图
     */
    deleteOriginImg?: boolean

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
     */
    limitSize?: number
  }

  /** 
   * @en Sprite image configuration
   * @zh 雪碧图配置
   */
  spritesConfig?: {
    rules: {
      /** 
       * @en Directory
       * @zh 目录
       */
      dir: string

      /** 
       * @en Output directory
       * @zh 输出目录
       */
      outputDir?: string

      /** 
       * @en File suffix, default: sprites
       * @zh 文件后缀，默认为 sprites
       */
      suffix?: string

      /** 
       * @en Padding value
       * @zh 图片间距
       */
      padding?: number

      /** 
       * @en CSS scaling
       * @zh CSS 缩放比例
       */
      scale?: number

      /** 
       * @en Spritesmith algorithm
       * @zh 雪碧图布局算法
       */
      algorithm?:
        | 'top-down'
        | 'left-right'
        | 'diagonal'
        | 'alt-diagonal'
        | 'binary-tree'
    }[]

    /** 
     * @en Output directory
     * @zh 输出目录
     */
    outputDir?: string

    /** 
     * @en Include patterns
     * @zh 包含规则
     */
    includes?: string | RegExp

    /** 
     * @en Exclude patterns
     * @zh 排除规则
     */
    excludes?: string | RegExp

    /** 
     * @en File suffix, default: sprites
     * @zh 文件后缀，默认为 sprites
     */
    suffix?: string

    /** 
     * @en Spritesmith algorithm
     * @zh 雪碧图布局算法
     */
    algorithm?:
      | 'top-down'
      | 'left-right'
      | 'diagonal'
      | 'alt-diagonal'
      | 'binary-tree'

    /** 
     * @en Alias path used in CSS
     * @zh 供 CSS 使用的别名路径
     */
    aliasPath?: string

    /**
     * @en Unit conversion function
     * @zh 单位转换函数
     * @param unit Unit value
     * @param filePath Single image path
     */
    transformUnit?: (unit: number, filePath: string) => string

    /** 
     * @en Root value for rem conversion
     * @zh rem 转换的根值
     */
    rootValue?: number

    /** 
     * @en Whether to delete original images
     * @zh 是否删除原图
     */
    deleteOriginImg?: boolean
  }

  /** 
   * @en Public image configuration
   * @zh public 目录图片配置
   */
  publicConfig?: {
    /** 
     * @en Whether to enable
     * @zh 是否启用
     */
    enable?: boolean

    /** 
     * @en Compression quality
     * @zh 压缩质量
     */
    quality?: number

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
     */
    limitSize?: number
  }

  /** 
   * @en Image assets directory, used to fix vite@4.x cannot find original image path
   * @zh 图片资源目录，用于解决 vite@4.x 找不到原始图片路径的问题
   */
  imgAssetsDir?: string | string[]

  /** 
   * @en Vite configuration
   * @zh Vite 配置
   */
  viteConfig?: UserConfig

  /** 
   * @en Whether current environment is build
   * @zh 是否为构建环境
   */
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