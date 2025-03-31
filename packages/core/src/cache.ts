import crypto from 'crypto'
import { filterImage, replaceWebpExt } from './utils'
import { parse } from 'path'

const imgWebpMap: { [key: string]: string } = {}

export function addImgWebpMap(name: string) {
  imgWebpMap[name] = replaceWebpExt(name)
}

export function getImgWebpMap() {
  return imgWebpMap
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

export function handleReplaceWebp(str: string) {
  const map = getImgWebpMap()
  let temp = str
  for (const key in map) {
    temp = temp.replace(new RegExp(key, 'g'), map[key])
  }
  return temp
}

export function getCacheKey({ name, type, content, quality, enableWebp }: any) {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .update(JSON.stringify({ quality, enableWebp }))
    .digest('hex')
  return `${name}_${hash.slice(0, 8)}.${type}`
}
