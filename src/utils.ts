import type { PluginOptionsType } from '.'
import { DEFAULT_QUALITY, IMG_FORMATS } from './constants'

/**
 * 将字节数转换为人性化的字符串
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function initQuality(opt: PluginOptionsType) {
    const quality = opt.quality || DEFAULT_QUALITY
    const extArr: string[] = [...IMG_FORMATS, 'sharp']
    extArr.forEach((str) => {
        const key = `${str.replace('.', '')}Option`
        opt[key] = opt[key] || opt.sharpOptions || { quality }
        if (!opt[key].quality) {
            opt[key].quality = quality
        }
    })
}
