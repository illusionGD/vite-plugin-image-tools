import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import {
  handleReplaceConverted,
  getCacheKey,
  getGlobalConfig,
  replaceExt,
  filterChunkImage,
  getImgConvertMap,
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
import { transformExtInCss } from './transform'
import { logSize } from './log'
import { UserConfig } from 'vite'
import { cwd } from 'process'
import { stat } from 'fs/promises'
import type { PluginContext } from 'rollup'
import { markBundleFileForDeletion } from './bundle-delete'

/** Format jpeg extension */
function formatJPGExt(type: string): ImgFormatType {
  const ext = type.includes('.') ? type.replace('.', '') : type
  return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
    ? 'jpeg'
    : (ext as ImgFormatType)
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
    convert,
    perImage
  } = getGlobalConfig()
  const { ext, name } = parse(filePath)
  const single = await perImage(filePath)
  const singleQuality = single?.quality || quality
  const targetFormat = single?.format || convert.format || IMG_FORMATS_ENUM.webp

  // Read file path that should not be converted, return original image data
  if (devNoChangeFiles.includes(filePath)) {
    const file = readFileSync(filePath)
    return { buffer: file, type: ext.replace('.', '') }
  }

  const enableMainWebp = convert.enable && targetFormat === IMG_FORMATS_ENUM.webp
  let shouldConvertToMainFormat = false
  if (enableDevConvert && !ext.includes(`.${targetFormat}`) && !ext.includes(IMG_FORMATS_ENUM.gif)) {
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
      ? targetFormat
      : (ext.replace('.', '') as ImgFormatType)

  const file = readFileSync(filePath)
  const cacheKey = getCacheKey(
    {
      name,
      type,
      content: file
    },
    {
      quality: singleQuality,
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
    Object.assign({}, sharpConfig[type as SharpImgFormatType], {
      quality: singleQuality
    })
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
export async function handleImgBundle(bundle: any, pluginContext: PluginContext) {
  const convertMap = getImgConvertMap()

  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { ext, base } = parse(key)
    const { sharpConfig, compatibility, convert, perImage, quality } =
      getGlobalConfig()
    const sourcePath = chunk.originalFileNames?.[0] || chunk.fileName || key
    const single = await perImage(join(cwd(), sourcePath))
    const singleQuality = single?.quality || quality
    const targetFormat = single?.format || convert.format || IMG_FORMATS_ENUM.webp
    const enableMainWebp =
      convert.enable && targetFormat === IMG_FORMATS_ENUM.webp

    if (/(js|css)$/.test(key) && enableMainWebp) {
      if (compatibility) {
        if (/(css)$/.test(key)) {
          chunk.source = await transformExtInCss(chunk.source, targetFormat)
        }
      } else {
        if (/(js)$/.test(key)) {
          chunk.code = handleReplaceConverted(chunk.code)
        } else if (/(css)$/.test(key)) {
          chunk.source = handleReplaceConverted(chunk.source)
        }
      }
    }
    const isTrue = await filterChunkImage(chunk)
    if (!isTrue) {
      continue
    }

    const format = ext.replace('.', '') as ImgFormatType
    const isSvg = format === IMG_FORMATS_ENUM.svg
    // Whether to convert to target format
    const transformTarget = !!convertMap[parse(key).base]
    const originBuffer = chunk.source as any

    if (transformTarget) {
      try {
        const convertedName = convertMap[parse(key).base]
          ? key.replace(parse(key).base, convertMap[parse(key).base])
          : replaceExt(key, targetFormat)
        const convertedBuffer =
          compressCache[convertedName] ||
          (await pressBufferToImage(
            chunk.source,
            targetFormat,
            Object.assign({}, sharpConfig[targetFormat], {
              quality: singleQuality
            })
          ))

        pluginContext.emitFile({
          type: 'asset',
          fileName: convertedName,
          name: parse(convertedName).base,
          originalFileName: chunk.originalFileNames?.[0] || chunk.fileName || key,
          source: convertedBuffer
        })
        // Cache
        compressCache[convertedName] = convertedBuffer

        if (!compressCache[convertedName]) {
          logSize.push({
            fileName: base,
            webpName: parse(convertedName).base,
            originSize: originBuffer.length,
            compressSize: convertedBuffer.length
          })
        }
      } catch (error) {
        throw new Error(`Error processing image ${key}: ${error}`)
      }
    }

    // If converted to webp and not compatible, remove original image
    const { deleteOriginImg } = convert || {}
    if (transformTarget && !compatibility && deleteOriginImg) {
      markBundleFileForDeletion(chunk.fileName || key)
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
        : await pressBufferToImage(
            originBuffer,
            format,
            Object.assign({}, sharpConfig[format], { quality: singleQuality })
          )

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
