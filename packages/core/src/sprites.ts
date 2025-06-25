import { basename, join, parse, resolve } from 'path'
import {
  checkPattern,
  filterImage,
  getGlobalConfig,
  isCssFile,
  isSubPath
} from './utils'
import { cwd } from 'process'
import { existsSync, readdirSync, writeFileSync } from 'fs'
import Spritesmith from 'spritesmith'
import postcss, { Rule } from 'postcss'
import cssParser from 'postcss-scss'
import { type SFCDescriptor, parse as compilerParse } from '@vue/compiler-sfc'
import { compileString } from 'sass'
import MagicString from 'magic-string'

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

export async function initSprite() {
  const { spriteConfig } = getGlobalConfig()
  if (!spriteConfig || !spriteConfig.spriteDir) {
    return false
  }
  const { spriteDir } = spriteConfig
  if (typeof spriteDir === 'string') {
    await createSprites(spriteDir)
  } else {
    for (let index = 0; index < spriteDir.length; index++) {
      await createSprites(spriteDir[index])
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
  //   if (existsSync(join(dir, outPath))) {
  //     return
  //   }
  const files = readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((path) => {
      if (includes && !checkPattern(includes, path)) {
        return
      }
      if (excludes && checkPattern(excludes, path)) {
        return
      }
      return !path.includes(outPath)
    })

  await new Promise((resolve, reject) => {
    Spritesmith.run(
      { src: files, algorithm },
      function handleResult(err, result) {
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
      }
    )
  })
  return originalStyles
}

export async function handleSprites(code: string, id: string) {
  if (id.endsWith('.vue')) {
    return await handleVueSprite(code, id)
  } else if (isCssFile(id)) {
    const newCode = await handleSpriteCss(code, id)
    return {
      code: newCode.css,
      map: newCode.map as any // Ensure compatibility with SourceMapInput
    }
  }
}

/** 过滤精灵图片 */
export function filterSpriteImg(path: string) {
  const { spriteConfig } = getGlobalConfig()
  if (!spriteConfig || !spriteConfig.spriteDir) {
    return false
  }
  const { spriteDir } = spriteConfig
  const isSpriteImg = (path: string) => {
    for (const key in originalStyles) {
      if (Object.prototype.hasOwnProperty.call(originalStyles, key)) {
        const { coordinates } = originalStyles[key]
        const p = Object.keys(coordinates).find((p) => {
          return p === path
        })
        if (p) {
          return originalStyles[key]
        }
      }
    }
    return false
  }
  if (typeof spriteDir === 'string') {
    return isSpriteImg(path)
  } else if (spriteDir instanceof Array) {
    spriteDir.some((str) => {
      return isSpriteImg(path)
    })
  }
  return false
}

/** 处理vue的css代码，替换精灵图 */
export async function handleVueSprite(code: string, id: string) {
  const { descriptor } = compilerParse(code)
  if (!descriptor.styles.length) {
    return { code, map: null }
  }

  const ms = new MagicString(code)

  for (const style of descriptor.styles) {
    const transformedCss = await handleSpriteCss(style.content, id)
    ms.overwrite(
      style.loc.start.offset,
      style.loc.end.offset,
      transformedCss.css
    )
  }

  return {
    code: ms.toString(),
    map: ms.generateMap({ hires: true })
  }
}

/** 处理css代码，替换精灵图 */
export async function handleSpriteCss(css: string, id: string) {
  const compileCss = await compileString(css)
  const res = await postcss([
    (root: postcss.Root) => {
      root.walkRules((rule: postcss.Rule) => {
        processSpritesBgRule(rule, id)
      })
    }
  ]).process(compileCss.css, { from: undefined, parser: cssParser })
  return res
}

/**
 * 递归处理嵌套css背景规则
 */
function processSpritesBgRule(rule: Rule, id: string) {
  rule.walkDecls(/background(-image)?$/i, (decl: postcss.Declaration) => {
    const { value } = decl
    const imageMatch = value.match(/url\((['"]?)([^"')]+)\1\)/)

    if (!imageMatch || !imageMatch[2]) return

    const url = imageMatch[2]
    const filePath = /^(\.\/)/.test(url)
      ? join(parse(id).dir, url)
      : join(cwd(), url)

    const targetSprite = filterSpriteImg(filePath)

    if (!targetSprite) return

    const { outPath, coordinates, properties } = targetSprite
    const spriteBase = parse(outPath).base
    const base = parse(url).base

    decl.value = value.replace(
      new RegExp(url, 'g'),
      url.replace(base, spriteBase)
    )

    const props: { [key: string]: string } = {
      'background-position': `-${coordinates[filePath].x}px -${coordinates[filePath].y}px`,
      'background-size': `${properties.width}px ${properties.height}px`,
      'background-repeat': 'no-repeat'
    }

    for (const key in props) {
      rule.walkDecls(key, (existingDecl) => {
        existingDecl.remove()
        return
      })
      rule.append({ prop: key, value: props[key] })
    }
  })

  // 递归子规则
  // rule.nodes?.forEach((node) => {
  //   if (node.type === 'rule') {
  //     processSpritesBgRule(node as Rule, id)
  //   }
  // })
}
