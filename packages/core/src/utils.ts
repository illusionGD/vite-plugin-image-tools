import { extname, join, parse } from 'path'
import { IMG_FORMATS_ENUM } from './constants'
import { cwd } from 'process'
import crypto from 'crypto'
import { AnyObject, ImgFormatType, PluginOptions } from './types'
import { DEFAULT_CONFIG } from './constants'

const imgWebpMap: { [key: string]: string } = {}
const globalConfig: PluginOptions = JSON.parse(JSON.stringify(DEFAULT_CONFIG))

export function getGlobalConfig() {
  return globalConfig
}

export function setGlobalConfig(config: Partial<PluginOptions>) {
  Object.assign(globalConfig, DEFAULT_CONFIG, config)
}

export function addImgWebpMap(name: string) {
  imgWebpMap[name] = replaceWebpExt(name)
}

export function getImgWebpMap() {
  return imgWebpMap
}

export async function handleImgMap(bundle: any) {
  for (const key in bundle) {
    const chunk = bundle[key] as any
    const isTrue = filterChunkImage(chunk)
    if (!isTrue) {
      continue
    }

    const { fileName } = chunk
    const { base } = parse(fileName)
    addImgWebpMap(base)
  }
}

export async function filterChunkImage(chunk: any) {
  if (!chunk.originalFileNames || !chunk.originalFileNames.length) {
    return chunk.fileName ? false : await !filterImage(chunk.fileName)
  } else {
    for (let index = 0; index < chunk.originalFileNames.length; index++) {
      const path = chunk.originalFileNames[index];
      const isTrue = await filterImage(path)
      if (isTrue) {
        return true
      }
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

export function getCacheKey({ name, type, content }: any, factor: AnyObject) {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .update(JSON.stringify(factor))
    .digest('hex')
  return `${name}_${hash.slice(0, 8)}.${type}`
}

export async function filterImage(filePath: string) {
  if (!filePath) {
    return false
  }
  const { ext } = parse(filePath)
  const { includes, excludes } = getGlobalConfig()
  const format = ext.replace('.', '') as ImgFormatType
  if (!IMG_FORMATS_ENUM[format]) {
    return false
  }

  if (isBase64(filePath)) {
    return false
  }

  // excludes
  if (excludes) {
    if (typeof excludes === 'string') {
      if (filePath.includes(excludes)) {
        return false
      }
    } else if (excludes.test(filePath)) {
      return false
    }
  }

  // includes
  if (includes) {
    if (typeof includes === 'string') {
      if (!filePath.includes(includes)) {
        return false
      }
    } else {
      if (!includes.test(filePath)) {
        return false
      }
    }
  }

  return await handleFilterPath(filePath)
}

export function replaceWebpExt(url: string) {
  if (isBase64(url)) {
    return url
  }
  const [path, query] = url.split('?')
  const ext = extname(path)

  const newPath = url.replace(ext, '.webp')
  return query ? `${newPath}?${query}` : newPath
}

export async function handleFilterPath(path: string) {
  const { filter } = getGlobalConfig()
  if (filter && filter instanceof Function) {
    if (isAsyncFunction(filter)) {
      return await filter(join(cwd(), path))
    } else {
      return filter(join(cwd(), path))
    }
  }
  return true
}

export function isAsyncFunction(fn: Function) {
  return Object.prototype.toString.call(fn) === '[object AsyncFunction]'
}

export function isBase64(url: string) {
  return url.startsWith('data:image/') && url.includes(';base64,')
}
