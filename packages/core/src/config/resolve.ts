import { DEFAULT_CONFIG, IMG_FORMATS_ENUM } from '../constants'
import type {
  ConvertConfig,
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

export type InternalConfig = PluginOptions & {
  convert: InternalConvertConfig
  perImage: PerImageResolver
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

  return {
    ...(DEFAULT_CONFIG as PluginOptions),
    ...(options as PluginOptions),
    convert: resolvedConvert,
    perImage
  }
}

