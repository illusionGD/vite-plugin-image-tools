import postcss from 'postcss'
import { parse as parseHtml } from 'node-html-parser'
import { replaceExt, getGlobalConfig, getImgConvertMap } from './utils'
import { parse } from 'path'
import { IMG_FORMATS_ENUM } from './constants'
import type { SharpImgFormatType } from './types'
interface BackgroundImageSelector {
    selector: string
    imageUrl: string
    value: string
}
/** Get CSS selectors with background images */
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

/** Replace image extension in CSS to target format */
export async function transformExtInCss(
    css: string,
    targetFormat: SharpImgFormatType = IMG_FORMATS_ENUM.webp
) {
    const { bodyWebpClassName } = getGlobalConfig()
    const imgMap = getImgConvertMap()
    const selectors = await extractBackgroundImageSelectors(css)
    const convertedCss = selectors.reduce((prev, { selector, imageUrl }) => {
        if (!imageUrl) {
            return prev + ''
        }
        const { base } = parse(imageUrl)

        if (!imgMap[decodeURIComponent(base)]) {
            return prev + ''
        }

        return (
            prev +
            `body.no-${bodyWebpClassName} ${selector}{background-image: url(${imageUrl})}` +
            `body.${bodyWebpClassName} ${selector}{background-image: url(${replaceExt(imageUrl, targetFormat)})}`
        )
    }, '')

    return css + convertedCss
}

/** Replace image extension in HTML to target format */
export async function transformExtInHtml(
    html: string,
    targetFormat: SharpImgFormatType = IMG_FORMATS_ENUM.webp
) {
    const { bodyWebpClassName } = getGlobalConfig()
    const doc = parseHtml(html)
    const setConvertedAttr = (dom: any, url: string | undefined) => {
        if (url) {
            dom.setAttribute(bodyWebpClassName, replaceExt(url, targetFormat))
        }
    }

    doc.querySelectorAll('img[src]').forEach((img) => {
        setConvertedAttr(img, img.getAttribute('src'))
    })

    doc.querySelectorAll('source[src], source[srcset]').forEach((source) => {
        if (source.hasAttribute('src')) {
            setConvertedAttr(source, source.getAttribute('src'))
        }
        if (source.hasAttribute('srcset')) {
            setConvertedAttr(source, source.getAttribute('srcset'))
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
                style.replace(match[2], replaceExt(match[2], targetFormat))
            )
        }
    })
    return doc.toString()
}
