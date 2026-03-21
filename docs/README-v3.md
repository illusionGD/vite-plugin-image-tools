> This documentation applies to versions before 4.0.0 (v3.x). For current version, see [root README](../README.md).

# vite-plugin-image-tools

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [涓枃](./README-v3.zh.md)

A Vite plugin that supports image compression during build, conversion to WebP, and sprite sheet generation.

## Notice
Vite@6 and earlier versions, which are Vite rollup versions.

## Feature

馃殌 Functions

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
      enableWebp: true锛?
      enableDev:true,
      enableDevWebp:true
    })
  ]
})
```

## Options
| Option            | Type              | Default                                                                                                         | Description                                                                         |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| quality           | number            | 80                                                                                                              | Image quality (1鈥?00)                                                               |
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
   * @zh 鍘嬬缉璐ㄩ噺锛岄粯璁ゅ€硷細80
   */
  quality: number

  /** 
   * @en Whether to enable in development environment
   * @zh 鏄惁鍦ㄥ紑鍙戠幆澧冨惎鐢?
   */
  enableDev: boolean

  /** 
   * @en Whether to enable WebP in development environment
   * @zh 鏄惁鍦ㄥ紑鍙戠幆澧冨惎鐢?WebP
   */
  enableDevWebp: boolean

  /** 
   * @en Whether to enable WebP during build
   * @zh 鏄惁鍦ㄦ瀯寤烘椂鍚敤 WebP
   */
  enableWebp: boolean

  /** 
   * @en Include patterns
   * @zh 鍖呭惈瑙勫垯
   */
  includes: string | RegExp

  /** 
   * @en Exclude patterns
   * @zh 鎺掗櫎瑙勫垯
   */
  excludes: string | RegExp

  /** 
   * @en Development image cache directory, default: node_modules/.cache/vite-plugin-image
   * @zh 寮€鍙戠幆澧冨浘鐗囩紦瀛樼洰褰曪紝榛樿涓?node_modules/.cache/vite-plugin-image
   */
  cacheDir: string

  /** 
   * @en Sharp library configuration
   * @zh Sharp 鍥剧墖澶勭悊搴撻厤缃?
   */
  sharpConfig: sharpConfigType

  /** 
   * @en SVGO configuration
   * @zh SVGO 閰嶇疆
   */
  svgoConfig: svgoConfig

  /** 
   * @en Compatibility mode
   * @zh 鍏煎鎬фā寮?
   */
  compatibility: boolean

  /** 
   * @en Class name added to body element when WebP is supported
   * @zh 褰撴敮鎸?WebP 鏃舵坊鍔犲埌 body 鐨勭被鍚?
   */
  bodyWebpClassName: string

  /** 
   * @en File size limit, files <= this value will not be compressed or converted
   * @zh 鏂囦欢澶у皬闄愬埗锛屽皬浜庣瓑浜庢鍊肩殑鏂囦欢涓嶄細杩涜鍘嬬缉鎴栬浆鎹?
   */
  limitSize?: number

  /** 
   * @en Whether to print output logs, default: true
   * @zh 鏄惁鎵撳嵃杈撳嚭鏃ュ織锛岄粯璁や负 true
   */
  log?: boolean

  /** 
   * @en Whether to print debug logs
   * @zh 鏄惁鎵撳嵃璋冭瘯鏃ュ織
   */
  debugLog?: boolean

  /**
   * @en Filter function
   * @zh 杩囨护鍑芥暟
   * @param path Image path
   * @zh 鍥剧墖璺緞
   */
  filter?: (path: string) => boolean

  /** 
   * @en Build WebP configuration
   * @zh 鏋勫缓 WebP 閰嶇疆
   */
  webpConfig?: {
    /**
     * @en Filter function
     * @zh 杩囨护鍑芥暟
     * @param path Image path
     * @zh 鍥剧墖璺緞
     */
    filter?: (path: string) => boolean

    /** 
     * @en Whether to delete original images
     * @zh 鏄惁鍒犻櫎鍘熷浘
     */
    deleteOriginImg?: boolean

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 鏂囦欢澶у皬闄愬埗锛屽皬浜庣瓑浜庢鍊肩殑鏂囦欢涓嶄細杩涜鍘嬬缉鎴栬浆鎹?
     */
    limitSize?: number
  }

  /** 
   * @en Sprite image configuration
   * @zh 闆ⅶ鍥鹃厤缃?
   */
  spritesConfig?: {
    rules: {
      /** 
       * @en Directory
       * @zh 鐩綍
       */
      dir: string

      /** 
       * @en Output directory
       * @zh 杈撳嚭鐩綍
       */
      outputDir?: string

      /** 
       * @en File suffix, default: sprites
       * @zh 鏂囦欢鍚庣紑锛岄粯璁や负 sprites
       */
      suffix?: string

      /** 
       * @en Padding value
       * @zh 鍥剧墖闂磋窛
       */
      padding?: number

      /** 
       * @en CSS scaling
       * @zh CSS 缂╂斁姣斾緥
       */
      scale?: number

      /** 
       * @en Spritesmith algorithm
       * @zh 闆ⅶ鍥惧竷灞€绠楁硶
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
     * @zh 杈撳嚭鐩綍
     */
    outputDir?: string

    /** 
     * @en Include patterns
     * @zh 鍖呭惈瑙勫垯
     */
    includes?: string | RegExp

    /** 
     * @en Exclude patterns
     * @zh 鎺掗櫎瑙勫垯
     */
    excludes?: string | RegExp

    /** 
     * @en File suffix, default: sprites
     * @zh 鏂囦欢鍚庣紑锛岄粯璁や负 sprites
     */
    suffix?: string

    /** 
     * @en Spritesmith algorithm
     * @zh 闆ⅶ鍥惧竷灞€绠楁硶
     */
    algorithm?:
      | 'top-down'
      | 'left-right'
      | 'diagonal'
      | 'alt-diagonal'
      | 'binary-tree'

    /** 
     * @en Alias path used in CSS
     * @zh 渚?CSS 浣跨敤鐨勫埆鍚嶈矾寰?
     */
    aliasPath?: string

    /**
     * @en Unit conversion function
     * @zh 鍗曚綅杞崲鍑芥暟
     * @param unit Unit value
     * @param filePath Single image path
     */
    transformUnit?: (unit: number, filePath: string) => string

    /** 
     * @en Root value for rem conversion
     * @zh rem 杞崲鐨勬牴鍊?
     */
    rootValue?: number

    /** 
     * @en Whether to delete original images
     * @zh 鏄惁鍒犻櫎鍘熷浘
     */
    deleteOriginImg?: boolean
  }

  /** 
   * @en Public image configuration
   * @zh public 鐩綍鍥剧墖閰嶇疆
   */
  publicConfig?: {
    /** 
     * @en Whether to enable
     * @zh 鏄惁鍚敤
     */
    enable?: boolean

    /** 
     * @en Compression quality
     * @zh 鍘嬬缉璐ㄩ噺
     */
    quality?: number

    /** 
     * @en File size limit, files <= this value will not be compressed or converted
     * @zh 鏂囦欢澶у皬闄愬埗锛屽皬浜庣瓑浜庢鍊肩殑鏂囦欢涓嶄細杩涜鍘嬬缉鎴栬浆鎹?
     */
    limitSize?: number
  }

  /** 
   * @en Image assets directory, used to fix vite@4.x cannot find original image path
   * @zh 鍥剧墖璧勬簮鐩綍锛岀敤浜庤В鍐?vite@4.x 鎵句笉鍒板師濮嬪浘鐗囪矾寰勭殑闂
   */
  imgAssetsDir?: string | string[]

  /** 
   * @en Vite configuration
   * @zh Vite 閰嶇疆
   */
  viteConfig?: UserConfig

  /** 
   * @en Whether current environment is build
   * @zh 鏄惁涓烘瀯寤虹幆澧?
   */
  isBuild?: boolean
}
```
# Configuration Details

## quality
Global compression quality (1鈥?00).
If sharpConfig specifies its own quality, the global setting does not apply.

## includes

Include filter for images. Supports string or RegExp. e.g.:聽`'xxx.png'.includes(includes) includes.test('xxx.png')`

## excludes

Exclude filter for images. Supports string or RegExp. e.g.:聽`! 'xxx.png'.includes(excludes) !includes.test('xxx.png')`

## filter

Custom global filter function. Accepts image path, returns boolean. Supports async.

## enableWebp

Enable WebP conversion in production.
When true, all filtered images will also produce a WebP version and the file extension will be automatically replaced (xxx.png 鈫?xxx.webp).

鈿狅笍 Note: Some low-end devices do not support WebP. Use cautiously.

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

鈿狅笍 iOS may not handle async <head> scripts properly, causing duplicate loads. Use carefully.

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
鈿狅笍 Notes:

- width / height in CSS must be numeric (px or rem), not %

- When using rem, rootValue must be provided to convert px correctly

## sharpConfig

sharp compression configuration:聽[sharp configuration](https://sharp.pixelplumbing.com/api-output/#_top)

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

svgo configuration:聽https://svgo.dev/docs/preset-default/


