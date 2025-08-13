import postcss from 'postcss'
import { parse as parseHtml } from 'node-html-parser'
import { replaceWebpExt, getGlobalConfig, getImgWebpMap } from './utils'
import { parse } from 'path'
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
    const imgMap = getImgWebpMap()
    const selectors = await extractBackgroundImageSelectors(css)
    const webpCss = selectors.reduce((prev, { selector, imageUrl }) => {
        if (!imageUrl) {
            return prev + ''
        }
        const { base } = parse(imageUrl)

        if (!imgMap[base]) {
            return prev + ''
        }

        return (
            prev +
            `body.no-${bodyWebpClassName} ${selector}{background-image: url(${imageUrl})}` +
            `body.${bodyWebpClassName} ${selector}{background-image: url(${replaceWebpExt(imageUrl)})}`
        )
    }, '')

    return css + webpCss
}

export async function transformWebpExtInHtml(html: string) {
    const { bodyWebpClassName } = getGlobalConfig()
    const doc = parseHtml(html)
    const setWebpAttr = (dom: any, url: string | undefined) => {
        if (url) {
            dom.setAttribute(bodyWebpClassName, replaceWebpExt(url))
        }
    }

    doc.querySelectorAll('img[src]').forEach((img) => {
        setWebpAttr(img, img.getAttribute('src'))
    })

    doc.querySelectorAll('source[src], source[srcset]').forEach((source) => {
        if (source.hasAttribute('src')) {
            setWebpAttr(source, source.getAttribute('src'))
        }
        if (source.hasAttribute('srcset')) {
            setWebpAttr(source, source.getAttribute('srcset'))
        }
    })

    doc.querySelectorAll('[style]').forEach((element) => {
        const style = element.getAttribute('style')
        if (!style) {
            return
        }
        const match = style.match(
            /background(?:-image)?:\s*url\((['"]?)(.*?)\1\)/
        )
        if (match && match[2]) {
            element.setAttribute(
                bodyWebpClassName,
                style.replace(match[2], replaceWebpExt(match[2]))
            )
        }
    })
    return doc.toString()
}
