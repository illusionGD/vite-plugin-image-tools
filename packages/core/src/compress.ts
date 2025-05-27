import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import {
  filterImage,
  handleFilterPath,
  handleReplaceWebp,
  getCacheKey,
  getGlobalConfig,
  replaceWebpExt
} from './utils'
import sharp, { type FormatEnum } from 'sharp'
import { existsSync, readdirSync, readFileSync, statSync, writeFile } from 'fs'
import { ImgFormatType, SharpOptionsType } from './types'
import { transformWebpExtInCss } from './transform'
import { optimize } from 'svgo'

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
    const { enableWebp, sharpConfig, filter, compatibility } = getGlobalConfig()

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

    if (!filterImage(key)) {
      continue
    }

    const isTrue = await handleFilterPath(chunk.originalFileNames[0])

    if (!isTrue) {
      continue
    }
    const format = ext.replace('.', '') as ImgFormatType
    const isSvg = format === IMG_FORMATS_ENUM.svg
    if (chunk.source && chunk.source instanceof Buffer) {
      const pressBuffer = isSvg
        ? await compressSvg(chunk.source)
        : await pressBufferToImage(chunk.source, format, sharpConfig[format])
      chunk.source = pressBuffer
    }

    if (enableWebp) {
      const webpBuffer =await pressBufferToImage(
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

export async function compressSvg(svg: string) {
  const { sharpConfig } = getGlobalConfig()
  try {
    const result = optimize(
      svg,
      sharpConfig.svg || {
        plugins: [
          'preset-default',
          { name: 'removeXMLNS' },
          { name: 'removeViewBox' }
        ],
        js2svg: {
          pretty: false,
          indent: 0
        }
      }
    )

    return Buffer.from(result.data)
  } catch (error) {
    console.error('svg compress failed:', error)
    throw error
  }
}
