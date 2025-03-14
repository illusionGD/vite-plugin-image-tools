import path, { join, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { filterImage, formatBytes } from './utils'
import sharp from 'sharp'
import { existsSync, readdirSync, readFileSync, statSync, writeFile } from 'fs'
import { getCacheKey } from './cache'

function checkJPGExt(type: string) {
    const ext = type.includes('.') ? type.replace('.', '') : type
    return ext === IMG_FORMATS_ENUM.jpg || ext === IMG_FORMATS_ENUM.jpeg
        ? 'jpeg'
        : ext
}

export async function pressImage(filePath: string, { type, quality }: any) {
    // filter image
    if (!filterImage(filePath)) {
        return
    }
    // get buffer
    const buffer = readFileSync(filePath)
    const { ext } = parse(filePath)
    const key = checkJPGExt(type)
    if (ext.replace('.', '') === type) {
        return buffer
    }
    return (await sharp(buffer)[key]({ quality }).toBuffer()) as Buffer
}

export async function pressBufferToImage(
    buffer: Buffer,
    { type, quality }: any
) {
    const key = checkJPGExt(type)

    const newBuffer = await sharp(buffer)[key]({ quality }).toBuffer()

    return newBuffer
}

export async function processImage(filePath: string) {
    const { enableDevWebp, quality, enableWebP, cacheDir } = DEFAULT_CONFIG
    const { ext, name } = parse(filePath)
    const type = enableDevWebp ? IMG_FORMATS_ENUM.webp : ext.replace('.', '')
    const file = readFileSync(filePath)
    const cacheKey = getCacheKey({
        name,
        type,
        content: file,
        quality,
        enableWebP,
    })
    const cachePath = join(cacheDir, cacheKey)
    // 检查是否又缓存
    if (existsSync(cachePath)) {
        return readFileSync(cachePath)
    }

    const buffer = await pressImage(filePath, {
        type,
        quality,
    })

    if (!buffer) {
        return
    }
    // 缓存图片
    writeFile(cachePath, buffer, () => {})
    return buffer
}
