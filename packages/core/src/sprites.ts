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
  const { spriteDir } = spriteConfig
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
        const p = Object.keys(coordinates).find((p) => p === path)
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

export async function handleSprites(code: string, id: string) {
  if (!(id.endsWith('.vue') || isCssFile(id))) {
    return code
  }

  // 处理vue
  if (id.endsWith('.vue')) {
    handleVueSprite(code, id)
  } else if (isCssFile(id)) {
    handleSpriteCss(code, id)
  }
}

export async function handleVueSprite(code: string, id: string) {
  const { descriptor } = compilerParse(code)
  if (!descriptor.styles.length) {
    return code
  }

  for (const style of descriptor.styles) {
    style.content = await handleSpriteCss(style.content, id)
    console.log('🚀 ~ style.content:', style.content)
  }

  return descriptor.styles.map((style) => style.content).join('\n')
}

export async function handleSpriteCss(css: string, id: string) {
  const result = await postcss([
    (root: postcss.Root) => {
      root.walkRules((rule: postcss.Rule) => {
        processRule(rule, id)
        // rule.walkDecls(/background(-image)?$/i, (decl: postcss.Declaration) => {
        //   const { value } = decl
        //   const imageMatch = value.match(/url\((['"]?)([^"')]+)\1\)/)

        //   if (!imageMatch || !imageMatch[2]) return

        //   const url = imageMatch[2]
        //   const filePath = resolve(parse(id).dir, url)
        //   const targetSprite = filterSpriteImg(filePath)

        //   if (!targetSprite) return

        //   const { outPath, coordinates, properties } = targetSprite
        //   const spriteBase = parse(outPath).base
        //   const base = parse(url).base

        //   decl.value = value.replace(
        //     new RegExp(url, 'g'),
        //     url.replace(base, spriteBase)
        //   )

        //   const props: { [key: string]: string } = {
        //     'background-position': `-${coordinates[filePath].x}px -${coordinates[filePath].y}px`,
        //     'background-size': `${properties.width}px ${properties.height}px`,
        //     'background-repeat': 'no-repeat'
        //   }

        //   for (const key in props) {
        //     rule.walkDecls(key, (existingDecl) => existingDecl.remove())
        //     rule.append({ prop: key, value: props[key] })
        //   }
        // })
      })
    }
  ]).process(css, { from: undefined, parser: cssParser })
  return result.css
}

/**
 * 递归处理嵌套规则
 */
function processRule(rule: Rule, id: string) {
  rule.walkDecls(/background(-image)?$/i, (decl: postcss.Declaration) => {
    const { value } = decl
    const imageMatch = value.match(/url\((['"]?)([^"')]+)\1\)/)

    if (!imageMatch || !imageMatch[2]) return

    const url = imageMatch[2]
    const filePath = resolve(parse(id).dir, url)
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
      rule.walkDecls(key, (existingDecl) => {existingDecl.remove(); return})
      rule.append({ prop: key, value: props[key] })
    }
  })

  // 递归子规则
  rule.nodes?.forEach((node) => {
    console.log("🚀 ~ node:", node)
    if (node.type === 'rule') {
      processRule(node as Rule, id)
    }
  })
}
