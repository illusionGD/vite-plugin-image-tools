import { basename, join, parse, relative, resolve } from 'path'
import {
    checkPattern,
    getGlobalConfig,
    getRelativeAssetPath,
    isBase64,
    isCssFile,
    normalizePath
} from './utils'
import { cwd } from 'process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import postcss, { Declaration, Rule } from 'postcss'
import type { AnyObject, ImgFormatType, SpritesStylesType } from './types'
import { pressBufferToImage } from './compress'
import { IMG_FORMATS_ENUM } from './constants'
import type { PluginContext } from 'rollup'

/**
 * 精灵图样式存储对象
 * 用于存储每个精灵图的坐标信息、尺寸信息、输出路径、vite引用id等
 */
const originalStyles: {
    [key: string]: SpritesStylesType
} = {}

/**
 * 打包bundle单个图片对应的精灵图信息对象
 */
const bundleStyles = new Map<
    string,
    {
        styles: SpritesStylesType
        /**绝对路径 */
        absolutePath: string
    }
>()

/**
 * 精灵图查找索引，用于快速查找图片属于哪个精灵图
 */
const spriteImageIndex: Map<string, string> = new Map()

/**
 * 清理精灵图缓存
 */
export function clearSpriteCache() {
    Object.keys(originalStyles).forEach((key) => delete originalStyles[key])
    spriteImageIndex.clear()
}

/**
 * 初始化精灵图生成流程
 * 读取配置中的所有规则，为每个目录生成对应的精灵图
 */
export async function initSprite(that: PluginContext) {
    const { spritesConfig } = getGlobalConfig()

    if (!checkSpriteConfig()) {
        return
    }

    const rules = spritesConfig?.rules || []

    // 并行处理所有规则
    try {
        await Promise.all(
            rules.map((rule) => {
                return createSprites(rule.dir)
            })
        )

        if (that.environment.config.command === 'build') {
            // emitFile，将精灵图加入打包bundle
            Object.keys(originalStyles).forEach((dir) => {
                const { outPathName, image } = originalStyles[dir]
                const spritesPath = join(dir, outPathName)
                const referenceId = that.emitFile({
                    type: 'asset',
                    name: outPathName,
                    originalFileName: normalizePath(
                        relative(that.environment.config.root, spritesPath)
                    ),
                    source: image
                })
                // 添加引用id
                originalStyles[dir].referenceId = referenceId
            })

            // 处理base64小图
            const assetsInlineLimit =
                that.environment.config.build.assetsInlineLimit
            if (assetsInlineLimit) {
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
                        }
                    }
                })
            }
        }
    } catch (error) {
        console.log('[Sprite Error]', error)
    }
}

/**
 * 为指定目录生成精灵图
 * @param spritesDir 精灵图源文件目录路径
 * @returns 返回精灵图样式信息
 */
export async function createSprites(spritesDir: string) {
    const { spritesConfig, quality, sharpConfig } = getGlobalConfig()

    if (!spritesConfig) {
        return
    }

    const rule = findRule(spritesDir)
    const algorithm = rule
        ? rule.algorithm || spritesConfig.algorithm
        : spritesConfig.algorithm

    const { includes, suffix, excludes } = spritesConfig
    const dir = join(cwd(), spritesDir)

    if (!existsSync(dir)) {
        return
    }

    const { name } = parse(dir)
    const outPathName = `${name}-${suffix}.png`

    //  过滤图片
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

        // 压缩
        result.image = await pressBufferToImage(
            result.image,
            IMG_FORMATS_ENUM.png,
            sharpConfig.png || {
                quality
            }
        )

        originalStyles[dir] = {
            ...result,
            outPathName
        }

        // 建立快速查找索引
        Object.keys(result.coordinates).forEach((filePath) => {
            spriteImageIndex.set(filePath, dir)
        })

        writeFileSync(join(dir, outPathName), result.image)

        return originalStyles
    } catch (error) {
        // 降级处理：继续处理其他精灵图
        return null
    }
}

/**
 * 检查指定路径的图片是否属于某个精灵图
 * @param path 图片文件绝对路径，D:\xxx\xxx.png
 * @returns 如果是精灵图的一部分，返回精灵图信息；否则返回 false
 */
export function filterSpriteImg(path: string) {
    if (!checkSpriteConfig()) {
        return false
    }

    // 使用索引快速查找
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
 * 处理 CSS 代码中的精灵图替换
 * @param css CSS 源码
 * @param id 文件路径
 * @returns 处理后的 PostCSS 结果
 */
export async function handleSpriteCss(css: string, id: string) {
    const res = await postcss([
        (root: postcss.Root) => {
            root.walkRules((rule: postcss.Rule) => {
                processSpritesBgRule(rule, id)
            })
        }
    ]).process(css, { from: undefined })
    return res
}

/**
 * 更严格的 URL 匹配正则表达式
 */
const URL_REGEX = /url\s*\(\s*(['"]?)([^"')]+?)\1\s*\)/gi

/**
 * 处理 CSS 规则中的背景图片，替换为精灵图
 * @param rule PostCSS 规则对象
 * @param id 文件路径
 * @param isBuild 是否为构建模式
 */
function processSpritesBgRule(rule: Rule, id: string) {
    rule.walkDecls(/background(-image)?$/i, (decl: postcss.Declaration) => {
        const { value } = decl

        // 重置正则表达式的lastIndex
        URL_REGEX.lastIndex = 0
        const imageMatch = URL_REGEX.exec(value)

        if (!imageMatch || !imageMatch[2]) return

        const url = imageMatch[2].trim()

        // 解析图片路径为绝对路径
        const filePath: string = resolveImagePath(url, id)

        // 检查是否为精灵图中的图片
        const targetSprite = filterSpriteImg(filePath)

        if (!targetSprite) return

        const { outPathName } = targetSprite
        const spriteBase = parse(outPathName).base
        const base = parse(url).base

        decl.value = value.replace(
            new RegExp(escapeRegex(url), 'g'),
            url.replace(base, spriteBase)
        )

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

    // 检查坐标信息是否存在
    const coordInfo = coordinates[filePath]
    const sw = width || properties.width + 'px'
    const sh = height || properties.height + 'px'
    const sx = x !== undefined ? x : coordInfo.x + 'px'
    const sy = y !== undefined ? y : coordInfo.y + 'px'
    const getUnit = (str: string) => {
        return spritesConfig?.transformUnit
            ? spritesConfig.transformUnit(str, filePath)
            : str
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
            // 只处理有值的属性
            rule.walkDecls(key, (existingDecl) => {
                existingDecl.remove()
                return
            })
            rule.append({ prop: key, value: val })
        }
    }
}

/**
 * 转义正则表达式特殊字符
 * @param str 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 解析图片路径为绝对路径
 * @param url 图片 URL
 * @param id 当前文件路径
 * @returns 绝对路径
 */
function resolveImagePath(url: string, id: string): string {
    // 清理 URL 中的查询参数和 hash
    const cleanUrl = url.split('?')[0].split('#')[0]

    if (cleanUrl.startsWith('@/')) {
        // 获取配置中的别名路径或默认使用 src
        const { spritesConfig } = getGlobalConfig()
        // 使用类型断言或提供默认值
        const aliasPath = spritesConfig?.aliasPath || 'src'
        return resolve(cwd(), aliasPath, cleanUrl.slice(2))
    } else if (cleanUrl.startsWith('/')) {
        return resolve(cwd(), cleanUrl.slice(1))
    } else {
        return resolve(parse(id).dir, cleanUrl)
    }
}

/** 获取精灵图css相关尺寸大小 */
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
    const checkSpecialUnit = (unit: string | undefined) => {
        if (unit === undefined) {
            return false
        }
        return specialUnit.some((u) => unit.includes(u))
    }
    const handleCssUnit = (unit: string) => {
        /**
         * px：直接转
         * rem：根据传入的rootValue转换
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

    const result: AnyObject = {
        width: properties.width * scale,
        height: properties.height * scale,
        x: opt.x * scale,
        y: opt.y * scale,
        scale
    }

    // 转rem单位
    Object.keys(result).forEach((key) => {
        const val = result[key]
        if (val && typeof val === 'number' && key !== 'scale') {
            result[key] = val / rootValue + 'rem'
        }
    })

    return result
}

/**
 * 获取 CSS 规则中设置的原始宽高
 * @param rule PostCSS 规则对象
 * @returns 宽高值对象
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
 * 根据目录路径查找对应的精灵图规则
 * @param dir 目录路径
 * @returns 匹配的规则或 undefined
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
 * 检查精灵图配置是否有效
 * @returns 配置是否有效
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
 * 初始化bundle中的精灵图信息
 * @param bundle
 */
export async function initBundleStyles(bundle: any) {
    for (const key in bundle) {
        const { ext } = parse(key)
        if (IMG_FORMATS_ENUM[ext.replace('.', '') as ImgFormatType]) {
            const { fileName, originalFileNames } = bundle[key]
            const absolutePath = join(cwd(), originalFileNames[0]).replace(
                /\//,
                '\\'
            )
            //   查找对应的精灵图信息配置
            const targetSprite = filterSpriteImg(absolutePath)
            if (!targetSprite) {
                continue
            }
            bundleStyles.set(parse(fileName).base, {
                styles: targetSprite,
                absolutePath
            })
            //  删除单个图片bundle
            delete bundle[key]
        }
    }
}

export async function handleSpritesCssBundle(that: PluginContext, bundle: any) {
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

                                // 检查是否为精灵图中的图片
                                if (!bundleStyles.has(stylesKey)) return

                                const { styles: targetSprite, absolutePath } =
                                    bundleStyles.get(stylesKey)!

                                const { referenceId } = targetSprite
                                const spritesAssetsPath = that.getFileName(
                                    referenceId || ''
                                )

                                const spriteBase = parse(spritesAssetsPath).base

                                // 替换css的图片路径，更换成精灵图
                                decl.value = value.replace(
                                    new RegExp(escapeRegex(url), 'g'),
                                    base64
                                        ? getRelativeAssetPath(
                                              key,
                                              spritesAssetsPath
                                          )
                                        : url.replace(
                                              parse(url).base,
                                              spriteBase
                                          )
                                )

                                modifySpritesCss(
                                    rule,
                                    targetSprite,
                                    absolutePath
                                )
                            }
                        )
                    })
                }
            ]).process(css, { from: undefined })

            bundle[key].source = res.css
        }
    }
}
