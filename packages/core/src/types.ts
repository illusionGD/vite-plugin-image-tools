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

export type PatternType = string | RegExp

interface sharpConfigType {
  jpeg?: JpegOptions
  jpg?: JpegOptions
  png?: PngOptions
  webp?: WebpOptions
  avif?: AvifOptions
  tiff?: TiffOptions
  gif?: GifOptions
}

export type ConvertConfig = {
  /**
   * @en Enable main-format conversion. Default true in 4.0.
   * @zh 启用主格式转换。4.0 默认开启。
   */
  enable?: boolean
  /**
   * @en Main output format per image, default webp.
   * @zh 单图主输出格式，默认 webp。
   */
  format?: SharpImgFormatType
  /**
   * @en Whether to delete origin image after conversion.
   * @zh 转换后是否删除原图。
   */
  deleteOriginImg?: boolean
  /**
   * @en Skip conversion for files <= this size.
   * @zh 文件小于等于该值时跳过转换。
   */
  limitSize?: number
  /**
   * @en Optional conversion filter for file path.
   * @zh 单独转换过滤函数。
   */
  filter?: (path: string) => boolean | Promise<boolean>
}

export type PerImageConfig = {
  /**
   * @en Override quality for this image.
   * @zh 覆盖当前图片的压缩质量。
   */
  quality?: number
  /**
   * @en Override main output format for this image.
   * @zh 覆盖当前图片的主输出格式。
   */
  format?: SharpImgFormatType
}

export type PerImageResolver = (
  filePath: string
) => PerImageConfig | Promise<PerImageConfig>

export type CssGenVariantRule = {
  /**
   * @en Regex for matching variant image filename.
   * @zh 匹配变体图文件名的正则。
   */
  regex: RegExp
  /**
   * @en Pseudo selector, e.g. :hover or hover.
   * @zh 伪类，例如 :hover 或 hover。
   */
  pseudo: string
}

export type CssGenRule = {
  inputDir: string
  stylePath: string
  includes?: PatternType
  excludes?: PatternType
  filter?: (path: string) => boolean | Promise<boolean>
  classPrefix?: string
  resolveClass?: (filePath: string, baseName: string) => string
  variantRules?: CssGenVariantRule[]
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
   * @en Whether to enable conversion in development environment
   * @zh 是否在开发环境启用格式转换
   */
  enableDevConvert: boolean
  /**
   * @en Main-format conversion config (4.0).
   * @zh 主格式转换配置（4.0）。
   */
  convert?: ConvertConfig

  /** 
   * @en Include patterns
   * @zh 包含规则
   */
  includes: PatternType

  /** 
   * @en Exclude patterns
   * @zh 排除规则
   */
  excludes: PatternType

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
   * @en Per-image resolver, controls quality + format only.
   * @zh 单图配置解析器，仅控制质量与格式。
   */
  perImage?: PerImageResolver

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
  /**
   * @en CSS generation rules (implemented in milestone E).
   * @zh CSS 生成功能规则（里程碑 E）。
   */
  cssGen?: {
    rules: CssGenRule[]
    format?: 'css'
  }
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