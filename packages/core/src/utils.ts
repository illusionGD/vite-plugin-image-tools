import path, { extname, isAbsolute, join, parse, relative } from 'path'
import { IMG_FORMATS_ENUM, isWindows } from './constants'
import { cwd } from 'process'
import crypto from 'crypto'
import type { AnyObject, ImgFormatType, PluginOptions } from './types'
import { DEFAULT_CONFIG } from './constants'
import sharp from 'sharp'
import { pressBufferToImage } from './compress'
import { logSize } from './log'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { resolveInternalConfig, type InternalConfig } from './config/resolve'

const imgWebpMap: { [key: string]: string } = {}
const imgConvertMap: { [key: string]: string } = {}
const globalConfig: InternalConfig = resolveInternalConfig(DEFAULT_CONFIG)
/** Compressed image cache */
export const compressCache: { [key: string]: Buffer } = {}

/** Get global configuration */
export function getGlobalConfig() {
  return globalConfig
}

/** Set global configuration */
export function setGlobalConfig(config: Partial<PluginOptions>) {
  const resolved = resolveInternalConfig(config)
  Object.assign(globalConfig, resolved)
  globalConfig.spritesConfig = Object.assign(
    {},
    DEFAULT_CONFIG.spritesConfig,
    config.spritesConfig
  )
}

/** Add WebpMap item */
export function addImgWebpMap(name: string) {
  imgWebpMap[name] = replaceWebpExt(name)
}

/** Get webpMap object */
export function getImgWebpMap() {
  return imgWebpMap
}

/**
 * @en Add generic image conversion mapping.
 * @zh 添加通用格式转换映射。
 */
export function addImgConvertMap(fromName: string, toName: string) {
  imgConvertMap[fromName] = toName
}

/**
 * @en Read generic image conversion mapping.
 * @zh 读取通用格式转换映射。
 */
export function getImgConvertMap() {
  return imgConvertMap
}

/** Handle map of images to be converted to target format */
export async function handleConvertImgMap(bundle: any) {
  const { convert, perImage } = getGlobalConfig()
  for (const key in bundle) {
    const chunk = bundle[key] as any
    const { base, ext } = parse(chunk.fileName)
    const sourcePath = chunk.originalFileNames?.[0] || chunk.fileName || key
    const single = await perImage(join(cwd(), sourcePath))
    const targetFormat = single?.format || convert.format || IMG_FORMATS_ENUM.webp

    if (imgConvertMap[base] || ext.includes(targetFormat)) {
      continue
    }

    const isTrue = await filterChunkImage(chunk)

    if (!isTrue) {
      continue
    }

    const { source, originalFileNames } = chunk

    // Limit conversion size
    if (
      convert?.limitSize &&
      source &&
      source.length <= convert?.limitSize
    ) {
      continue
    }

    // Conversion filter function
    if (convert && convert.filter) {
      const { filter } = convert
      let shouldConvert = false

      for (let index = 0; index < originalFileNames.length; index++) {
        const path = originalFileNames[index]
        shouldConvert = await filter(join(cwd(), path))
        if (shouldConvert) break
      }

      if (!shouldConvert) {
        continue
      }
    }

    if (source) {
      const metadata = await sharp(source).metadata()
      const { width, height } = metadata
      // WebP maximum resolution cannot exceed 16383 * 16383.
      if (
        targetFormat === IMG_FORMATS_ENUM.webp &&
        width &&
        height &&
        (width > 16383 || height > 16383)
      ) {
        continue
      }
    }

    // File size before and after conversion
    const { sharpConfig } = getGlobalConfig()
    const convertedBuffer = await pressBufferToImage(
      chunk.source,
      targetFormat,
      sharpConfig[targetFormat]
    )

    // Skip conversion if converted file size is larger than original
    if (convertedBuffer.length >= source.length) {
      continue
    }
    const convertedBase = base.replace(/\.[^.]+$/, `.${targetFormat}`)
    logSize.push({
      fileName: base,
      webpName: convertedBase,
      originSize: source.length,
      compressSize: convertedBuffer.length
    })
    const convertedName = replaceExt(key, targetFormat)
    compressCache[convertedName] = convertedBuffer

    // Collect images to be converted to target format
    addImgConvertMap(base, convertedBase)
    if (targetFormat === IMG_FORMATS_ENUM.webp) {
      addImgWebpMap(base)
    }
  }
}

/** Filter image items in chunk */
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

/**
 * @en Replace image names by generic conversion map.
 * @zh 根据通用转换映射替换图片名称。
 */
export function handleReplaceConverted(str: string) {
  const map = getImgConvertMap()
  let next = str
  for (const key in map) {
    next = next.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), map[key])
  }
  return next
}

/** Get cache key */
export function getCacheKey({ name, type, content }: any, factor: AnyObject) {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .update(JSON.stringify(factor))
    .digest('hex')
  return `${name}_${hash.slice(0, 8)}.${type}`
}

/** Filter images */
export async function filterImage(filePath: string) {
  if (!filePath) {
    return false
  }
  const { ext } = parse(filePath)
  const { includes, excludes, limitSize, isBuild } = getGlobalConfig()
  const format = ext.replace('.', '') as ImgFormatType

  // Filter image formats
  if (!IMG_FORMATS_ENUM[format]) {
    return false
  }

  // Size limit
  if (limitSize) {
    const _path = isBuild ? filePath : join(cwd(), filePath)
    const buffer = readFileSync(_path)
    if (buffer && buffer.length <= limitSize) {
      return false
    }
  }

  // Skip base64 images
  if (isBase64(filePath)) {
    return false
  }

  // Exclude configuration
  if (excludes) {
    if (typeof excludes === 'string') {
      if (filePath.includes(excludes)) {
        return false
      }
    } else if (excludes.test(filePath)) {
      return false
    }
  }

  // Include configuration
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

/** Replace extension with target format */
export function replaceExt(url: string, targetFormat: string) {
  if (isBase64(url)) {
    return url
  }
  const [pathname, query] = url.split('?')
  const ext = extname(pathname)

  const newPath = pathname.replace(ext, `.${targetFormat}`)
  return query ? `${newPath}?${query}` : newPath
}

/** Backward compatibility helper for webp replacement */
export function replaceWebpExt(url: string) {
  return replaceExt(url, IMG_FORMATS_ENUM.webp)
}

/** Handle user's filter function to filter image paths */
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

/** Check if function is async */
export function isAsyncFunction(fn: Function) {
  return Object.prototype.toString.call(fn) === '[object AsyncFunction]'
}

/** Check if string is base64 */
export function isBase64(url: string) {
  return url.startsWith('data:image/') && url.includes(';base64,')
}

/** Validate pattern */
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

/** Check if file is CSS */
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

/** Remove query parameters from URL */
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? id.replace(/\\/g, '/') : id)
}

/**
 * Get relative path between assets (ensuring cross-platform compatibility)
 * @param from Source file path (e.g., CSS file path)
 * @param to Target file path (e.g., image path)
 * @returns Relative path (e.g., "../zh-Hans-BkG767TM.webp")
 */
export function getRelativeAssetPath(from: string, to: string): string {
  // Normalize paths
  const fromDir = path.dirname(from)
  let relative = path.relative(fromDir, to)

  // Fix Windows path backslashes
  relative = relative.split(path.sep).join('/')

  // Ensure relative path is not empty (same directory)
  if (!relative.startsWith('.')) {
    relative = './' + relative
  }

  return relative
}

/**
 * Find file path by name, return path array
 * @param dirs
 * @param name
 */
export function findImgFileAbsolutePathByName(
  dirs: string | string[],
  name: string
) {
  const result: string[] = []
  const dirList = Array.isArray(dirs) ? dirs : [dirs]

  const walk = (dir: string) => {
    if (!existsSync(dir)) return
    const files = readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = statSync(filePath)
      if (stat.isDirectory()) {
        walk(filePath)
      } else {
        // Check if filename matches (supports partial matching)
        if (file.includes(name)) {
          result.push(path.resolve(filePath))
        }
      }
    }
  }

  for (const dir of dirList) {
    // Automatically resolve to absolute path
    const absDir = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir)
    walk(absDir)
  }

  return result
}

/**
 * Format file size
 * @param size File size (in bytes)
 * @param decimals Decimal places to keep, default 2
 * @returns Formatted string
 */
export function formatFileSize(size: number, decimals: number = 2): string {
  if (size === 0) return '0 B'

  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))

  return parseFloat((size / Math.pow(k, i)).toFixed(decimals)) + ' ' + units[i]
}
