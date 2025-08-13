import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import {
    filterImage,
    handleFilterPath,
    handleReplaceWebp,
    getCacheKey,
    getGlobalConfig,
    replaceWebpExt,
    filterChunkImage,
    getImgWebpMap,
    isAsyncFunction
} from './utils'
import sharp, { type FormatEnum } from 'sharp'
import { existsSync, readdirSync, readFileSync, writeFile } from 'fs'
import type {
    ImgFormatType,
    SharpImgFormatType,
    SharpOptionsType
} from './types'
import { transformWebpExtInCss } from './transform'
import { optimize } from 'svgo'

function formatJPGExt(type: string): ImgFormatType {
    const ext = type.includes('.') ? type.replace('.', '') : type
    return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
        ? 'jpeg'
        : (ext as ImgFormatType)
}

export async function pressBufferToImage(
    buffer: Buffer,
    type: ImgFormatType,
    opt?: SharpOptionsType
) {
    const key = formatJPGExt(type)

    const globalConfig = getGlobalConfig()
    const options = Object.assign({ quality: globalConfig.quality }, opt || {})
    if (options.quality >= 100) {
        return buffer
    }
    const newBuffer = await sharp(buffer).toFormat(key, options).toBuffer()

    return newBuffer
}

export async function processImage(filePath: string) {
    const {
        enableDevWebp,
        quality,
        enableWebp,
        cacheDir,
        sharpConfig,
        filter,
        webpConfig
    } = getGlobalConfig()
    const { ext, name } = parse(filePath)

    let buildWebp = false
    if (enableDevWebp && webpConfig && webpConfig.filter) {
        if (webpConfig.filter instanceof Function) {
            if (isAsyncFunction(webpConfig.filter)) {
                buildWebp = await webpConfig.filter(filePath)
            } else {
                buildWebp = webpConfig.filter(filePath)
            }
        }
    }

    const type =
        enableDevWebp && buildWebp
            ? IMG_FORMATS_ENUM.webp
            : (ext.replace('.', '') as ImgFormatType)

    const file = readFileSync(filePath)
    const cacheKey = getCacheKey(
        {
            name,
            type,
            content: file
        },
        {
            quality,
            enableWebp,
            sharpConfig,
            enableDevWebp,
            type,
            isFilter: !!filter
        }
    )
    const cachePath = join(cacheDir, cacheKey)

    // read cache
    if (existsSync(cachePath)) {
        return { buffer: readFileSync(cachePath), type }
    }

    const buffer = readFileSync(filePath)

    const newBuffer = await pressBufferToImage(
        buffer,
        type,
        sharpConfig[type as SharpImgFormatType]
    )

    if (!newBuffer) {
        return
    }

    writeFile(cachePath, newBuffer, () => {})

    return { buffer: newBuffer, type }
}

export async function handleImgBundle(bundle: any) {
    const webpMap = getImgWebpMap()

    for (const key in bundle) {
        const chunk = bundle[key] as any
        const { ext } = parse(key)
        const { enableWebp, sharpConfig, filter, compatibility } =
            getGlobalConfig()

        if (/(js|css)$/.test(key) && enableWebp) {
            if (compatibility) {
                if (/(css)$/.test(key)) {
                    chunk.source = await transformWebpExtInCss(chunk.source)
                }
            } else {
                if (/(js)$/.test(key)) {
                    chunk.code = handleReplaceWebp(chunk.code)
                } else if (/(css)$/.test(key)) {
                    chunk.source = handleReplaceWebp(chunk.source)
                }
            }
        }
        const isTrue = await filterChunkImage(chunk)
        if (!isTrue) {
            continue
        }

        const format = ext.replace('.', '') as ImgFormatType
        const isSvg = format === IMG_FORMATS_ENUM.svg
        // 是否转webp
        const transformWebp = enableWebp && webpMap[parse(key).base]

        if (transformWebp) {
            try {
                const webpBuffer = await pressBufferToImage(
                    chunk.source,
                    IMG_FORMATS_ENUM.webp,
                    sharpConfig[IMG_FORMATS_ENUM.webp]
                )
                const webpName = replaceWebpExt(key)
                const webpChunk = structuredClone(chunk)
                webpChunk.source = webpBuffer
                webpChunk.fileName = webpName
                bundle[webpName] = webpChunk
            } catch (error) {
                throw new Error(`Error processing image ${key}: ${error}`)
            }
        }
        // 如果转webp&不兼容，就去掉原图
        if (transformWebp && !compatibility) {
            delete bundle[key]
            continue
        }
        if (chunk.source && chunk.source instanceof Buffer) {
            const pressBuffer = isSvg
                ? await compressSvg(chunk.source)
                : await pressBufferToImage(
                      chunk.source,
                      format,
                      sharpConfig[format]
                  )
            chunk.source = pressBuffer
        }
    }
}

export async function compressSvg(svg: string) {
    const { svgoConfig } = getGlobalConfig()
    try {
        const result = optimize(svg, svgoConfig)

        return Buffer.from(result.data)
    } catch (error) {
        console.error('svg compress failed:', error)
        throw error
    }
}
