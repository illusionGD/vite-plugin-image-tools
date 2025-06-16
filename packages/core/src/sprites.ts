import { basename, join, parse } from 'path'
import { filterImage, getGlobalConfig, isSubPath, ruleCheck } from './utils'
import { cwd } from 'process'
import { existsSync, readdirSync, writeFileSync } from 'fs'
import Spritesmith from 'spritesmith'
import postcss from 'postcss'
import compiler, { type SFCDescriptor } from '@vue/compiler-sfc'

export const originalStyles: {
    [key: string]: {
        coordinates: {
            [key: string]: {
                x: number
                y: number
                width: number
                height: number
            }
        }
        properties: {
            width: number
            height: number
        }
        outPath: string
    }
} = {}

export function initSprite() {
    const { spriteConfig } = getGlobalConfig()
    if (!spriteConfig || !spriteConfig.spriteDir) {
        return Promise.reject(false)
    }
    const { spriteDir, includes, suffix, algorithm } = spriteConfig
    if (typeof spriteDir === 'string') {
        createSprites(spriteDir)
    } else {
        for (let index = 0; index < spriteDir.length; index++) {
            createSprites(spriteDir[index])
        }
    }
}

/** 生成精灵图 */
export async function createSprites(spriteDir: string) {
    const { spriteConfig } = getGlobalConfig()
    if (!spriteConfig || !spriteConfig.spriteDir) {
        return Promise.reject(false)
    }
    const { includes, suffix, algorithm, excludes } = spriteConfig
    const dir = join(cwd(), spriteDir)
    if (!existsSync(dir)) {
        return
    }
    const { name } = parse(dir)
    const outPath = `${name}-${suffix}.png`
    const files = readdirSync(dir)
        .map((name) => join(dir, name))
        .filter((path) => {
            if (includes && !ruleCheck(includes, path)) {
                return
            }
            if (excludes && ruleCheck(excludes, path)) {
                return
            }
            return !path.includes(outPath)
        })

    await new Promise((resolve, reject) => {
        Spritesmith.run({ src: files, algorithm }, function handleResult(err, result) {
            if (!err) {
                originalStyles[dir] = {
                    ...result,
                    outPath
                }
                writeFileSync(join(dir, outPath), result.image)
                resolve(true)
            } else {
                reject(err)
            }
        })
    })
}

export function filterSpriteImg(path: string) {
    const { spriteConfig } = getGlobalConfig()
    if (!spriteConfig || !spriteConfig.spriteDir) {
        return false
    }
    const { spriteDir } = spriteConfig
    if (typeof spriteDir === 'string') {
        const dir = join(cwd(), spriteDir)
        return isSubPath(dir, path)
    } else if (spriteDir instanceof Array) {
        spriteDir.some((str) => {
            const dir = join(cwd(), str)
            return isSubPath(dir, path)
        })
    }
    return false
}

export async function handleSprites(code: string, id: string) {
    if (!(id.endsWith('.vue') || id.endsWith('.scss') || id.endsWith('.css'))) {
        return code
    }

    // 处理vue
}

export async function handleVueSprite(code: string) {
    const { descriptor } = compiler.parse(code)
    if (!descriptor.styles.length) {
        return code
    }
    console.log('🚀 ~ descriptor.styles:', descriptor.styles)
}

export async function handleSpriteCss(css: string, id: string) {
    await postcss([
        (root: any) => {
            root.walkRules((rule: any) => {
                rule.walkDecls(/^background(-image)?$/i, (decl: any) => {
                    const { prop, value } = decl
                    const imageMatch = value.match(/url\s*$\s*(['"]?)([^"')]+)\1\s*$/)

                    if (!imageMatch || !imageMatch[2]) return
                    const url = imageMatch[2]
                    const imageName = basename(url).split('.')[0]
                })
            })
        }
    ]).process(css, { from: undefined })
}
