import path from 'path'
import { promises as fs } from 'fs'
import sharp from 'sharp'
import type { CssGenRule, CssGenStyleObject } from './types'
import {
  getGlobalConfig,
  checkPattern,
  getRelativeAssetPath,
  handleReplaceConverted
} from './utils'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif|tiff?)$/i

type CssGenItem = {
  className: string
  selector: string
  pseudo: string
  imageUrl: string
  imageAbsPath: string
  width?: number
  height?: number
  transform?: CssGenRule['transform']
}

/**
 * @en Normalize pseudo selector to `:xxx` format.
 * @zh 规范化伪类写法，统一为 `:xxx` 格式。
 */
function normalizePseudo(input: string): string {
  if (!input) return ''
  return input.startsWith(':') ? input : `:${input}`
}

/**
 * @en Sanitize css class name to avoid invalid selectors.
 * @zh 清洗类名，避免生成非法选择器。
 */
function sanitizeClassName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
  if (!cleaned) return 'ui--image'
  if (/^[0-9]/.test(cleaned)) return `_${cleaned}`
  return cleaned
}

/**
 * @en Resolve final selector from class strategy.
 * @zh 根据规则解析最终选择器。
 */
function resolveSelector(rule: CssGenRule, filePath: string, baseName: string): string {
  const classPrefix = rule.classPrefix ?? 'ui--'
  const resolved = rule.resolveClass
    ? rule.resolveClass(filePath, baseName)
    : `${classPrefix}${baseName}`
  return `.${sanitizeClassName(resolved)}`
}

/**
 * @en Resolve variant filename suffix into pseudo selector.
 * @zh 将变体文件名后缀映射为伪类选择器。
 */
function resolveVariant(rule: CssGenRule, baseName: string): { baseName: string; pseudo: string } {
  const variantRules = rule.variantRules || []
  for (const variantRule of variantRules) {
    if (variantRule.regex.test(baseName)) {
      return {
        baseName: baseName.replace(variantRule.regex, ''),
        pseudo: normalizePseudo(variantRule.pseudo)
      }
    }
  }
  return { baseName, pseudo: '' }
}

/**
 * @en Read image width/height metadata with graceful fallback.
 * @zh 读取图片宽高元信息，失败时优雅回退为空。
 */
async function readImageSize(imagePath: string): Promise<{ width?: number; height?: number }> {
  try {
    const metadata = await sharp(imagePath).metadata()
    return { width: metadata.width, height: metadata.height }
  } catch {
    return {}
  }
}

/**
 * @en Recursively collect all files from a directory.
 * @zh 递归收集目录下所有文件。
 */
async function collectFilesRecursively(dir: string, collector: string[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFilesRecursively(absPath, collector)
    } else {
      collector.push(absPath)
    }
  }
}

/**
 * @en Collect css generation items for one rule.
 * @zh 按单条规则收集用于生成 CSS 的条目。
 */
async function collectRuleItems(rule: CssGenRule): Promise<CssGenItem[]> {
  const root = path.resolve(process.cwd(), rule.inputDir)
  /** CSS 文件写在源码树（相对项目根），与 dev/build 无关；用于计算 url(...) 相对图片路径。 */
  const styleOutPath = path.resolve(process.cwd(), rule.stylePath)
  const files: string[] = []
  const result: CssGenItem[] = []

  await collectFilesRecursively(root, files)

  for (const fileAbs of files) {
    const relativePath = path.relative(root, fileAbs).split(path.sep).join('/')
    if (!IMAGE_EXT_RE.test(fileAbs)) continue
    if (rule.includes && !checkPattern(rule.includes, relativePath)) continue
    if (rule.excludes && checkPattern(rule.excludes, relativePath)) continue
    if (rule.filter && !(await rule.filter(fileAbs))) continue

    const parsed = path.parse(fileAbs)
    const variant = resolveVariant(rule, parsed.name)
    const selector = resolveSelector(rule, fileAbs, variant.baseName)
    const className = selector.startsWith('.') ? selector.slice(1) : selector
    const imageUrl = getRelativeAssetPath(styleOutPath, fileAbs)
    const size = await readImageSize(fileAbs)

    result.push({
      className,
      selector,
      pseudo: variant.pseudo,
      imageUrl,
      imageAbsPath: fileAbs,
      width: size.width,
      height: size.height,
      transform: rule.transform
    })
  }

  return result
}

/**
 * @en Convert camelCase style key to kebab-case css key.
 * @zh 将 camelCase 样式键转换为 kebab-case CSS 键。
 */
function toKebabCase(input: string): string {
  return input.replace(/[A-Z]/g, (matched) => `-${matched.toLowerCase()}`)
}

/**
 * @en Convert style object to css declaration lines.
 * @zh 将样式对象转换为 CSS 声明行。
 */
function styleObjectToLines(style: CssGenStyleObject): string[] {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${toKebabCase(key)}: ${String(value)};`)
}

/**
 * @en Resolve css body from transform style object, fallback to defaults.
 * @zh 优先使用 transform 返回的样式对象，空值时回退默认声明。
 */
async function resolveCssBody(item: CssGenItem, fallbackLines: string[]): Promise<string> {
  const customStyle = await item.transform?.({
    className: item.className,
    imageUrl: item.imageUrl,
    imageAbsPath: item.imageAbsPath,
    width: item.width,
    height: item.height
  })

  if (!customStyle) return fallbackLines.join('\n')

  const customLines = styleObjectToLines(customStyle)
  return customLines.length ? customLines.join('\n') : fallbackLines.join('\n')
}

/**
 * @en Render css blocks with tab indentation.
 * @zh 生成带 tab 缩进的 CSS 代码块。
 */
async function renderCss(items: CssGenItem[]): Promise<string> {
  const blocks = await Promise.all(
    items.map(async (item) => {
      const baseBody = await resolveCssBody(item, [
        `background-image: url(${item.imageUrl});`,
        item.width ? `width: ${item.width}px;` : '',
        item.height ? `height: ${item.height}px;` : ''
      ].filter(Boolean))

      const baseLines = [
        `${item.selector}{`,
        ...baseBody.split('\n').map((line) => `\t${line}`),
        '}'
      ]

      if (!item.pseudo) {
        return baseLines.join('\n')
      }

      const variantBody = await resolveCssBody(item, [`background-image: url(${item.imageUrl});`])
      const variantLines = [
        `${item.selector}${item.pseudo}{`,
        ...variantBody.split('\n').map((line) => `\t${line}`),
        '}'
      ]

      return `${baseLines.join('\n')}\n${variantLines.join('\n')}`
    })
  )

  return blocks.join('\n\n')
}

/**
 * @en Generate css artifacts from configured image directories.
 * @zh 根据配置的图片目录生成 CSS 产物。`stylePath` / `inputDir` 均相对 `process.cwd()`（项目根）。
 */
export async function generateCssArtifacts() {
  const { cssGen } = getGlobalConfig()
  if (!cssGen?.rules?.length) return false

  const grouped = new Map<string, CssGenItem[]>()
  for (const rule of cssGen.rules) {
    const stylePath = path.resolve(process.cwd(), rule.stylePath)
    const items = await collectRuleItems(rule)
    if (!grouped.has(stylePath)) {
      grouped.set(stylePath, [])
    }
    grouped.get(stylePath)!.push(...items)
  }

  let hasChanged = false
  for (const [stylePath, items] of grouped.entries()) {
    const cssText = await handleReplaceConverted(await renderCss(items))
    await fs.mkdir(path.dirname(stylePath), { recursive: true })
    let current = ''
    try {
      current = await fs.readFile(stylePath, 'utf-8')
    } catch {
      current = ''
    }
    if (current !== cssText) {
      await fs.writeFile(stylePath, cssText, 'utf-8')
      hasChanged = true
    }
  }
  return hasChanged
}

/**
 * @en Generate css artifacts in dev mode (project-root based output).
 * @zh 开发模式下生成 CSS 产物（以项目根目录为输出基准）。
 */
export async function generateCssArtifactsForDev() {
  return await generateCssArtifacts()
}
