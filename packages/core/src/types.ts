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
    /** Compression quality */
    quality: number
    /** Whether to enable in development environment */
    enableDev: boolean
    /** Whether to enable WebP in development environment */
    enableDevWebp: boolean
    /** Whether to enable WebP in production build */
    enableWebp: boolean
    /** Included files */
    includes: string | RegExp
    /** Excluded files */
    excludes: string | RegExp
    /** Cache directory for development environment images (default: node_modules/.cache/vite-plugin-image) */
    cacheDir: string
    /** Sharp configuration */
    sharpConfig: sharpConfigType
    /** SVGO configuration */
    svgoConfig: svgoConfig
    /** Whether to enable compatibility mode */
    compatibility: boolean
    /** CSS class name for WebP body elements */
    bodyWebpClassName: string
    /**
     * Filter function
     * @param path Image path
     */
    filter?: (path: string) => boolean
    /** WebP configuration for production build */
    webpConfig?: {
        /**
         * Filter function
         * @param path Image path
         */
        filter?: (path: string) => boolean
    }
    /** Sprite configuration */
    spritesConfig?: {
        rules: {
            /** Directory */
            dir: string
            /** Suffix (default: 'sprites') */
            suffix?: string
            /** Padding */
            padding?: number
            /** Compression quality */
            quality?: number
            /** CSS scaling */
            scale?: number
            /** Packing algorithm */
            algorithm?:
                | 'top-down'
                | 'left-right'
                | 'diagonal'
                | 'alt-diagonal'
                | 'binary-tree'
        }[]
        /** Included files */
        includes?: string | RegExp
        /** Excluded files */
        excludes?: string | RegExp
        /** Suffix (default: 'sprites') */
        suffix?: string
        /** Packing algorithm */
        algorithm?:
            | 'top-down'
            | 'left-right'
            | 'diagonal'
            | 'alt-diagonal'
            | 'binary-tree'
        /**
         * Unit conversion
         * @param unit Unit in px
         * @param filePath Path of individual image
         * @returns Converted unit string
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
