# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh.md)

A Vite plugin that supports image compression during build, conversion to WebP, and sprite sheet generation.

## Feature

🚀 Functions

- Supports production environment compression and WebP generation
- Supports development environment compression and WebP preview
- Configurable image compression quality
- Automatic sprite merging

## Installation

```bash
# npm
npm i -D vite-plugin-image-tools

# pnpm
pnpm i -D vite-plugin-image-tools

#yarn
yarn add -D vite-plugin-image-tools
```

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import VitePluginImageTools from 'vite-plugin-image-tools'

export default defineConfig({
  plugins: [
    VitePluginImageTools({
      quality: 80,
      enableWebp: true，
      enableDev:true,
      enableDevWebp:true
    })
  ]
})
```

## Options
| Option            | Type              | Default                                                                                                         | Description                                                                         |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| quality           | number            | 80                                                                                                              | Image quality (1–100)                                                               |
| includes          | string / RegExp   | ''                                                                                                              | Include filter, e.g. `'xxx.png'.includes(includes)` or `includes.test('xxx.png')`   |
| excludes          | string / RegExp   | ''                                                                                                              | Exclude filter, e.g. `!'xxx.png'.includes(excludes)` or `!excludes.test('xxx.png')` |
| filter            | function<string>  | () => true                                                                                                      | Custom filter function (async supported), param: image path                         |
| limitSize         | number            | none                                                                                                            | Skip compression for files <= this size                                             |
| compatibility     | boolean           | false                                                                                                           | WebP compatibility mode; only CSS images will be converted to WebP when true        |
| bodyWebpClassName | string            | webp                                                                                                            | Class added to `<body>` when WebP is supported                                      |
| enableWebp        | boolean           | false                                                                                                           | Whether to convert images to WebP in production                                     |
| enableDev         | boolean           | false                                                                                                           | Enable compression in development                                                   |
| enableDevWebp     | boolean           | false                                                                                                           | Enable WebP generation in development                                               |
| cacheDir          | string            | `node_modules/.cache/vite-plugin-image`                                                                         | Cache directory (development only)                                                  |
| spritesConfig     | Object            |                                                                                                                 | Sprite sheet configuration                                                          |
| webpConfig        | Object            |                                                                                                                 | WebP build configuration                                                            |
| sharpConfig       | Object            | { jpeg?, jpg?, png?, webp?, avif?, tiff?, gif? }                                                                | Sharp configuration                                                                 |
| svgoConfig        | Object            | `{ plugins: ['preset-default', {name:'removerXMLNS'}, {name:'removeViewBox'}], js2svg:{indent:2, pretty:true}}` | SVGO configuration                                                                  |
| publicConfig      | Object            |                                                                                                                 | Config for compressing images under `public/`                                       |
| imgAssetsDir      | string / string[] |                                                                                                                 | Image assets directory (required for Vite 4.x)                                      |
| log               | boolean           | true                                                                                                            | Whether to print logs                                                               |

```ts
export type PluginOptions = {
  /** 
   * @en Compression quality, default: 80
   * @zh 压缩质量，默认值：80
   */
  quality: number

  /** 
   * @en Whether to enable in development environment
   * @zh 是否在开发环境启用
   */
  enableDev: boolean

  /** 
   * @en Whether to enable WebP in development environment
   * @zh 是否在开发环境启用 WebP
   */
  enableDevWebp: boolean

  /** 
   * @en Whether to enable WebP during build
   * @zh 是否在构建时启用 WebP
   */
  enableWebp: boolean

  /** 
   * @en Include patterns
   * @zh 包含规则
   */
  includes: string | RegExp

  /** 
   * @en Exclude patterns
   * @zh 排除规则
   */
  excludes: string | RegExp

  /** 
   * @en Development image cache directory, default: node_modules/.cache/vite-plugin-image
   * @zh 开发环境图片缓存目录，默认为 node_modules/.cache/vite-plugin-image
   */
  cacheDir: string

  /** 
   * @en Sharp library configuration
   * @zh Sharp 图片处理库配置
   */
  sharpConfig: sharpConfigType

  /** 
   * @en SVGO configuration
   * @zh SVGO 配置
   */
  svgoConfig: svgoConfig

  /** 
   * @en Compatibility mode
   * @zh 兼容性模式
   */
  compatibility: boolean

  /** 
   * @en Class name added to body element when WebP is supported
   * @zh 当支持 WebP 时添加到 body 的类名
   */
  bodyWebpClassName: string

  /** 
   * @en File size limit, files <= this value will not be compressed or converted
   * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
   */
  limitSize?: number

  /** 
   * @en Whether to print output logs, default: true
   * @zh 是否打印输出日志，默认为 true
   */
  log?: boolean

  /** 
   * @en Whether to print debug logs
   * @zh 是否打印调试日志
   */
  debugLog?: boolean

  /**
   * @en Filter function
   * @zh 过滤函数
   * @param path Image path
   * @zh 图片路径
   */
  filter?: (path: string) => boolean

  /** 
   * @en Build WebP configuration
   * @zh 构建 WebP 配置
   */
  webpConfig?: {
    /**
     * @en Filter function
     * @zh 过滤函数
     * @param path Image path
     * @zh 图片路径
     */
    filter?: (path: string) => boolean

    /** 
     * @en Whether to delete original images
     * @zh 是否删除原图
     */
    deleteOriginImg?: boolean

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
     */
    limitSize?: number
  }

  /** 
   * @en Sprite image configuration
   * @zh 雪碧图配置
   */
  spritesConfig?: {
    rules: {
      /** 
       * @en Directory
       * @zh 目录
       */
      dir: string

      /** 
       * @en Output directory
       * @zh 输出目录
       */
      outputDir?: string

      /** 
       * @en File suffix, default: sprites
       * @zh 文件后缀，默认为 sprites
       */
      suffix?: string

      /** 
       * @en Padding value
       * @zh 图片间距
       */
      padding?: number

      /** 
       * @en CSS scaling
       * @zh CSS 缩放比例
       */
      scale?: number

      /** 
       * @en Spritesmith algorithm
       * @zh 雪碧图布局算法
       */
      algorithm?:
        | 'top-down'
        | 'left-right'
        | 'diagonal'
        | 'alt-diagonal'
        | 'binary-tree'
    }[]

    /** 
     * @en Output directory
     * @zh 输出目录
     */
    outputDir?: string

    /** 
     * @en Include patterns
     * @zh 包含规则
     */
    includes?: string | RegExp

    /** 
     * @en Exclude patterns
     * @zh 排除规则
     */
    excludes?: string | RegExp

    /** 
     * @en File suffix, default: sprites
     * @zh 文件后缀，默认为 sprites
     */
    suffix?: string

    /** 
     * @en Spritesmith algorithm
     * @zh 雪碧图布局算法
     */
    algorithm?:
      | 'top-down'
      | 'left-right'
      | 'diagonal'
      | 'alt-diagonal'
      | 'binary-tree'

    /** 
     * @en Alias path used in CSS
     * @zh 供 CSS 使用的别名路径
     */
    aliasPath?: string

    /**
     * @en Unit conversion function
     * @zh 单位转换函数
     * @param unit Unit value
     * @param filePath Single image path
     */
    transformUnit?: (unit: number, filePath: string) => string

    /** 
     * @en Root value for rem conversion
     * @zh rem 转换的根值
     */
    rootValue?: number

    /** 
     * @en Whether to delete original images
     * @zh 是否删除原图
     */
    deleteOriginImg?: boolean
  }

  /** 
   * @en Public image configuration
   * @zh public 目录图片配置
   */
  publicConfig?: {
    /** 
     * @en Whether to enable
     * @zh 是否启用
     */
    enable?: boolean

    /** 
     * @en Compression quality
     * @zh 压缩质量
     */
    quality?: number

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 文件大小限制，小于等于此值的文件不会进行压缩或转换
     */
    limitSize?: number
  }

  /** 
   * @en Image assets directory, used to fix vite@4.x cannot find original image path
   * @zh 图片资源目录，用于解决 vite@4.x 找不到原始图片路径的问题
   */
  imgAssetsDir?: string | string[]

  /** 
   * @en Vite configuration
   * @zh Vite 配置
   */
  viteConfig?: UserConfig

  /** 
   * @en Whether current environment is build
   * @zh 是否为构建环境
   */
  isBuild?: boolean
}
```
# Configuration Details

## quality
Global compression quality (1–100).
If sharpConfig specifies its own quality, the global setting does not apply.

## includes

Include filter for images. Supports string or RegExp. e.g.: `'xxx.png'.includes(includes) includes.test('xxx.png')`

## excludes

Exclude filter for images. Supports string or RegExp. e.g.: `! 'xxx.png'.includes(excludes) !includes.test('xxx.png')`

## filter

Custom global filter function. Accepts image path, returns boolean. Supports async.

## enableWebp

Enable WebP conversion in production.
When true, all filtered images will also produce a WebP version and the file extension will be automatically replaced (xxx.png → xxx.webp).

⚠️ Note: Some low-end devices do not support WebP. Use cautiously.

## webpConfig

Configuration related to packaging webp:

json

```json
{
    "filter": "(path: string) => boolean",
    "deleteOriginImg": false,
    "limitSize": 0
}
```
- filter: Filter function for WebP conversion
- deleteOriginImg: Delete the original image after conversion
- limitSize: Skip WebP conversion for files <= this size

## compatibility
Enable WebP compatibility mode.
When enabled:

- Inserts async script in <head> to detect WebP support

- Dynamically toggles WebP class

- Only CSS background images will be converted

⚠️ iOS may not handle async <head> scripts properly, causing duplicate loads. Use carefully.

## enableDev

Whether to take effect in the development environment, default is false.  
When enabled, images can be automatically packaged and compressed in the development environment.

## enableDevWebp

Whether to enable webp conversion in the development environment, default is false.  
When enabled, webp conversion can be automatically performed in the development environment.

## cacheDir

Image cache path in the development environment, default: 'node_modules/.cache/vite-plugin-image'  
It avoids repeated compression during development and optimizes the development experience.

## spritesConfig

Sprite image configuration: When enabled, images in a folder can be merged into a single sprite image, and the background image size, position, and repeat in CSS will be automatically modified.

json

```json
{
    "rules": [{
        "dir": "string",
        "suffix": "sprites",
        "padding": 0,
        "quality": 80,
        "scale": 1,
        "algorithm": "top-down | left-right | diagonal | alt-diagonal | binary-tree"
    }],
    "outputDir": "string",
    "deleteOriginImg": false,
    "includes": "string | RegExp",
    "excludes": "string | RegExp",
    "suffix": "sprites",
    "algorithm": "...",
    "transformUnit": "(unit: string, filePath: string) => string",
    "rootValue": 16
}
```
⚠️ Notes:

- width / height in CSS must be numeric (px or rem), not %

- When using rem, rootValue must be provided to convert px correctly

## sharpConfig

sharp compression configuration: [sharp configuration](https://sharp.pixelplumbing.com/api-output/#_top)

json

```json
    jpeg?: JpegOptions
    jpg?: JpegOptions
    png?: PngOptions
    webp?: WebpOptions
    avif?: AvifOptions
    tiff?: TiffOptions
    gif?: GifOptions
```

## svgoConfig

svgo configuration: https://svgo.dev/docs/preset-default/


