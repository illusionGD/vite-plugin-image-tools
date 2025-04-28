import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { filterImage, replaceWebpExt } from './utils'
import sharp, { type FormatEnum } from 'sharp'
import { existsSync, readdirSync, readFileSync, statSync, writeFile } from 'fs'
import {
  handleReplaceWebp,
  getCacheKey,
  getGlobalConfig,
  getImgWebpMap
} from './cache'
import { ImgFormatType, SharpOptionsType } from './types'
import { transformWebpExtInCss } from './transform'

function checkJPGExt(type: string): ImgFormatType {
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
  const key = checkJPGExt(type)

  const globalConfig = getGlobalConfig()
  const options = Object.assign({ quality: globalConfig.quality }, opt || {})
  const newBuffer = await sharp(buffer).toFormat(key, options).toBuffer()

  return newBuffer
}

export async function processImage(filePath: string) {
  const { enableDevWebp, quality, enableWebp, cacheDir, sharpConfig, filter } =
    getGlobalConfig()
  const { ext, name } = parse(filePath)
  const type = enableDevWebp
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
    return readFileSync(cachePath)
  }

  const buffer = readFileSync(filePath)

  const newBuffer = await pressBufferToImage(buffer, type, sharpConfig[type])

  if (!newBuffer) {
    return
  }

  writeFile(cachePath, newBuffer, () => {})

  return newBuffer
}

export async function handleImgBundle(bundle: any) {
  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { ext } = parse(key)
    const { enableWebp, sharpConfig, filter, isAllExtWebp } = getGlobalConfig()

    if (/(js|css|html)$/.test(key) && enableWebp) {
      if (!isAllExtWebp) {
        if (/(css)$/.test(key)) {
          chunk.source = await transformWebpExtInCss(chunk.source)
        }
      } else {
        if (/(js)$/.test(key)) {
          chunk.code = handleReplaceWebp(chunk.code)
        } else if (/(css|html)$/.test(key)) {
          chunk.source = handleReplaceWebp(chunk.source)
        }
      }
    }

    if (!filterImage(key)) {
      continue
    }

    if (filter && filter instanceof Function) {
      const isTrue = filter(chunk.originalFileNames[0])
      if (!isTrue) {
        continue
      }
    }

    if (chunk.source && chunk.source instanceof Buffer) {
      const format = ext.replace('.', '') as ImgFormatType
      const pressBuffer = await pressBufferToImage(
        chunk.source,
        format,
        sharpConfig[format]
      )
      chunk.source = pressBuffer
    }

    if (enableWebp) {
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
    }
  }
}
