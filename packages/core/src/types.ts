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
   * @en Whether to delete origin image after conversion, default: false
   * @zh 转换后是否删除原图，默认：false
   */
  deleteOriginImg?: boolean
  /**
   * @en Skip conversion for files <= this size, default: none
   * @zh 文件小于等于该值时跳过转换，默认：无
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
  /** @en Include patterns, default: none. @zh 包含规则，默认：无 */
  includes?: PatternType
  /** @en Exclude patterns, default: none. @zh 排除规则，默认：无 */
  excludes?: PatternType
  filter?: (path: string) => boolean | Promise<boolean>
  /** @en Class prefix, default: 'ui--'. @zh 类名前缀，默认：'ui--' */
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
   * @en Whether to enable in development environment, default: false
   * @zh 是否在开发环境启用，默认：false
   */
  enableDev: boolean

  /** 
   * @en Whether to enable format conversion in development (converts to webp by default), default: false
   * @zh 是否在开发环境启用格式转换（默认转 webp），默认：false
   */
  enableDevConvert: boolean
  /**
   * @en Main-format conversion config, default: { enable: true, format: 'webp', deleteOriginImg: false }
   * @zh 主格式转换配置，默认：{ enable: true, format: 'webp', deleteOriginImg: false }
   */
  convert?: ConvertConfig

  /** 
   * @en Include patterns, default: /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i
   * @zh 包含规则，默认：/\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i
   */
  includes: PatternType

  /** 
   * @en Exclude patterns, default: ''
   * @zh 排除规则，默认：''
   */
  excludes: PatternType

  /** 
   * @en Development image cache directory, default: node_modules/.cache/vite-plugin-image
   * @zh 开发环境图片缓存目录，默认为 node_modules/.cache/vite-plugin-image
   */
  cacheDir: string

  /** 
   * @en Sharp library configuration, default: {}
   * @zh Sharp 图片处理库配置，默认：{}
   */
  sharpConfig: sharpConfigType

  /** 
   * @en SVGO configuration, default: preset-default + removerXMLNS, removeViewBox
   * @zh SVGO 配置，默认：preset-default + removerXMLNS、removeViewBox
   */
  svgoConfig: svgoConfig

  /** 
   * @en Compatibility mode, default: false
   * @zh 兼容性模式，默认：false
   */
  compatibility: boolean

  /** 
   * @en Class name added to body element when WebP is supported, default: 'webp'
   * @zh 当支持 WebP 时添加到 body 的类名，默认：'webp'
   */
  bodyWebpClassName: string

  /** 
   * @en File size limit, files <= this value will not be compressed or converted, default: none
   * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换，默认：无
   */
  limitSize?: number

  /** 
   * @en Whether to print output logs, default: true
   * @zh 是否打印输出日志，默认为 true
   */
  log?: boolean

  /**
   * @en Filter function, default: () => true
   * @zh 过滤函数，默认：() => true
   * @param path Image path
   * @zh 图片路径
   */
  filter?: (path: string) => boolean
  /**
   * @en Per-image resolver, controls quality + format only, default: async () => ({})
   * @zh 单图配置解析器，仅控制质量与格式，默认：async () => ({})
   */
  perImage?: PerImageResolver

  /** 
   * @en Sprite image configuration, default: { rules: [], algorithm: 'binary-tree' }
   * @zh 雪碧图配置，默认：{ rules: [], algorithm: 'binary-tree' }
   */
  spritesConfig?: {
    rules: {
      /** 
       * @en Directory
       * @zh 目录
       */
      dir: string

      /** 
       * @en Output filename (without .png), default: dir name + '-sprites'
       * @zh 输出文件名（不含 .png），默认：dir 名称 + '-sprites'
       */
      name?: string

      /** 
       * @en Output directory, default: same as dir
       * @zh 输出目录，默认：与 dir 相同
       */
      outputDir?: string

      /** 
       * @en Padding value, default: 0
       * @zh 图片间距，默认：0
       */
      padding?: number

      /** 
       * @en CSS scaling, default: 1
       * @zh CSS 缩放比例，默认：1
       */
      scale?: number

      /** 
       * @en Spritesmith algorithm, default: 'binary-tree'
       * @zh 雪碧图布局算法，默认：'binary-tree'
       */
      algorithm?:
        | 'top-down'
        | 'left-right'
        | 'diagonal'
        | 'alt-diagonal'
        | 'binary-tree'
    }[]

    /** 
     * @en Output directory, default: same as rule.dir
     * @zh 输出目录，默认：与 rule.dir 相同
     */
    outputDir?: string

    /** 
     * @en Include patterns, default: none
     * @zh 包含规则，默认：无
     */
    includes?: string | RegExp

    /** 
     * @en Exclude patterns, default: none
     * @zh 排除规则，默认：无
     */
    excludes?: string | RegExp

    /** 
     * @en Output filename (without .png), default: dir name + '-sprites'
     * @zh 输出文件名（不含 .png），默认：dir 名称 + '-sprites'
     */
    name?: string

    /** 
     * @en Spritesmith algorithm, default: 'binary-tree'
     * @zh 雪碧图布局算法，默认：'binary-tree'
     */
    algorithm?:
      | 'top-down'
      | 'left-right'
      | 'diagonal'
      | 'alt-diagonal'
      | 'binary-tree'

    /** 
     * @en Alias path used in CSS, default: 'src'
     * @zh 供 CSS 使用的别名路径，默认：'src'
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
     * @en Root value for rem conversion, default: 1
     * @zh rem 转换的根值，默认：1（用于 rem 转 px）
     */
    rootValue?: number

    /** 
     * @en Whether to delete original images, default: false
     * @zh 是否删除原图，默认：false
     */
    deleteOriginImg?: boolean
  }

  /** 
   * @en Public image configuration
   * @zh public 目录图片配置
   */
  publicConfig?: {
    /** 
     * @en Whether to enable, default: false
     * @zh 是否启用，默认：false
     */
    enable?: boolean

    /** 
     * @en Compression quality, default: 80
     * @zh 压缩质量，默认：80
     */
    quality?: number

    /** 
     * @en File size limit, files <= this value will not be compressed or converted, default: none
     * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换，默认：无
     */
    limitSize?: number
  }

  /** 
   * @en Image assets directory, used to fix vite@4.x cannot find original image path, default: none
   * @zh 图片资源目录，用于解决 vite@4.x 找不到原始图片路径的问题，默认：无
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
   * @en CSS generation rules, default: { rules: [], format: 'css' }
   * @zh CSS 生成功能规则，默认：{ rules: [], format: 'css' }
   */
  cssGen?: {
    rules: CssGenRule[]
    /** @en Output format, default: 'css'. @zh 输出格式，默认：'css' */
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