import { extname, parse } from 'path'
import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from './constants'
import { addImgWebpMap, getGlobalConfig, getImgWebpMap } from './cache'
import { AnyObject } from './types'

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function filterImage(filePath: string) {
  const reg = new RegExp(getGlobalConfig().regExp)
  const { ext } = parse(filePath)

  if (!IMG_FORMATS_ENUM[ext.replace('.', '')]) {
    return
  }

  return reg.test(filePath)
}

export function replaceWebpExt(url: string) {
  const [path, query] = url.split('?')
  const ext = extname(path)

  const newPath = url.replace(ext, '.webp')
  return query ? `${newPath}?${query}` : newPath
}
