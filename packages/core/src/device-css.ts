import path, { extname, parse } from 'path'
import sharp from 'sharp'
import type { PluginContext } from 'rollup'
import { extractBackgroundImageSelectors } from './transform'
import {
  getGlobalConfig,
  normalizeAssetBase,
  cleanUrl,
  compressCache,
  exceedsFormatSizeLimit
} from './utils'
import type { DeviceProfile, ImgFormatType, SharpImgFormatType } from './types'
import { IMG_FORMATS_ENUM } from './constants'
import { logSize } from './log'

/**
 * @en stem (filename without dir/ext, decoded) -> { deviceName -> output format }.
 *     Keyed by stem so it stays stable across the original/converted extension.
 * @zh stem(去目录/扩展名、已解码的文件名) -> { 端名 -> 输出格式 }。
 *     以 stem 为键，使其在原图/转换后扩展名变化时仍可匹配。
 */
const deviceVariantMap: { [stem: string]: { [device: string]: SharpImgFormatType } } = {}

/** @en Reset variant map (per build). @zh 重置变体映射（每次构建）。 */
export function clearDeviceVariantMap() {
  for (const key in deviceVariantMap) {
    delete deviceVariantMap[key]
  }
}

/** @en Formats that cannot be resized/re-encoded sanely here. @zh 不参与端变体的格式。 */
const SKIP_FORMATS = new Set<string>([
  IMG_FORMATS_ENUM.svg,
  IMG_FORMATS_ENUM.gif
])

/** @en Separator between original name and device id in variant filenames. @zh 变体文件名分隔符。 */
const DEVICE_SEP = '-'

/** @en Map our format id to a sharp output format. @zh 转换为 sharp 输出格式。 */
function toSharpFormat(format: SharpImgFormatType): keyof sharp.FormatEnum {
  return (format === IMG_FORMATS_ENUM.jpg
    ? IMG_FORMATS_ENUM.jpeg
    : format) as keyof sharp.FormatEnum
}

/** @en Decoded basename without extension. @zh 去扩展名的解码 basename。 */
function getStem(urlOrName: string): string {
  const base = normalizeAssetBase(parse(cleanUrl(urlOrName)).base)
  const ext = extname(base)
  return ext ? base.slice(0, base.length - ext.length) : base
}

/**
 * @en Build a variant url from the original css url by swapping only the
 *     extension: `dir/name.ext(?q)` -> `dir/name-<device>.<format>(?q)`.
 *     Touching only the extension preserves any percent-encoding in the name.
 * @zh 仅替换扩展名得到变体 url，保留文件名中的百分号编码。
 */
function toVariantUrl(url: string, device: string, format: SharpImgFormatType): string {
  const m = url.match(/^([^?#]*)([?#].*)?$/)
  const pathPart = m ? m[1] : url
  const suffix = m && m[2] ? m[2] : ''
  const ext = extname(pathPart)
  const stemPath = ext ? pathPart.slice(0, pathPart.length - ext.length) : pathPart
  return `${stemPath}${DEVICE_SEP}${device}.${format}${suffix}`
}

/** @en Whether the device filter passes for this asset key. @zh 端过滤是否通过。 */
function passDeviceFilter(key: string): boolean {
  const { deviceCss } = getGlobalConfig()
  const { includes, excludes } = deviceCss
  if (excludes) {
    if (typeof excludes === 'string') {
      if (key.includes(excludes)) return false
    } else if (excludes.test(key)) {
      return false
    }
  }
  if (includes) {
    if (typeof includes === 'string') {
      if (!key.includes(includes)) return false
    } else if (!includes.test(key)) {
      return false
    }
  }
  return true
}

/**
 * @en Compress a buffer for a device profile (scale + quality + format).
 *     Returns null when the output would exceed the format's size limit.
 * @zh 按端档位压缩（缩放 + 质量 + 格式）。输出超过格式尺寸上限时返回 null。
 */
async function compressForDevice(
  buffer: Buffer,
  device: DeviceProfile,
  format: SharpImgFormatType,
  globalQuality: number,
  globalSharpConfig: any
): Promise<Buffer | null> {
  const quality = device.quality ?? globalQuality
  const options = Object.assign(
    {},
    globalSharpConfig?.[format],
    device.sharpConfig,
    { quality }
  )
  const { width, height } = await sharp(buffer).metadata()
  let outWidth = width
  let outHeight = height
  let pipeline = sharp(buffer)
  const scale = device.scale ?? 1
  if (scale > 0 && scale < 1 && width && height) {
    outWidth = Math.max(1, Math.round(width * scale))
    outHeight = Math.max(1, Math.round(height * scale))
    pipeline = pipeline.resize({ width: outWidth, height: outHeight })
  }
  // Skip when the output would exceed the format's hard limit (e.g. WebP 16383²).
  if (exceedsFormatSizeLimit(format, outWidth, outHeight)) {
    return null
  }
  return pipeline.toFormat(toSharpFormat(format), options).toBuffer()
}

/**
 * @en Generate per-device variants for raster images referenced by CSS, emit them
 *     as assets and record them in deviceVariantMap. Build only.
 * @zh 为 CSS 引用的位图生成各端变体，emit 为资源并记录到 deviceVariantMap。仅构建期。
 */
export async function handleDeviceCssBundle(
  bundle: any,
  pluginContext: PluginContext
) {
  const { deviceCss, quality, sharpConfig, convert } = getGlobalConfig()
  if (!deviceCss.enable) return
  clearDeviceVariantMap()

  // 1) Collect stems referenced as CSS background images.
  const cssStems = new Set<string>()
  for (const key in bundle) {
    if (!/\.css$/.test(key)) continue
    const source = (bundle[key] as any).source
    if (!source) continue
    const selectors = await extractBackgroundImageSelectors(String(source))
    selectors.forEach((s) => {
      if (s.imageUrl) cssStems.add(getStem(s.imageUrl))
    })
  }
  if (!cssStems.size) return

  // 2) For each referenced raster asset, emit a variant per device profile.
  for (const key in bundle) {
    const chunk = bundle[key] as any
    if (chunk.type !== 'asset') continue
    const stem = getStem(key)
    if (!cssStems.has(stem)) continue

    const baseExt = extname(key).replace('.', '').toLowerCase() as ImgFormatType
    if (SKIP_FORMATS.has(baseExt)) continue
    if (!passDeviceFilter(key)) continue

    const source = chunk.source
    if (!source || !(source instanceof Buffer)) continue

    const convertedFmt: SharpImgFormatType = convert.enable
      ? convert.format
      : (baseExt as SharpImgFormatType)

    const { dir, name } = parse(key)

    for (const device of deviceCss.devices) {
      const format = device.format || convertedFmt
      const variantName = path.posix.join(
        dir,
        `${name}${DEVICE_SEP}${device.name}.${format}`
      )
      try {
        const variantBuffer =
          compressCache[variantName] ||
          (await compressForDevice(source, device, format, quality, sharpConfig))

        // Skip when the variant exceeds the format size limit (null) or
        // isn't smaller — the device falls back to the base image.
        if (!variantBuffer || variantBuffer.length >= source.length) continue

        compressCache[variantName] = variantBuffer
        pluginContext.emitFile({
          type: 'asset',
          fileName: variantName,
          name: parse(variantName).base,
          originalFileName: chunk.originalFileNames?.[0] || key,
          source: variantBuffer
        })
        ;(deviceVariantMap[stem] ??= {})[device.name] = format
        logSize.push({
          fileName: parse(key).base,
          webpName: parse(variantName).base,
          originSize: source.length,
          compressSize: variantBuffer.length,
          device: device.name
        })
      } catch (error) {
        // Don't abort the whole build for one variant; skip and warn.
        console.warn(
          `[vite-plugin-image-tools] skip device variant ${variantName}: ${error}`
        )
      }
    }
  }
}

/**
 * @en Append per-device override rules to a CSS string. Only the `url()` is swapped;
 *     no style property is touched.
 * @zh 向 CSS 追加各端覆盖规则，仅替换 url()，不改任何样式属性。
 */
export async function appendDeviceCss(css: string): Promise<string> {
  const { deviceCss } = getGlobalConfig()
  if (!deviceCss.enable) return css
  const { classPrefix, devices } = deviceCss

  const selectors = await extractBackgroundImageSelectors(css)
  let appended = ''
  for (const { selector, imageUrl } of selectors) {
    if (!imageUrl) continue
    const variants = deviceVariantMap[getStem(imageUrl)]
    if (!variants) continue
    for (const device of devices) {
      const format = variants[device.name]
      if (!format) continue
      const variantUrl = toVariantUrl(imageUrl, device.name, format)
      appended += `html.${classPrefix}-${device.name} ${selector}{background-image: url(${variantUrl})}`
    }
  }
  return css + appended
}

/**
 * @en Build the synchronous UA-detection script injected into <head>.
 *     Adds `<classPrefix>-<device>` to documentElement before CSS applies (no FOUC).
 *     When no device matches, no class is added — the base image stays.
 * @zh 生成注入 <head> 的同步 UA 检测脚本，在 CSS 生效前给 documentElement 加端 class。
 *     无端匹配时不加任何 class，保持基础图。
 */
export function buildDeviceScript(): string {
  const { deviceCss } = getGlobalConfig()
  const { classPrefix, devices } = deviceCss
  const branches = devices
    .map(
      (d, i) =>
        `${i ? '  else ' : '  '}if (${d.match.toString()}.test(ua)) name = ${JSON.stringify(
          d.name
        )}`
    )
    .join('\n')
  return `;(function () {
  var ua = navigator.userAgent
  var name = ''
${branches}
  if (name) document.documentElement.classList.add(${JSON.stringify(classPrefix + '-')} + name)
})()`
}
