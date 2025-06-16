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
    quality: number
    enableDev: boolean
    enableDevWebp: boolean
    enableWebp: boolean
    includes: string | RegExp
    excludes: string | RegExp
    cacheDir: string
    sharpConfig: sharpConfigType
    svgoConfig: svgoConfig
    compatibility: boolean
    bodyWebpClassName: string
    filter?: (path: string) => boolean
    spriteConfig?: {
        spriteDir?: string | string[]
        includes?: string | RegExp
        excludes?: string | RegExp
        suffix?: string
        algorithm?: 'top-down' | 'left-right' | 'diagonal' | 'alt-diagonal' | 'binary-tree'
    }
}

export type ImgFormatType = keyof typeof IMG_FORMATS_ENUM

export type SharpImgFormatType = Exclude<ImgFormatType, 'svg'>

export type SharpOptionsType = sharpConfigType[keyof sharpConfigType]
