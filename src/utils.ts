import { parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { pressBufferToImage } from './press'

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

/**
 * 处理image的bundle，压缩图片buffer & 添加或替换图片的webp chunk
 * @param bundle
 */
export async function handleImgBundle(bundle: any) {
    for (const key in bundle) {
        const chunk = bundle[key] as any
        const { ext } = parse(key)
        const { quality, enableWebP } = DEFAULT_CONFIG

        if (!filterImage(key)) {
            continue
        }

        if (chunk.source && chunk.source instanceof Buffer) {
            // 暂时不修改.webp后缀，判断很麻烦，直接把webp的数据替换掉原图数据
            const pressBuffer = await pressBufferToImage(chunk.source, {
                type: enableWebP ? IMG_FORMATS_ENUM.webp : ext,
                quality,
            })
            chunk.source = pressBuffer

            // if (enableWebP) {
            //     const webpBuffer = await pressBufferToImage(chunk.source, {
            //         type: IMG_FORMATS_ENUM.webp,
            //         quality,
            //     })

            //     const newBundle: any = structuredClone
            //         ? structuredClone(bundle[key])
            //         : deepClone(bundle[key])

            //     const newKey = key.replace(ext, `.${IMG_FORMATS_ENUM.webp}`)
            //     newBundle.source = webpBuffer
            //     newBundle.fileName = newBundle.fileName.replace(
            //         ext,
            //         `.${IMG_FORMATS_ENUM.webp}`
            //     )
            //     bundle[newKey] = newBundle
            // }
        }
    }
}
