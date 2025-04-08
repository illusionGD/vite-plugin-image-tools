import crypto from 'crypto'
import { filterImage, replaceWebpExt } from './utils'
import { parse } from 'path'
import { AnyObject, PluginOptions } from './types'
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

export function handleImgMap(bundle: any) {
  for (const key in bundle) {
    const chunk = bundle[key] as any

    if (!filterImage(key)) {
      continue
    }

    const { filter } = getGlobalConfig()
    if (filter && filter instanceof Function) {
      const isTrue = filter(chunk.originalFileNames[0])
      if (!isTrue) {
        continue
      }
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

export function getCacheKey({ name, type, content }: any, factor: AnyObject) {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .update(JSON.stringify(factor))
    .digest('hex')
  return `${name}_${hash.slice(0, 8)}.${type}`
}
