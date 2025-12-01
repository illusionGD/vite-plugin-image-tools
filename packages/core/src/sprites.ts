import { basename, join, parse, relative, resolve } from 'path'
import {
  checkPattern,
  findImgFileAbsolutePathByName,
  getGlobalConfig,
  getRelativeAssetPath,
  isBase64,
  isCssFile,
  normalizePath
} from './utils'
import { cwd } from 'process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs'
import postcss, { Declaration, Rule } from 'postcss'
import type { AnyObject, ImgFormatType, SpritesStylesType } from './types'
import { IMG_FORMATS_ENUM } from './constants'
import type { PluginContext } from 'rollup'
import { UserConfig } from 'vite'

/**
 * Sprite styles storage object
 * Used to store coordinate information, dimension information, output path, vite reference id, etc. for each sprite
 */
const originalStyles: {
  [key: string]: SpritesStylesType
} = {}

/**
 * Bundle sprite information object for individual images
 */
const bundleStyles = new Map<
  string,
  {
    styles: SpritesStylesType
    /** Absolute path */
    absolutePath: string
  }
>()

/**
 * Sprite lookup index, used for quick lookup of which sprite an image belongs to
 */
const spriteImageIndex: Map<string, string> = new Map()

/**
 * Clear sprite cache
 */
export function clearSpriteCache() {
  Object.keys(originalStyles).forEach((key) => delete originalStyles[key])
  spriteImageIndex.clear()
}

/**
 * Initialize sprite generation process
 * Read all rules in configuration, generate corresponding sprites for each directory
 */
export async function initSprite(
  that: PluginContext,
  viteConfig: UserConfig,
  isBuild: boolean
) {
  const { spritesConfig, debugLog } = getGlobalConfig()

  if (!checkSpriteConfig()) {
    return
  }

  const rules = spritesConfig?.rules || []

  // Process all rules in parallel
  try {
    await Promise.all(
      rules.map((rule) => {
        return createSprites(rule.dir)
      })
    )

    if (isBuild) {
      // emitFile, add sprites to build bundle
      Object.keys(originalStyles).forEach((dir) => {
        const { outPathName, image, outputDir } = originalStyles[dir]
        const spritesPath = join(outputDir || dir, outPathName)
        const originalFileName = normalizePath(
          relative(viteConfig.root || './', spritesPath)
        )
        const referenceId = that.emitFile({
          type: 'asset',
          name: outPathName,
          originalFileName,
          source: image
        })
        // Add reference id
        originalStyles[dir].referenceId = referenceId
      })

      // Process base64 small images
      const base64Imgs: string[] = []
      const assetsInlineLimit = viteConfig.build?.assetsInlineLimit || 4096
      Object.keys(originalStyles).map((dir) => {
        const { coordinates } = originalStyles[dir]
        for (const filePath in coordinates) {
          const buffer = readFileSync(filePath)
          const { ext } = parse(filePath)
          if (
            (typeof assetsInlineLimit === 'number' &&
              buffer.length <= assetsInlineLimit) ||
            (assetsInlineLimit instanceof Function &&
              assetsInlineLimit(filePath, buffer))
          ) {
            const key =
              `data:image/${ext.replace('.', '')};base64,` +
              buffer.toString('base64')
            bundleStyles.set(key, {
              styles: originalStyles[dir],
              absolutePath: filePath
            })
            base64Imgs.push(filePath)
          }
        }
      })
      if (debugLog) {
        console.log('🐛 ~ Base64 small images in sprite:', base64Imgs)
      }
    }
  } catch (error) {
    console.log('[Sprite Error]', error)
  }
}

/**
 * Generate sprite for specified directory
 * @param spritesDir Sprite source file directory path
 * @returns Returns sprite style information
 */
export async function createSprites(spritesDir: string) {
  const { spritesConfig, debugLog } = getGlobalConfig()

  if (!spritesConfig) {
    return
  }

  const rule = findRule(spritesDir)
  const { includes, excludes, outputDir: spritesOutputDir } = spritesConfig
  const algorithm = rule
    ? rule.algorithm || spritesConfig.algorithm
    : spritesConfig.algorithm
  const suffix = rule?.suffix || spritesConfig.suffix
  const output = rule?.outputDir || spritesOutputDir
  const outputDir = output ? join(cwd(), output) : ''

  if (outputDir) {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir)
    }
  }

  const dir = join(cwd(), spritesDir)

  if (!existsSync(dir)) {
    return
  }

  const { name } = parse(dir)
  const outPathName = `${name}-${suffix}.png`

  // Filter images
  const files = readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((path) => {
      if (includes && !checkPattern(includes, path)) {
        return false
      }
      if (excludes && checkPattern(excludes, path)) {
        return false
      }
      return !path.includes(outPathName)
    })

  if (files.length === 0) return

  try {
    const Spritesmith = (await import('spritesmith')).default
    const result = await new Promise<any>((resolve, reject) => {
      Spritesmith.run(
        { src: files, algorithm, padding: rule?.padding || 0 },
        function handleResult(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        }
      )
    })
    const originalDir = outputDir || dir
    originalStyles[dir] = {
      ...result,
      outPathName
    }

    if (outputDir) {
      originalStyles[dir].outputDir = originalDir
    }

    // Build quick lookup index
    Object.keys(result.coordinates).forEach((filePath) => {
      spriteImageIndex.set(filePath, dir)
    })

    if (debugLog) {
      console.log('🐛 Output sprite:', join(originalDir, outPathName))
      console.log('🐛 Sprite sub-images:', files)
    }

    writeFileSync(join(originalDir, outPathName), result.image)

    return originalStyles
  } catch (error) {
    // Fallback: continue processing other sprites
    return null
  }
}

/**
 * Check if image at specified path belongs to a sprite
 * @param path Absolute path of image file, D:\xxx\xxx.png
 * @returns If part of sprite, returns sprite information; otherwise returns false
 */
export function filterSpriteImg(path: string) {
  if (!checkSpriteConfig()) {
    return false
  }

  // Use index for quick lookup
  const spritesDir = spriteImageIndex.get(path)

  if (
    spritesDir &&
    originalStyles[spritesDir] &&
    originalStyles[spritesDir].coordinates[path]
  ) {
    return originalStyles[spritesDir]
  }

  return false
}

/**
 * Process sprite replacement in CSS code
 * @param css CSS source code
 * @param id File path
 * @returns Processed PostCSS result
 */
export async function handleSpriteCss(
  css: string,
  id: string,
  viteConfig: UserConfig
) {
  const res = await postcss([
    (root: postcss.Root) => {
      root.walkRules((rule: postcss.Rule) => {
        processSpritesBgRule(rule, id, viteConfig)
      })
    }
  ]).process(css, { from: undefined })
  return res
}

/**
 * More strict URL matching regular expression
 */
const URL_REGEX = /url\s*\(\s*(['"]?)([^"')]+?)\1\s*\)/gi

/**
 * Process background images in CSS rules, replace with sprites
 * @param rule PostCSS rule object
 * @param id File path
 * @param isBuild Whether in build mode
 */
function processSpritesBgRule(rule: Rule, id: string, viteConfig: UserConfig) {
  const { debugLog } = getGlobalConfig()
  rule.walkDecls(/background(-image)?$/i, (decl: postcss.Declaration) => {
    const { value } = decl

    // Reset regex lastIndex
    URL_REGEX.lastIndex = 0
    const imageMatch = URL_REGEX.exec(value)

    if (!imageMatch || !imageMatch[2]) return

    const url = imageMatch[2].trim()

    // Resolve image path to absolute path
    const filePath: string = resolveImagePath(url, id)

    // Check if image is part of sprite
    const targetSprite = filterSpriteImg(filePath)

    if (!targetSprite) return

    const { outPathName, outputDir } = targetSprite

    if (outputDir) {
      const outputPath = normalizePath(
        join(relative(viteConfig.root || './', outputDir), outPathName)
      )

      decl.value = value.replace(url, outputPath)
    } else {
      const spriteBase = parse(outPathName).base
      const base = parse(url).base

      decl.value = value.replace(
        new RegExp(escapeRegex(url), 'g'),
        url.replace(base, spriteBase)
      )
    }

    if (debugLog) {
      console.log('🐛~ Replace sprite in css:', url, '-->', decl.value)
    }
    modifySpritesCss(rule, targetSprite, filePath)
  })
}

function modifySpritesCss(
  rule: Rule,
  styles: SpritesStylesType,
  filePath: string
) {
  const options = getSpritesCssSize(filePath, rule, styles)
  const { spritesConfig } = getGlobalConfig()
  const { properties, coordinates } = styles

  const { width, height, x, y } = options || {}

  // Check if coordinate information exists
  const coordInfo = coordinates[filePath]
  const sw = width || properties.width
  const sh = height || properties.height
  const sx = x !== undefined ? x : coordInfo.x
  const sy = y !== undefined ? y : coordInfo.y
  const getUnit = (num: number) => {
    return spritesConfig?.transformUnit
      ? spritesConfig.transformUnit(num, filePath)
      : num + 'px'
  }

  const _width = getUnit(sw)

  const _height = getUnit(sh)

  const _x = getUnit(sx)

  const _y = getUnit(sy)

  const props = {
    'background-position': `-${_x} -${_y} !important`,
    'background-size': `${_width} ${_height} !important`,
    'background-repeat': 'no-repeat !important'
  }

  for (const key in props) {
    const val = props[key as keyof typeof props]
    if (val) {
      // Only process properties with values
      rule.walkDecls(key, (existingDecl) => {
        existingDecl.remove()
        return
      })
      rule.append({ prop: key, value: val })
    }
  }
}

/**
 * Escape regex special characters
 * @param str String to escape
 * @returns Escaped string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Resolve image path to absolute path
 * @param url Image URL
 * @param id Current file path
 * @returns Absolute path
 */
function resolveImagePath(url: string, id: string): string {
  // Clean query parameters and hash from URL
  const cleanUrl = url.split('?')[0].split('#')[0]

  if (cleanUrl.startsWith('@/')) {
    // Get alias path from config or default to src
    const { spritesConfig } = getGlobalConfig()
    // Use type assertion or provide default value
    const aliasPath = spritesConfig?.aliasPath || 'src'
    return resolve(cwd(), aliasPath, cleanUrl.slice(2))
  } else if (cleanUrl.startsWith('/')) {
    return resolve(cwd(), cleanUrl.slice(1))
  } else {
    return resolve(parse(id).dir, cleanUrl)
  }
}

/** Get sprite CSS related dimensions */
function getSpritesCssSize(
  filePath: string,
  rule: Rule,
  targetSprite: SpritesStylesType
) {
  const opt = targetSprite.coordinates[filePath]
  const { properties, coordinates } = targetSprite
  const dir = spriteImageIndex.get(filePath) || ''
  const { scale: configScale } =
    findRule(dir.replace(cwd(), '.').replace(/\\/g, '/')) || {}
  let scale = 1
  const { spritesConfig } = getGlobalConfig()
  const rootValue = (spritesConfig && spritesConfig.rootValue) || 1
  const specialUnit = ['%', 'vw', 'vh', 'em']
  /**
   * Check if special unit
   */
  const checkSpecialUnit = (unit: string | undefined) => {
    if (unit === undefined) {
      return false
    }
    return specialUnit.some((u) => unit.includes(u))
  }
  const handleCssUnit = (unit: string) => {
    /**
     * px: direct conversion
     * rem: convert based on rootValue
     */
    if (unit.endsWith('rem')) {
      const num = parseFloat(unit)
      return num * rootValue + 'px'
    }
    return unit
  }
  const getRealScale = () => {
    if (!opt) {
      return 1
    }
    const { width, height } = getOriginalCssSize(rule)
    const _width = width ? handleCssUnit(width) : opt.width + 'px'
    const _height = height ? handleCssUnit(height) : opt.height + 'px'
    let scaleX = 1
    let scaleY = 1
    if (!checkSpecialUnit(_width)) {
      scaleX = parseFloat(_width) / opt.width
    }

    if (!checkSpecialUnit(_height)) {
      scaleY = parseFloat(_height) / opt.height
    }
    return Math.min(scaleX, scaleY)
  }

  scale = configScale || getRealScale()

  const result = {
    width: properties.width * scale,
    height: properties.height * scale,
    x: opt.x * scale,
    y: opt.y * scale,
    scale
  }

  return result
}

/**
 * Get original width/height set in CSS rule
 * @param rule PostCSS rule object
 * @returns Width/height value object
 */
function getOriginalCssSize(rule: Rule): { width?: string; height?: string } {
  let width: string | undefined
  let height: string | undefined

  rule.walkDecls((decl: Declaration) => {
    if (decl.prop === 'width') width = decl.value
    if (decl.prop === 'height') height = decl.value
  })

  return { width, height }
}

/**
 * Find corresponding sprite rule based on directory path
 * @param dir Directory path
 * @returns Matching rule or undefined
 */
function findRule(dir: string) {
  const { spritesConfig } = getGlobalConfig()
  if (!spritesConfig || !spritesConfig.rules) {
    return undefined
  }
  const rules = spritesConfig.rules || []

  return rules.find((rule) => rule.dir === dir)
}

/**
 * Check if sprite configuration is valid
 * @returns Whether configuration is valid
 */
function checkSpriteConfig() {
  const { spritesConfig } = getGlobalConfig()
  return !!(
    spritesConfig &&
    spritesConfig.rules &&
    spritesConfig.rules.length > 0
  )
}

/**
 * Initialize originalFileNames, compatible with vite@4.x missing originalFileNames issue
 * @param bundle
 * @param viteConfig
 * @returns
 */
export async function initOriginalFileNames(
  bundle: any,
  viteConfig: UserConfig
) {
  const { imgAssetsDir } = getGlobalConfig()

  if (!imgAssetsDir) {
    return
  }

  for (const key in bundle) {
    const { ext } = parse(key)
    if (IMG_FORMATS_ENUM[ext.replace('.', '') as ImgFormatType]) {
      const { originalFileNames, name, source } = bundle[key]
      if (originalFileNames) {
        continue
      }
      bundle[key].originalFileNames = []
      const paths = findImgFileAbsolutePathByName(imgAssetsDir, name)
      for (let index = 0; index < paths.length; index++) {
        const path = paths[index]
        const buffer = readFileSync(path)

        if (buffer.equals(source)) {
          // Match corresponding image buffer
          const originalFileName = normalizePath(
            relative(viteConfig.root || './', path)
          )
          bundle[key].originalFileNames.push(originalFileName)
        }
      }
    }
  }
}

/**
 * Initialize sprite information in bundle
 * @param bundle
 */
export async function initBundleStyles(bundle: any) {
  const { spritesConfig, debugLog } = getGlobalConfig()
  const absolutePaths = []
  for (const key in bundle) {
    const { ext } = parse(key)
    if (IMG_FORMATS_ENUM[ext.replace('.', '') as ImgFormatType]) {
      const { fileName, originalFileNames } = bundle[key]
      if (!originalFileNames || !originalFileNames[0]) {
        continue
      }
      const absolutePath = join(cwd(), originalFileNames[0])
      // Find corresponding sprite configuration
      const targetSprite = filterSpriteImg(absolutePath)
      if (!targetSprite) {
        continue
      }
      bundleStyles.set(parse(fileName).base, {
        styles: targetSprite,
        absolutePath
      })
      absolutePaths.push(absolutePath)
      const { deleteOriginImg } = spritesConfig || {}
      if (deleteOriginImg) {
        // Delete individual image bundle
        delete bundle[key]
      }
    }
  }
  if (debugLog) {
    console.log('🐛Sprite sub-images in bundle:', absolutePaths)
  }
}

export async function handleSpritesCssBundle(that: PluginContext, bundle: any) {
  const { debugLog } = getGlobalConfig()
  for (const key in bundle) {
    if (isCssFile(key)) {
      const css = bundle[key].source || ''
      const res = await postcss([
        (root: postcss.Root) => {
          root.walkRules((rule: postcss.Rule) => {
            rule.walkDecls(
              /background(-image)?$/i,
              (decl: postcss.Declaration) => {
                const { value } = decl

                URL_REGEX.lastIndex = 0
                const imageMatch = URL_REGEX.exec(value)

                if (!imageMatch || !imageMatch[2]) return

                const url = imageMatch[2].trim()
                const base64 = isBase64(url)
                const stylesKey = base64 ? url : parse(url).base

                // Check if image is part of sprite
                if (!bundleStyles.has(stylesKey)) return

                const { styles: targetSprite, absolutePath } =
                  bundleStyles.get(stylesKey)!

                const { referenceId } = targetSprite
                const spritesAssetsPath = that.getFileName(referenceId || '')

                const spriteBase = parse(spritesAssetsPath).base

                // Replace image path in css with sprite
                decl.value = value.replace(
                  new RegExp(escapeRegex(url), 'g'),
                  base64
                    ? getRelativeAssetPath(key, spritesAssetsPath)
                    : url.replace(parse(url).base, spriteBase)
                )
                if (debugLog) {
                  console.log(
                    '🐛~ Replace sprite in css:',
                    url,
                    '-->',
                    decl.value
                  )
                }
                modifySpritesCss(rule, targetSprite, absolutePath)
              }
            )
          })
        }
      ]).process(css, { from: undefined })

      bundle[key].source = res.css
    }
  }
}
