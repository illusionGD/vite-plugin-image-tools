import path from 'path'
import { promises as fs } from 'fs'
import sharp from 'sharp'
import type { CssGenRule } from './types'
import {
  getGlobalConfig,
  checkPattern,
  getRelativeAssetPath,
  handleReplaceConverted
} from './utils'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif|tiff?)$/i

type CssGenItem = {
  selector: string
  pseudo: string
  imageUrl: string
  width?: number
  height?: number
}

function normalizePseudo(input: string): string {
  if (!input) return ''
  return input.startsWith(':') ? input : `:${input}`
}

function sanitizeClassName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
  if (!cleaned) return 'ui--image'
  if (/^[0-9]/.test(cleaned)) return `_${cleaned}`
  return cleaned
}

function resolveSelector(rule: CssGenRule, filePath: string, baseName: string): string {
  const classPrefix = rule.classPrefix ?? 'ui--'
  const resolved = rule.resolveClass
    ? rule.resolveClass(filePath, baseName)
    : `${classPrefix}${baseName}`
  return `.${sanitizeClassName(resolved)}`
}

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

async function readImageSize(imagePath: string): Promise<{ width?: number; height?: number }> {
  try {
    const metadata = await sharp(imagePath).metadata()
    return { width: metadata.width, height: metadata.height }
  } catch {
    return {}
  }
}

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

async function collectRuleItems(rule: CssGenRule, outDir: string): Promise<CssGenItem[]> {
  const root = path.resolve(process.cwd(), rule.inputDir)
  const styleOutPath = path.resolve(outDir, rule.stylePath)
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
    const imageUrl = getRelativeAssetPath(styleOutPath, fileAbs)
    const size = await readImageSize(fileAbs)

    result.push({
      selector,
      pseudo: variant.pseudo,
      imageUrl,
      width: size.width,
      height: size.height
    })
  }

  return result
}

function renderCss(items: CssGenItem[]): string {
  return items
    .map((item) => {
      const baseLines = [
        `${item.selector}{`,
        `  background-image: url(${item.imageUrl});`,
        item.width ? `  width: ${item.width}px;` : '',
        item.height ? `  height: ${item.height}px;` : '',
        '}'
      ].filter(Boolean)

      if (!item.pseudo) {
        return baseLines.join('\n')
      }

      const variantLines = [
        `${item.selector}${item.pseudo}{`,
        `  background-image: url(${item.imageUrl});`,
        '}'
      ]
      return `${baseLines.join('\n')}\n${variantLines.join('\n')}`
    })
    .join('\n\n')
}

/**
 * @en Generate css artifacts from configured image directories.
 * @zh 根据配置的图片目录生成 CSS 产物。
 */
export async function generateCssArtifacts(outDir: string) {
  const { cssGen } = getGlobalConfig()
  if (!cssGen?.rules?.length) return false

  const grouped = new Map<string, CssGenItem[]>()
  for (const rule of cssGen.rules) {
    const stylePath = path.resolve(outDir, rule.stylePath)
    const items = await collectRuleItems(rule, outDir)
    if (!grouped.has(stylePath)) {
      grouped.set(stylePath, [])
    }
    grouped.get(stylePath)!.push(...items)
  }

  let hasChanged = false
  for (const [stylePath, items] of grouped.entries()) {
    const cssText = await handleReplaceConverted(renderCss(items))
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
  return await generateCssArtifacts(process.cwd())
}
