import { extname, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { pressBufferToImage } from './press'
import { addImgWebpMap, getImgWebpMap } from './cache'

/**
 * 将字节数转换为人性化的字符串
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * just include image
 * @param ImageType image type：png jpeg jpg webp ....
 */
export function filterImage(filePath: string) {
    const reg = new RegExp(DEFAULT_CONFIG.regExp)

    return reg.test(filePath)
}

export function deepClone(obj: any) {
    if (!obj || typeof obj !== 'object') {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone(obj))
    }

    const newObj = {}

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = deepClone(obj[key])
        }
    }

    return newObj
}

export function handleImgMap(bundle: any) {
    for (const key in bundle) {
        const chunk = bundle[key] as any

        if (!filterImage(key)) {
            continue
        }
        const { fileName } = chunk
        const { base } = parse(fileName)
        addImgWebpMap(base)
    }
}

/**
 * 处理image的bundle，压缩图片buffer & 添加或替换图片的webp chunk
 * @param bundle
 */
export async function handleImgBundle(bundle: any) {
    for (const key in bundle) {
        const chunk = bundle[key] as any
        const { ext } = parse(key)
        const { quality, enableWebP } = DEFAULT_CONFIG

        if (/(js|css|html)$/.test(key) && enableWebP) {
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
                quality,
            })
            chunk.source = pressBuffer
        }

        // 添加webp图片输出
        if (enableWebP) {
            const webpBuffer = await pressBufferToImage(chunk.source, {
                type: IMG_FORMATS_ENUM.webp,
                quality,
            })
            const webpName = replaceWebpExt(key)
            const webpChunk = structuredClone(chunk)
            webpChunk.source = webpBuffer
            webpChunk.fileName = webpName
            bundle[webpName] = webpChunk
        }
    }
}

export function handleReplaceWebp(str: string) {
    const map = getImgWebpMap()
    let temp = str
    for (const key in map) {
        temp = temp.replace(new RegExp(key, 'g'), map[key])
    }
    return temp
}

export function replaceWebpExt(url: string) {
    const [path, query] = url.split('?')
    const ext = extname(path)

    const newPath = url.replace(ext, '.webp')
    return query ? `${newPath}?${query}` : newPath
}
