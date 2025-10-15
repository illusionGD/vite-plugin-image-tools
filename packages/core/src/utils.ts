import path, { extname, isAbsolute, join, parse, relative } from 'path'
import { IMG_FORMATS_ENUM, isWindows } from './constants'
import { cwd } from 'process'
import crypto from 'crypto'
import type { AnyObject, ImgFormatType, PluginOptions } from './types'
import { DEFAULT_CONFIG } from './constants'
import sharp from 'sharp'
import { pressBufferToImage } from './compress'
import { logSize } from './log'

const imgWebpMap: { [key: string]: string } = {}
const globalConfig: PluginOptions = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
/** 压缩图片缓存 */
export const compressCache: { [key: string]: Buffer } = {}

/** 获取全局配置 */
export function getGlobalConfig() {
  return globalConfig
}

/** 设置全局配置 */
export function setGlobalConfig(config: Partial<PluginOptions>) {
  Object.assign(globalConfig, DEFAULT_CONFIG, config)
  globalConfig.spritesConfig = Object.assign(
    {},
    DEFAULT_CONFIG.spritesConfig,
    config.spritesConfig
  )
}

/** 添加WebpMap项 */
export function addImgWebpMap(name: string) {
  imgWebpMap[name] = replaceWebpExt(name)
}

/** 获取webpMap对象 */
export function getImgWebpMap() {
  return imgWebpMap
}

/** 处理收集要转webp的图片Map */
export async function handleWebpImgMap(bundle: any) {
  const { webpConfig } = getGlobalConfig()
  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { base, ext } = parse(chunk.fileName)

    if (imgWebpMap[base] || ext.includes(IMG_FORMATS_ENUM.webp)) {
      continue
    }

    const isTrue = await filterChunkImage(chunk)

    if (!isTrue) {
      continue
    }

    const { source, originalFileNames } = chunk

    // webp打包过滤
    if (webpConfig && webpConfig.filter) {
      const { filter } = webpConfig
      let buildWebp = false

      for (let index = 0; index < originalFileNames.length; index++) {
        const path = originalFileNames[index]
        if (filter instanceof Function) {
          if (isAsyncFunction(filter)) {
            buildWebp = await filter(join(cwd(), path))
          } else {
            buildWebp = filter(join(cwd(), path))
          }

          if (buildWebp) break
        }
      }

      if (!buildWebp) {
        continue
      }
    }

    if (source) {
      const metadata = await sharp(source).metadata()
      const { width, height } = metadata
      // webp最大分辨率不能超过16383*16383，否则会报错
      if (width && height && (width > 16383 || height > 16383)) {
        continue
      }
    }

    // 转换前后大小
    const { sharpConfig } = getGlobalConfig()
    const webpBuffer = await pressBufferToImage(
      chunk.source,
      IMG_FORMATS_ENUM.webp,
      sharpConfig[IMG_FORMATS_ENUM.webp]
    )

    // 如果转换webp体积更大则不转
    if (webpBuffer.length >= source.length) {
      continue
    }
    logSize.push({
      fileName: base,
      webpName: replaceWebpExt(base),
      originSize: source.length,
      compressSize: webpBuffer.length
    })
    compressCache[chunk.fileName] = webpBuffer

    // 收集要转webp的图片
    addImgWebpMap(base)
  }
}

/** 过滤chunk中的img项 */
export async function filterChunkImage(chunk: any) {
  if (!chunk.originalFileNames || !chunk.originalFileNames.length) {
    return chunk.fileName ? false : await filterImage(chunk.fileName)
  } else {
    for (let index = 0; index < chunk.originalFileNames.length; index++) {
      const path = chunk.originalFileNames[index]
      const isTrue = await filterImage(path)
      return isTrue
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

/** 获取缓存key */
export function getCacheKey({ name, type, content }: any, factor: AnyObject) {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .update(JSON.stringify(factor))
    .digest('hex')
  return `${name}_${hash.slice(0, 8)}.${type}`
}

/** 过滤图片 */
export async function filterImage(filePath: string) {
  if (!filePath) {
    return false
  }
  const { ext } = parse(filePath)
  const { includes, excludes } = getGlobalConfig()
  const format = ext.replace('.', '') as ImgFormatType

  // 过滤图片格式
  if (!IMG_FORMATS_ENUM[format]) {
    return false
  }

  // 不处理base64图片
  if (isBase64(filePath)) {
    return false
  }

  // excludes排除配置
  if (excludes) {
    if (typeof excludes === 'string') {
      if (filePath.includes(excludes)) {
        return false
      }
    } else if (excludes.test(filePath)) {
      return false
    }
  }

  // includes包含配置
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

/** 替换成webp后缀 */
export function replaceWebpExt(url: string) {
  if (isBase64(url)) {
    return url
  }
  const [path, query] = url.split('?')
  const ext = extname(path)

  const newPath = url.replace(ext, '.webp')
  return query ? `${newPath}?${query}` : newPath
}

/** 处理用户的filter函数，过滤图片path */
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

/** 是否为async函数 */
export function isAsyncFunction(fn: Function) {
  return Object.prototype.toString.call(fn) === '[object AsyncFunction]'
}

/** 是否为base64 */
export function isBase64(url: string) {
  return url.startsWith('data:image/') && url.includes(';base64,')
}

/** 校验配置 */
export function checkPattern(pattern: string | RegExp, str: string) {
  if (typeof pattern === 'string') {
    if (!str.includes(pattern)) {
      return false
    }
  } else {
    if (!pattern.test(str)) {
      return false
    }
  }

  return true
}

/** 是否为css文件 */
export function isCssFile(id: string) {
  return (
    id.endsWith('.css') ||
    id.endsWith('.scss') ||
    id.endsWith('.sass') ||
    id.endsWith('.less') ||
    id.includes('vue&type=style')
  )
}

const postfixRE = /[?#].*$/

/** 去除链接中的查询参数等 */
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? id.replace(/\\/g, '/') : id)
}

/**
 * 获取资源之间的相对路径（保证跨平台兼容）
 * @param from 源文件路径（例如 CSS 文件路径）
 * @param to 目标文件路径（例如 图片路径）
 * @returns 相对路径（如 "../zh-Hans-BkG767TM.webp"）
 */
export function getRelativeAssetPath(from: string, to: string): string {
  // 归一化路径
  const fromDir = path.dirname(from);
  let relative = path.relative(fromDir, to);

  // 修正 Windows 路径反斜杠
  relative = relative.split(path.sep).join('/');

  // 确保相对路径不是空（同一目录）
  if (!relative.startsWith('.')) {
    relative = './' + relative;
  }

  return relative;
}
