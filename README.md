# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh.md)

vite plug-in, support image compression and automatic webp, currently only support 'png', 'jpg', 'webp', 'avif', 'tiff', 'gif', 'svg'

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
