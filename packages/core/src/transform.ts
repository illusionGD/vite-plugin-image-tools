import postcss from 'postcss'
import { replaceWebpExt } from './utils'
import { getGlobalConfig } from './cache'
interface BackgroundImageSelector {
  selector: string
  imageUrl: string
  value: string
}

export async function extractBackgroundImageSelectors(
  css: string
): Promise<BackgroundImageSelector[]> {
  const backgroundImageSelectors: BackgroundImageSelector[] = []
  const getSelectors = (rule: any, decl: any) => {
    const match = decl.value.match(/url\((['"]?)(.*?)\1\)/)
    if (match) {
      backgroundImageSelectors.push({
        selector: rule.selector,
        imageUrl: match[2],
        value: decl.value
      })
    }
  }

  await postcss([
    (root: any) => {
      root.walkRules((rule: any) => {
        rule.walkDecls('background', (decl: any) => {
          getSelectors(rule, decl)
        })

        rule.walkDecls('background-image', (decl: any) => {
          getSelectors(rule, decl)
        })
      })
    }
  ]).process(css, { from: undefined })

  return backgroundImageSelectors
}

export async function transformWebpExtInCss(css: string) {
  const { bodyWebpClassName } = getGlobalConfig()
  const selectors = await extractBackgroundImageSelectors(css)
  const webpCss = selectors.reduce((prev, { selector, imageUrl }) => {
    return (
      prev +
      `.${bodyWebpClassName} ${selector}{background-image: url(${replaceWebpExt(imageUrl)})}`
    )
  }, '')

  return css + webpCss
}
