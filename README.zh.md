# vite-plugin-image-tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

vite插件，打包压缩图片，支持转wbep，支持合并精灵图

## 注意
vite@6及以下版本，也就是vite的rollup版本

## 特性

🚀 功能

- 支持生产环境压缩和生成webp图片
- 支持开发环境压缩和预览webp图片效果
- 支持配置图片压缩质量
- 自动合并精灵图

## 安装

```bash
# npm
npm i -D vite-plugin-image-tools

# pnpm
pnpm i -D vite-plugin-image-tools
```

## 使用

```js
// vite.config.js
import { defineConfig } from 'vite'
import VitePluginImageTools from 'vite-plugin-image-tools'

export default defineConfig({
    plugins: [
        VitePluginImageTools({
            quality: 80
        })
    ]
})
```

# 配置参数

| 参数                | 类型               | 默认值                                                                                                                                      | Description                                                                                        |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| quality           | number           | 80                                                                                                                                       | 图片质量 (1-100)                                                                                       |
| includes          | string/RegExp    | ''                                                                                                                                       | 包含，如：`‘xxx.png'.includs(inclouds) includes.test('xxx.png')`                                        |
| excludes          | string/RegExp    | ''                                                                                                                                       | 排除项，如：`!'xxx.png'.includs(excludes) !includes.test('xxx.png')`                                     |
| filter            | function<string> | () => true                                                                                                                               | 过滤方法，可自定义过滤图片逻辑，支持async<br/>参数：图片路径<br/>如：<br/>filter: (path) => {  return path.includes('.png') } |
| limitSize         | number           | 无                                                                                                                                        | 文件大小限制，<=这个值不做任何压缩转换处理                                                                             |
| compatibility     | boolean          | false                                                                                                                                    | 是否兼容低版本浏览器，生产环境生效，<br/>true：只有css中的图片会转webp（暂时只支持打包时候处理css）<br/> false：全部转webp                     |
| bodyWebpClassName | string           | webp                                                                                                                                     | body标签的webp class，用于生成兼容webp的class                                                                 |
| enableWebp        | boolean          | false                                                                                                                                    | 生产环境是否转webp                                                                                        |
| enableDev         | boolean          | false                                                                                                                                    | 开发环境是否开启压缩                                                                                         |
| enableDevWebp     | boolean          | false                                                                                                                                    | 开发环境是否开启转webp                                                                                      |
| cacheDir          | string           | ‘node_modules/.cache/vite-plugin-image’                                                                                                  | 缓存路径， 默认，只在开发环境生效                                                                                  |
| spritesConfig     | Object           |                                                                                                                                          | 精灵图配置                                                                                              |
| webpConfig        | Object           |                                                                                                                                          | 转换webp配置                                                                                           |
| sharpConfig       | Object           | { jpeg?: JpegOptions, jpg?: JpegOptions, png?: PngOptions, webp?: WebpOptions, avif?: AvifOptions, tiff?: TiffOptions, gif?: GifOptions} | [sharp配置](https://sharp.pixelplumbing.com/api-output/#_top)                                        |
| svgoConfig        | Object           | {plugins:['preset-default',{name:'removerXMLNS'},{name:'removeViewBox'}],js2svg:{indent:2, pretty: true}}                                | [https://svgo.dev/docs/preset-default/]()                                                          |
| publicConfig      | Object           |                                                                                                                                          | public下的图片打包配置，如：publicConfig: {enable: true,quality: 80,}                                         |
| imgAssetsDir      | string/string[]  |                                                                                                                                          | 图片资源文件夹，兼容vite@4.x版本找不到原图路径问题；vite@4.x必填                                                           |
| log               | boolean          |                                                                                                                                          | 是否打印输出日志，默认true                                                                                    |

# 配置

## quality

图片压缩质量，取值范围：1-100，全局配置，如果sharpConfig有单独配置，则不生效

## includes

包含配置，过滤图片，支持配置字符串和正则，如：`‘xxx.png'.includs(inclouds) includes.test('xxx.png')`

## excludes

排除配置，过滤图片，支持配置字符串和正则，如：`!'xxx.png'.includs(excludes) !includes.test('xxx.png')`

## filter

全局过滤函数，接收path图片路径，返回boolean，支持异步函数

## enableWebp

是否开始打包webp图片，默认false，开启的话，会同时生成webp图片，自动修改图片后缀（如：xxx.png -> xxx.webp），受过滤配置影响（filter、includes、excludes）。

注意：开启后，全部符合条件的图片都会转webp，低端机可能不支持webp，酌情考虑是否开启

## webpConfig

打包webp相关配置：

```json
{
        /**
         * 过滤函数
         * @param path 图片路径
         */
        filter?: (path: string) => boolean,
        /**
        *是否删除原图，默认false-打包不会删除原图，如果要减少产物体积可设置true
        */
        deleteOriginImg?: boolean,
        /** 文件大小限制，<=这个值不做任何压缩转换处理 */
        limitSize?: number
}
```

## compatibility

是否开启兼容webp模式，默认false，

开启后，会在head标签插入判断设备webp兼容性的异步代码，动态全局替换webp的class，目前只支持兼容css中的bg图片，其他图片（如：img标签）不会转webp

注意：ios可能并不兼容head里异步请求，会导致webp和原图都加载，酌情考虑是否开启

## enableDev

是否开发环境生效，默认false

开启后，开发环境也能自动打包压缩图片

## enableDevWebp

是否开发环境启用转webp功能，默认false

开启后，开发环境也能自动转webp

## cacheDir

开发环境图片缓存路径，默认：‘node_modules/.cache/vite-plugin-image’

避免开发时重复压缩，优化开发体验

## spritesConfig

精灵图配置：开启后，可以将文件夹下的图片合并成一张精灵图，并自动修改css中的背景图size、position、repeat

```json
{
        rules: {
            /** 文件夹 */
            dir: string
            /** 后缀，默认sprites */
            suffix?: string
            padding?: number
            /** 压缩质量 */
            quality?: number
            /** css缩放 */
            scale?: number
            algorithm?:
                | 'top-down'
                | 'left-right'
                | 'diagonal'
                | 'alt-diagonal'
                | 'binary-tree'
        }[]
        /**
         * 精灵图输出文件夹
         */
        outputDir: string
        /**
        *是否删除原图，默认false-打包不会删除原图，如果要减少产物体积可设置true
        */
        deleteOriginImg?: boolean,
        /** 包含 */
        includes?: string | RegExp
        /** 排除 */
        excludes?: string | RegExp
        /** 后缀，默认sprites */
        suffix?: string
        algorithm?:
            | 'top-down'
            | 'left-right'
            | 'diagonal'
            | 'alt-diagonal'
            | 'binary-tree'
        /**
         * 单位转换
         * @param unit 单位px
         * @param filePath 单张图片的路径
         * @returns
         */
        transformUnit?: (unit: string, filePath: string) => string
        /**
         *rootValue，rem的转换单位
         */
        rootValue?: number
    }
```

注意：使用该功能，css中的width、height要填写具体数值(px | rem)（不能是%），不然会以原图片宽高去计算并修改size、position、repeat属性；使用rem要设置`rootValue` ，用于计算转换px

## sharpConfig

sharp压缩配置: [sharp配置](https://sharp.pixelplumbing.com/api-output/#_top)

```json
{
    jpeg?: JpegOptions
    jpg?: JpegOptions
    png?: PngOptions
    webp?: WebpOptions
    avif?: AvifOptions
    tiff?: TiffOptions
    gif?: GifOptions
}
```

## svgoConfig

svgo配置：https://svgo.dev/docs/preset-default/
