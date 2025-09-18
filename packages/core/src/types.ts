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
    /** 压缩质量 */
    quality: number
    /** 开发环境是否开启 */
    enableDev: boolean
    /** 开发环境是否开启webp */
    enableDevWebp: boolean
    /** 打包是否开启webp */
    enableWebp: boolean
    /** 包含 */
    includes: string | RegExp
    /** 排除 */
    excludes: string | RegExp
    /** 开发环境图片缓存路径，默认node_modules/.cache/vite-plugin-image */
    cacheDir: string
    /** sharp配置 */
    sharpConfig: sharpConfigType
    /** svgo配置 */
    svgoConfig: svgoConfig
    compatibility: boolean
    bodyWebpClassName: string
    /** 是否打印日志，默认true */
    log: boolean
    /**
     * 过滤函数
     * @param path 图片路径
     */
    filter?: (path: string) => boolean
    /** 打包webp配置 */
    webpConfig?: {
        /**
         * 过滤函数
         * @param path 图片路径
         */
        filter?: (path: string) => boolean
    }
    /** 精灵图配置 */
    spritesConfig?: {
        rules: {
            /** 文件夹 */
            dir: string
            /** 后缀，默认sprites */
            suffix?: string
            padding?: number
            /** 压缩质量 */
            quality?: number
            /** css缩放 */
            scale?: number
            algorithm?:
                | 'top-down'
                | 'left-right'
                | 'diagonal'
                | 'alt-diagonal'
                | 'binary-tree'
        }[]
        /** 包含 */
        includes?: string | RegExp
        /** 排除 */
        excludes?: string | RegExp
        /** 后缀，默认sprites */
        suffix?: string
        algorithm?:
            | 'top-down'
            | 'left-right'
            | 'diagonal'
            | 'alt-diagonal'
            | 'binary-tree'
        /**
         * 单位转换
         * @param unit 单位px
         * @param filePath 单张图片的路径
         * @returns
         */
        transformUnit?: (unit: string, filePath: string) => string
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
    outPathName: string
}
