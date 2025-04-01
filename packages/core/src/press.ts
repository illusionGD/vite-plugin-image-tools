import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { filterImage, formatBytes, replaceWebpExt } from './utils'
import sharp from 'sharp'
import { existsSync, readdirSync, readFileSync, statSync, writeFile } from 'fs'
import { handleReplaceWebp, getCacheKey } from './cache'

function checkJPGExt(type: string) {
  const ext = type.includes('.') ? type.replace('.', '') : type
  return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
    ? 'jpeg'
    : ext
}

export async function pressBufferToImage(
  buffer: Buffer,
  { type, quality }: any
) {
  const key = checkJPGExt(type)

  const newBuffer = await sharp(buffer)
    .toFormat(key as any, { quality })
    .toBuffer()

  return newBuffer
}

export async function pressImage(filePath: string, { type, quality }: any) {
  const buffer = readFileSync(filePath)
  const { ext } = parse(filePath)

  if (ext.replace('.', '') === type) {
    return buffer
  }

  return await pressBufferToImage(buffer, {
    type,
    quality
  })
}

export async function processImage(filePath: string) {
  const { enableDevWebp, quality, enableWebp, cacheDir } = DEFAULT_CONFIG
  const { ext, name } = parse(filePath)
  const type = enableDevWebp ? IMG_FORMATS_ENUM.webp : ext.replace('.', '')
  const file = readFileSync(filePath)
  const cacheKey = getCacheKey({
    name,
    type,
    content: file,
    quality,
    enableWebp
  })
  const cachePath = join(cacheDir, cacheKey)

  if (existsSync(cachePath)) {
    return readFileSync(cachePath)
  }

  const buffer = await pressImage(filePath, {
    type,
    quality
  })

  if (!buffer) {
    return
  }
  writeFile(cachePath, buffer, () => {})
  return buffer
}

export async function handleImgBundle(bundle: any) {
  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { ext } = parse(key)
    const { quality, enableWebp } = DEFAULT_CONFIG

    if (/(js|css|html)$/.test(key) && enableWebp) {
      if (/(js)$/.test(key)) {
        chunk.code = handleReplaceWebp(chunk.code)
      } else if (/(css|html)$/.test(key)) {
        chunk.source = handleReplaceWebp(chunk.source)
      }
    }

    if (!filterImage(key)) {
      continue
    }

    if (chunk.source && chunk.source instanceof Buffer) {
      const pressBuffer = await pressBufferToImage(chunk.source, {
        type: ext,
        quality
      })
      chunk.source = pressBuffer
    }

    if (enableWebp) {
      const webpBuffer = await pressBufferToImage(chunk.source, {
        type: IMG_FORMATS_ENUM.webp,
        quality
      })
      const webpName = replaceWebpExt(key)
      const webpChunk = structuredClone(chunk)
      webpChunk.source = webpBuffer
      webpChunk.fileName = webpName
      bundle[webpName] = webpChunk
    }
  }
}
