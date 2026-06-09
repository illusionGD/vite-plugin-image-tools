import { DEFAULT_CONFIG, DEFAULT_DEVICE_PROFILES, IMG_FORMATS_ENUM } from '../constants'
import type {
  ConvertConfig,
  DeviceCssConfig,
  DeviceProfile,
  PerImageResolver,
  PluginOptions,
  SharpImgFormatType
} from '../types'

export type InternalConvertConfig = Required<
  Pick<ConvertConfig, 'enable' | 'format' | 'deleteOriginImg'>
> & {
  limitSize?: number
  filter?: (path: string) => boolean | Promise<boolean>
}

export type InternalDeviceCssConfig = {
  enable: boolean
  classPrefix: string
  devices: DeviceProfile[]
  includes?: DeviceCssConfig['includes']
  excludes?: DeviceCssConfig['excludes']
}

export type InternalConfig = PluginOptions & {
  convert: InternalConvertConfig
  perImage: PerImageResolver
  deviceCss: InternalDeviceCssConfig
}

const SHARP_FORMATS = new Set<SharpImgFormatType>([
  IMG_FORMATS_ENUM.png,
  IMG_FORMATS_ENUM.jpg,
  IMG_FORMATS_ENUM.jpeg,
  IMG_FORMATS_ENUM.webp,
  IMG_FORMATS_ENUM.avif,
  IMG_FORMATS_ENUM.tiff,
  IMG_FORMATS_ENUM.gif
])

function normalizeFormat(format?: string): SharpImgFormatType {
  if (!format) {
    return 'webp'
  }
  const normalized = format.replace('.', '').toLowerCase() as SharpImgFormatType
  if (SHARP_FORMATS.has(normalized)) {
    return normalized
  }
  return 'webp'
}

/**
 * @en Resolve device CSS config: fill defaults, normalize device formats.
 * @zh 解析多端 CSS 配置：填默认值、归一化各端格式。
 */
function resolveDeviceCss(
  options: DeviceCssConfig | undefined
): InternalDeviceCssConfig {
  const cfg = options || {}
  const devices = (cfg.devices && cfg.devices.length
    ? cfg.devices
    : (DEFAULT_DEVICE_PROFILES as unknown as DeviceProfile[])
  ).map((d) => ({
    ...d,
    format: d.format ? normalizeFormat(d.format) : undefined
  }))
  return {
    enable: cfg.enable ?? false,
    classPrefix: cfg.classPrefix || 'device',
    devices,
    includes: cfg.includes,
    excludes: cfg.excludes
  }
}

/**
 * @en Resolve user input to stable internal config. Keep backward compatibility.
 * @zh 将用户输入解析为稳定的内部配置，并保持旧配置兼容。
 */
export function resolveInternalConfig(
  options: Partial<Omit<PluginOptions, 'viteConfig' | 'isBuild'>> = {}
): InternalConfig {
  const convert = {
    ...DEFAULT_CONFIG.convert,
    ...(options.convert || {})
  }
  const resolvedConvert: InternalConvertConfig = {
    enable: convert.enable ?? true,
    format: normalizeFormat(convert.format),
    deleteOriginImg: convert.deleteOriginImg ?? false,
    limitSize: convert.limitSize,
    filter: convert.filter
  }

  const perImage = options.perImage || (async () => ({}))

  const deviceCss = resolveDeviceCss(options.deviceCss)

  const resolved: InternalConfig = {
    ...(DEFAULT_CONFIG as PluginOptions),
    ...(options as PluginOptions),
    convert: resolvedConvert,
    perImage,
    deviceCss
  }

  // `compatibility` and `deviceCss` cannot run together (they both rewrite CSS
  // background-image selectors). When both are on, deviceCss wins.
  if (deviceCss.enable && resolved.compatibility) {
    console.warn(
      '[vite-plugin-image-tools] `compatibility` and `deviceCss` cannot be enabled together; disabling `compatibility` because `deviceCss` is on.'
    )
    resolved.compatibility = false
  }

  return resolved
}

