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
  compressCache,
  filterImage
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
import { UserConfig } from 'vite'
import { cwd } from 'process'
import { stat } from 'fs/promises'

/** Format jpeg extension */
function formatJPGExt(type: string): ImgFormatType {
  const ext = type.includes('.') ? type.replace('.', '') : type
  return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
    ? 'jpeg'
    : (ext as ImgFormatType)
}

function deepClone<T>(value: T, seen = new Map<any, any>()): T {
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (seen.has(value)) {
    return seen.get(value)
  }
  if (Buffer.isBuffer(value)) {
    return Buffer.from(value) as any
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as any
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as any
  }
  if (value instanceof Map) {
    const result = new Map()
    seen.set(value, result)
    value.forEach((val, key) => {
      result.set(deepClone(key, seen), deepClone(val, seen))
    })
    return result as any
  }
  if (value instanceof Set) {
    const result = new Set()
    seen.set(value, result)
    value.forEach((val) => {
      result.add(deepClone(val, seen))
    })
    return result as any
  }
  if (ArrayBuffer.isView(value)) {
    return new (value.constructor as any)(value as any) as any
  }
  if (value instanceof ArrayBuffer) {
    return value.slice(0) as any
  }

  const result: any = Array.isArray(value) ? [] : {}
  seen.set(value, result)

  for (const key of Object.keys(value as any)) {
    result[key] = deepClone((value as any)[key], seen)
  }

  return result
}

/** Compress image buffer */
export async function pressBufferToImage(
  buffer: Buffer,
  type: ImgFormatType,
  opt?: SharpOptionsType
) {
  const key = formatJPGExt(type)

  const globalConfig = getGlobalConfig()
  const options = Object.assign({ quality: globalConfig.quality }, opt || {})
  const { format } = await sharp(buffer).metadata()
  if (options.quality >= 100 && format && format.includes(type)) {
    return buffer
  }
  const newBuffer = await sharp(
    buffer,
    key === 'gif' ? { animated: true } : undefined
  )
    .toFormat(key, options)
    .toBuffer()

  return newBuffer
}

const devNoChangeFiles: string[] = []

/**
 * Process image in development
 * @param filePath file path
 */
export async function processImage(filePath: string) {
  const {
    enableDevConvert,
    quality,
    cacheDir,
    sharpConfig,
    filter,
    convert
  } = getGlobalConfig()
  const { ext, name } = parse(filePath)

  // Read file path that should not be converted, return original image data
  if (devNoChangeFiles.includes(filePath)) {
    const file = readFileSync(filePath)
    return { buffer: file, type: ext.replace('.', '') }
  }

  const enableMainWebp = convert.enable && convert.format === IMG_FORMATS_ENUM.webp
  let shouldConvertToMainFormat = false
  if (enableDevConvert && enableMainWebp && !ext.includes(IMG_FORMATS_ENUM.webp) && !ext.includes(IMG_FORMATS_ENUM.gif)) {
    if (convert.filter) {
      shouldConvertToMainFormat = await convert.filter(filePath)
    } else {
      shouldConvertToMainFormat = true
    }
  }

  // @en Conversion size threshold in dev mode.
  // @zh 开发态格式转换大小阈值。
  const buffer = readFileSync(filePath)
  if (
    enableDevConvert &&
    shouldConvertToMainFormat &&
    buffer &&
    convert?.limitSize &&
    buffer.length <= convert.limitSize
  ) {
    return { buffer, type: ext.replace('.', '') }
  }

  const type =
    enableDevConvert && shouldConvertToMainFormat
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
      enableConvert: enableMainWebp,
      sharpConfig,
      enableDevConvert,
      type,
      isFilter: !!filter
    }
  )
  const cachePath = join(cacheDir, cacheKey)

  // read cache
  if (existsSync(cachePath)) {
    return { buffer: readFileSync(cachePath), type }
  }

  const newBuffer = await pressBufferToImage(
    buffer,
    type,
    sharpConfig[type as SharpImgFormatType]
  )
  

 
  if (!newBuffer) {
    return
  }

  // If compressed image is larger than original, return original image data
  if (buffer.length < newBuffer.length) {
    // Cache path to avoid repeated compression

    devNoChangeFiles.push(filePath)
    return { buffer, type: ext.replace('.', '') }
  }

  writeFile(cachePath, newBuffer, () => {})

  return { buffer: newBuffer, type }
}

/** Process image bundle, compress & convert to webp */
export async function handleImgBundle(bundle: any) {
  const webpMap = getImgWebpMap()

  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { ext, base } = parse(key)
    const { sharpConfig, compatibility, convert } =
      getGlobalConfig()
    const enableMainWebp =
      convert.enable && convert.format === IMG_FORMATS_ENUM.webp

    if (/(js|css)$/.test(key) && enableMainWebp) {
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
    // Whether to convert to webp
    const transformWebp = enableMainWebp && webpMap[parse(key).base]
    const originBuffer = chunk.source as any

    if (transformWebp) {
      try {
        const webpName = replaceWebpExt(key)
        const webpChunk = deepClone(chunk)
        const webpBuffer =
          compressCache[webpName] ||
          (await pressBufferToImage(
            webpChunk.source,
            IMG_FORMATS_ENUM.webp,
            sharpConfig[IMG_FORMATS_ENUM.webp]
          ))

        webpChunk.source = webpBuffer
        webpChunk.fileName = webpName
        bundle[webpName] = webpChunk
        // Cache
        compressCache[webpName] = webpChunk.source

        if (!compressCache[webpName]) {
          logSize.push({
            fileName: base,
            webpName: replaceWebpExt(base),
            originSize: originBuffer.length,
            compressSize: webpBuffer.length
          })
        }
      } catch (error) {
        throw new Error(`Error processing image ${key}: ${error}`)
      }
    }

    // If converted to webp and not compatible, remove original image
    const { deleteOriginImg } = convert || {}
    if (transformWebp && !compatibility && deleteOriginImg) {
      delete bundle[key]
      continue
    }

    // Compress original image
    if (originBuffer && originBuffer instanceof Buffer) {
      // Read cache
      if (compressCache[chunk.fileName]) {
        chunk.source = compressCache[chunk.fileName]
        continue
      }
      const pressBuffer = isSvg
        ? await compressSvg(chunk.source)
        : await pressBufferToImage(originBuffer, format, sharpConfig[format])

      // Compare size before and after compression, do not replace if compressed is larger
      if (originBuffer.length > pressBuffer.length) {
        logSize.push({
          fileName: base,
          originSize: originBuffer.length,
          compressSize: pressBuffer.length
        })
        chunk.source = pressBuffer

        // Cache
        compressCache[chunk.fileName] = chunk.source
      }
    }
  }
}
/** Compress svg image */
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
interface PublicImgBundleType {
  /** Original image path */
  originPath: string
  /** Compressed image buffer */
  buffer: Buffer<ArrayBufferLike>
}

export async function handlePublicImg(viteConfig: UserConfig) {
  const publicDir = join(cwd(), viteConfig.publicDir || 'public')
  // Get images under public directory
  const bundle: PublicImgBundleType[] = []
  const { sharpConfig, publicConfig, limitSize } = getGlobalConfig()
  const collectionBundle = async (dir: string) => {
    const files = readdirSync(dir)
    for (let index = 0; index < files.length; index++) {
      const filePath = join(dir, files[index])
      const stats = await stat(filePath)
      if (stats.isDirectory()) {
        await collectionBundle(filePath)
      } else {
        const { ext } = parse(filePath)
        const isImg = await filterImage(filePath)
        if (!isImg) {
          continue
        }
        const buffer = readFileSync(filePath)
        const limit = publicConfig?.limitSize || limitSize
        if (limit && buffer.length <= limit) {
          continue
        }
        const format = ext.replace('.', '') as ImgFormatType
        const isSvg = format === IMG_FORMATS_ENUM.svg
        const quality = publicConfig && publicConfig.quality

        if (
          quality &&
          !isSvg &&
          format !== IMG_FORMATS_ENUM.gif &&
          sharpConfig[format]
        ) {
          sharpConfig[format].quality = quality
        }

        const pressBuffer = isSvg
          ? await compressSvg(buffer as unknown as string)
          : await pressBufferToImage(buffer, format, sharpConfig[format])
        logSize.push({
          fileName: files[index],
          originSize: buffer.length,
          compressSize: pressBuffer.length
        })
        bundle.push({
          originPath: filePath,
          buffer: pressBuffer.length < buffer.length ? pressBuffer : buffer
        })
      }
    }
  }

  await collectionBundle(publicDir)

  const outDir = join(cwd(), viteConfig.build?.outDir || 'dist')
  // Output images
  bundle.forEach(({ originPath, buffer }) => {
    const outputPath = originPath.replace(publicDir, outDir)
    writeFile(outputPath, buffer, (err) => {})
  })
}
