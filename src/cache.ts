import crypto from 'crypto'

export function getCacheKey({ name, type, content, quality, enableWebP }) {
    const hash = crypto
        .createHash('md5')
        .update(content)
        .update(JSON.stringify({ quality, enableWebP }))
        .digest('hex')
    return `${name}_${hash.slice(0, 8)}.${type}`
}
