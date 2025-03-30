import { extname, parse } from 'path'
import { DEFAULT_CONFIG } from './constants'
import { addImgWebpMap, getImgWebpMap } from './cache'
import { AnyObject } from './types'

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

export function deepClone(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone(obj))
  }

  const newObj: AnyObject = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key])
    }
  }

  return newObj
}

export function replaceWebpExt(url: string) {
  const [path, query] = url.split('?')
  const ext = extname(path)

  const newPath = url.replace(ext, '.webp')
  return query ? `${newPath}?${query}` : newPath
}
