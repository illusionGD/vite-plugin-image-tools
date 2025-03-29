import crypto from 'crypto'
import { replaceWebpExt } from './utils'

const imgWebpMap = {}

export function addImgWebpMap(name: string) {
    imgWebpMap[name] = replaceWebpExt(name)
}

export function getImgWebpMap() {
    return imgWebpMap
}

export function getCacheKey({ name, type, content, quality, enableWebP }) {
    const hash = crypto
        .createHash('md5')
        .update(content)
        .update(JSON.stringify({ quality, enableWebP }))
        .digest('hex')
    return `${name}_${hash.slice(0, 8)}.${type}`
}
