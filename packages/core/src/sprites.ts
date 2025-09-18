import { join, parse, resolve } from 'path'
import { checkPattern, getGlobalConfig, isCssFile } from './utils'
import { cwd } from 'process'
import { existsSync, readdirSync, writeFileSync } from 'fs'
import postcss, { Declaration, Rule } from 'postcss'
import postcssNested from 'postcss-nested'
import * as postcssScss from 'postcss-scss'
import { parse as compilerParse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import type { SpritesStylesType } from './types'
import { pressBufferToImage } from './compress'
import { IMG_FORMATS_ENUM } from './constants'
import postcssLess from 'postcss-less'

/** css扩展语言 */
const EXTEND_CSS = {
    scss: 'scss',
    sass: 'sass',
    less: 'less'
} as const

type ExtendCssType = keyof typeof EXTEND_CSS

/**
 * 精灵图样式存储对象
 * 用于存储每个精灵图的坐标信息、尺寸信息和输出路径
 */
const originalStyles: {
    [key: string]: SpritesStylesType
} = {}

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
export async function initSprite() {
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
 * 文件类型处理策略映射
 */
const FILE_TYPE_HANDLERS: Record<
    string,
    (code: string, id: string) => Promise<any>
> = {
    scss: (code: string, id: string) =>
        handleSpriteExtendCss(code, id, EXTEND_CSS.scss),
    sass: (code: string, id: string) =>
        handleSpriteExtendCss(code, id, EXTEND_CSS.sass),
    css: (code: string, id: string) => handleSpriteCss(code, id),
    less: (code: string, id: string) =>
        handleSpriteExtendCss(code, id, EXTEND_CSS.less),
    vue: (code: string, id: string) => handleVueSprite(code, id)
}

/**
 * 根据文件类型处理精灵图替换
 * @param code 源代码内容
 * @param id 文件路径标识
 * @returns 处理后的代码和 sourcemap
 */
export async function handleSprites(code: string, id: string) {
    // 确定文件类型
    let fileType: string | null = null

    if (id.endsWith('.vue')) {
        fileType = 'vue'
    } else if (id.endsWith('.scss')) {
        fileType = 'scss'
    } else if (id.endsWith('.sass')) {
        fileType = 'sass'
    } else if (id.endsWith('.less')) {
        fileType = 'less'
    } else if (isCssFile(id)) {
        fileType = 'css'
    }

    if (!fileType || !FILE_TYPE_HANDLERS[fileType]) {
        return { code }
    }

    const handler = FILE_TYPE_HANDLERS[fileType]
    const result = await handler(code, id)

    return {
        code: result.css,
        map: result.map
    }
}

/**
 * 检查指定路径的图片是否属于某个精灵图
 * @param path 图片文件路径
 * @returns 如果是精灵图的一部分，返回精灵图信息；否则返回 false
 */
export function filterSpriteImg(path: string) {
    if (!checkSpriteConfig()) {
        return false
    }

    // 使用索引快速查找
    const spritesDir = spriteImageIndex.get(path)
    if (spritesDir && originalStyles[spritesDir]) {
        return originalStyles[spritesDir]
    }

    return false
}

/**
 * 处理 Vue 单文件组件中的精灵图替换
 * @param code Vue 文件源码
 * @param id 文件路径
 * @returns 处理后的代码和 sourcemap
 */
export async function handleVueSprite(code: string, id: string) {
    const { descriptor } = compilerParse(code)
    if (!descriptor.styles.length) {
        return { code, map: null }
    }

    const ms = new MagicString(code)

    for (const style of descriptor.styles) {
        const isExtend = EXTEND_CSS[style.lang as ExtendCssType]

        const transformedScss = isExtend
            ? await handleSpriteExtendCss(
                  style.content,
                  id,
                  style.lang as ExtendCssType
              )
            : await handleSpriteCss(style.content, id)
        ms.overwrite(
            style.loc.start.offset,
            style.loc.end.offset,
            transformedScss.css
        )
    }

    return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true })
    }
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
 * 处理 css扩展语言中的精灵图替换
 * @param code 样式源码
 * @param id 文件路径
 * @returns 处理后的 PostCSS 结果
 */
export async function handleSpriteExtendCss(
    code: string,
    id: string,
    type: ExtendCssType
) {
    try {
        const css = await flattenSelectors(code, type)
        const parser = type === 'scss' ? postcssScss : postcssLess
        const res = await postcss([
            (root: postcss.Root) => {
                root.walkRules((rule: postcss.Rule) => {
                    processSpritesBgRule(rule, id)
                })
            }
        ]).process(css, { from: undefined, parser })

        return res
    } catch (error) {
        // 降级处理：直接当作 CSS 处理
        return await handleSpriteCss(code, id)
    }
}

/**
 * 更严格的 URL 匹配正则表达式
 */
const URL_REGEX = /url\s*\(\s*(['"]?)([^"')]+?)\1\s*\)/gi

/**
 * 处理 CSS 规则中的背景图片，替换为精灵图
 * @param rule PostCSS 规则对象
 * @param id 文件路径
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

        const options = getSpritesCssSize(filePath, rule, targetSprite)

        decl.value = value.replace(
            new RegExp(escapeRegex(url), 'g'),
            url.replace(base, spriteBase)
        )

        const props = getBgCss(targetSprite, filePath, options).props

        for (const key in props) {
            if (props[key]) {
                // 只处理有值的属性
                rule.walkDecls(key, (existingDecl) => {
                    existingDecl.remove()
                    return
                })
                rule.append({ prop: key, value: props[key] })
            }
        }
    })
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
 * 生成精灵图的 CSS 属性
 * @param targetSprite 精灵图信息
 * @param filePath 原始图片路径
 * @param opt 可选的缩放参数
 * @returns CSS 属性对象和字符串
 */
function getBgCss(
    targetSprite: SpritesStylesType,
    filePath: string,
    opt?: {
        width?: number
        height?: number
        x?: number
        y?: number
    }
): {
    props: { [key: string]: string }
    css: string
} {
    const { spritesConfig } = getGlobalConfig()
    const { coordinates, properties } = targetSprite
    const { width, height, x, y } = opt || {}

    // 检查坐标信息是否存在
    const coordInfo = coordinates[filePath]
    if (!coordInfo) {
        return {
            props: {},
            css: ''
        }
    }

    const sw = width || properties.width
    const sh = height || properties.height
    const sx = x !== undefined ? x : coordInfo.x
    const sy = y !== undefined ? y : coordInfo.y

    const _width = spritesConfig?.transformUnit
        ? spritesConfig.transformUnit(`${sw}px`, filePath)
        : `${sw}px`
    const _height = spritesConfig?.transformUnit
        ? spritesConfig.transformUnit(`${sh}px`, filePath)
        : `${sh}px`
    const _x = spritesConfig?.transformUnit
        ? spritesConfig.transformUnit(`${sx}px`, filePath)
        : `${sx}px`
    const _y = spritesConfig?.transformUnit
        ? spritesConfig.transformUnit(`${sy}px`, filePath)
        : `${sy}px`

    return {
        props: {
            'background-position': `-${_x} -${_y} !important`,
            'background-size': `${_width} ${_height} !important`,
            'background-repeat': 'no-repeat !important'
        },
        css: `background-position: -${_x} -${_y} !important;
    background-size: ${_width} ${_height} !important;
    background-repeat: no-repeat !important;`
    }
}

/**
 * 拍平 样式 嵌套选择器结构
 * @param code 样式 源码
 * @returns 拍平后的 CSS
 */
export async function flattenSelectors(
    code: string,
    type: ExtendCssType
): Promise<string> {
    try {
        const parser =
            type === 'scss' || type === 'sass' ? postcssScss : postcssLess

        const result = await postcss([postcssNested()]).process(code, {
            parser,
            from: undefined
        })

        return result.css
    } catch (error) {
        console.warn(type + '样式拍平处理失败，返回原始代码:', error)
        return code
    }
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
        const aliasPath = (spritesConfig as any)?.aliasPath || 'src'
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
    const { properties } = targetSprite
    const dir = spriteImageIndex.get(filePath) || ''
    const { scale: configScale } =
        findRule(dir.replace(cwd(), '.').replace(/\\/g, '/')) || {}
    let scale = 1

    if (configScale) {
        scale = configScale
    } else {
        const { width, height } = getOriginalCssSize(rule)

        if (width && height) {
            const _width = parseFloat(width)
            const _height = parseFloat(height)
            if (opt && !width.includes('%') && !height.includes('%')) {
                const scaleX = _width / opt.width
                const scaleY = _height / opt.height
                scale = Math.min(scaleX, scaleY)
            }
        }
    }

    return {
        width: properties.width * scale,
        height: properties.height * scale,
        x: opt.x * scale,
        y: opt.y * scale
    }
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
