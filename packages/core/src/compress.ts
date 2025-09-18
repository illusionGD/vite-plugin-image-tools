import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import {
    handleReplaceWebp,
    getCacheKey,
    getGlobalConfig,
    replaceWebpExt,
    filterChunkImage,
    getImgWebpMap,
    isAsyncFunction,
    compressCache
} from './utils'
import sharp, { type FormatEnum } from 'sharp'
import { existsSync, readdirSync, readFileSync, writeFile } from 'fs'
import type {
    AnyObject,
    ImgFormatType,
    SharpImgFormatType,
    SharpOptionsType
} from './types'
import { transformWebpExtInCss } from './transform'
import { logSize } from './log'

/** 格式化jpeg后缀 */
function formatJPGExt(type: string): ImgFormatType {
    const ext = type.includes('.') ? type.replace('.', '') : type
    return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
        ? 'jpeg'
        : (ext as ImgFormatType)
}

/** 压缩图片buffer */
export async function pressBufferToImage(
    buffer: Buffer,
    type: ImgFormatType,
    opt?: SharpOptionsType
) {
    const key = formatJPGExt(type)

    const globalConfig = getGlobalConfig()
    const options = Object.assign({ quality: globalConfig.quality }, opt || {})
    const {format} = await sharp(buffer).metadata()
    if (options.quality >= 100 && format && format.includes(type)) {
        return buffer
    }
    const newBuffer = await sharp(buffer).toFormat(key, options).toBuffer()

    return newBuffer
}

const devNoChangeFiles: string[] = []

/**
 * 处理开发时的图片
 * @param filePath
 */
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

    // 读取不转换记录的文件路径，返回原图数据
    if (devNoChangeFiles.includes(filePath)) {
        const file = readFileSync(filePath)
        return { buffer: file, type: ext.replace('.', '') }
    }

    let buildWebp = false
    if (
        enableDevWebp &&
        !ext.includes(IMG_FORMATS_ENUM.webp) &&
        webpConfig &&
        webpConfig.filter
    ) {
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

    // 如果转化压缩后比原体积大，则返回原图数据
    if (buffer.length < newBuffer.length) {
        // 缓存路径，避免下次重复打包压缩
        devNoChangeFiles.push(filePath)
        return { buffer, type: ext.replace('.', '') }
    }

    writeFile(cachePath, newBuffer, () => {})

    return { buffer: newBuffer, type }
}

/** 处理图片bundle，压缩&转webp */
export async function handleImgBundle(bundle: any) {
    const webpMap = getImgWebpMap()

    for (const key in bundle) {
        const chunk = bundle[key] as any
        const { ext, base } = parse(key)
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
                const webpBuffer =
                    compressCache[chunk.fileName] ||
                    (await pressBufferToImage(
                        chunk.source,
                        IMG_FORMATS_ENUM.webp,
                        sharpConfig[IMG_FORMATS_ENUM.webp]
                    ))
                const webpName = replaceWebpExt(key)
                const webpChunk = structuredClone(chunk)
                webpChunk.source = webpBuffer
                webpChunk.fileName = webpName
                bundle[webpName] = webpChunk
                // 缓存
                compressCache[chunk.fileName] = webpChunk.source

                if (!compressCache[chunk.fileName]) {
                    logSize.push({
                        fileName: base,
                        webpName: replaceWebpExt(base),
                        originSize: chunk.source.length,
                        compressSize: webpBuffer.length
                    })
                }
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
            // 读缓存
            if (compressCache[chunk.fileName]) {
                chunk.source = compressCache[chunk.fileName]
                continue
            }
            const pressBuffer = isSvg
                ? await compressSvg(chunk.source)
                : await pressBufferToImage(
                      chunk.source,
                      format,
                      sharpConfig[format]
                  )
            // 比对前后压缩大小，如果压缩后更大则不替换
            if (chunk.source.length > pressBuffer.length) {
                logSize.push({
                    fileName: base,
                    originSize: chunk.source.length,
                    compressSize: pressBuffer.length
                })
                chunk.source = pressBuffer
                // 缓存
                compressCache[chunk.fileName] = chunk.source
            }
        }
    }
}
/** 压缩svg图片 */
export async function compressSvg(svg: string) {
    const { svgoConfig } = getGlobalConfig()
    try {
        const { optimize } = (await import('svgo')).default
        const result = optimize(svg, svgoConfig)

        return Buffer.from(result.data)
    } catch (error) {
        console.error('svg compress failed:', error)
        throw error
    }
}
