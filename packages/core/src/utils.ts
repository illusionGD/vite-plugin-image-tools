import { extname, parse } from 'path'
import { IMG_FORMATS_ENUM } from './constants'
import { addImgWebpMap, getGlobalConfig, getImgWebpMap } from './cache'

export function filterImage(filePath: string) {
  const { ext } = parse(filePath)

  return !!IMG_FORMATS_ENUM[ext.replace('.', '')]
}

export function replaceWebpExt(url: string) {
  const [path, query] = url.split('?')
  const ext = extname(path)

  const newPath = url.replace(ext, '.webp')
  return query ? `${newPath}?${query}` : newPath
}
