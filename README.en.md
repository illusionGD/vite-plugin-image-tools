# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

vite plug-in, support image compression and automatic webp, currently only support 'png', 'jpg', 'webp', 'avif', 'tiff', 'gif', 'svg'

## Feature

🚀 Functions

- Supports compressing and generating webp images in the production environment
- Supports compressing and previewing webp image effects in the development environment
- Allows configuration of image compression quality
- Automatically merges sprite images (Note: Currently only supported in Vue projects)

## Installation

```bash
npm i -D sharp // Graphics library
npm i -D spritesmith // Library for merging sprite images
npm i -D vite-plugin-image-tools
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

| Option            | Type          | Default                                                                                                                                  | Description                                                                                                                                                                                                                               |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quality           | number        | 80                                                                                                                                       | picture quality (1-100)                                                                                                                                                                                                                   |
| includes          | string/RegExp | ''                                                                                                                                       | Included items, e.g.: 'xxx.png'.includes(includes) includes.test('xxx.png')                                                                                                                                                               |
| excludes          | string/RegExp | ''                                                                                                                                       | Excluded items, e.g.: ! 'xxx.png'.includes(excludes) !includes.test('xxx.png')                                                                                                                                                            |
| filter            | function      | () => true                                                                                                                               | Filtering method, customizable image filtering logic, supported asyncParameter: Image pathexample：filter: (path) => {  return path.includes('.png') }                                                                                     |
| compatibility     | boolean       | false                                                                                                                                    | Whether it is compatible with low-version browsers, it takes effect in the production environment,true：Only images in css will be converted to webp (currently only css processing is supported during packaging). false：all replace webp |
| bodyWebpClassName | string        | webp                                                                                                                                     | The webp class of the body tag is used to generate classes compatible with webp                                                                                                                                                           |
| enableWebp        | boolean       | false                                                                                                                                    | Whether to switch to webp in the production environment                                                                                                                                                                                   |
| enableDev         | boolean       | false                                                                                                                                    | Whether to enable compression in the development environment                                                                                                                                                                              |
| enableDevWebp     | boolean       | false                                                                                                                                    | Whether to switch to webp in the development environment                                                                                                                                                                                  |
| cacheDir          | string        | ‘node_modules/.cache/vite-plugin-image’                                                                                                  | Cache path,this path is valid only in the development environment                                                                                                                                                                         |
| spritesConfig     | Object        |                                                                                                                                          | Sprite image configuration                                                                                                                                                                                                                |
| sharpConfig       | Object        | { jpeg?: JpegOptions, jpg?: JpegOptions, png?: PngOptions, webp?: WebpOptions, avif?: AvifOptions, tiff?: TiffOptions, gif?: GifOptions} | [sharp config](https://sharp.pixelplumbing.com/api-output/#_top)                                                                                                                                                                          |
| webpConfig        | Object        |                                                                                                                                          | Configuration for packaging webp                                                                                                                                                                                                          |
| svgoConfig        | Object        | {plugins:['preset-default',{name:'removerXMLNS'},{name:'removeViewBox'}],js2svg:{indent:2, pretty: true}}                                | [https://svgo.dev/docs/preset-default/]()                                                                                                                                                                                                 |

# Configuration Details

## quality

Image compression quality, ranging from 1 to 100. It is a global configuration. If there is a separate configuration in sharpConfig, this will not take effect.

## includes

Inclusion configuration for filtering images, supporting string and regular expression configurations, e.g.: `'xxx.png'.includes(includes) includes.test('xxx.png')`

## excludes

Exclusion configuration for filtering images, supporting string and regular expression configurations, e.g.: `! 'xxx.png'.includes(excludes) !includes.test('xxx.png')`

## filter

A global filtering function that receives the image path (path) and returns a boolean value. It supports asynchronous functions.

## enableWebp

Whether to enable packaging webp images, default is false. When enabled, webp images will be generated simultaneously, and the image suffix will be automatically modified (e.g.: xxx.png -> xxx.webp). It is affected by filtering configurations (filter, includes, excludes).  
Note: When enabled, all eligible images will be converted to webp. Low-end devices may not support webp, so consider carefully whether to enable it.

## webpConfig

Configuration related to packaging webp:

json

```json
        /**         * Filter function         * @param path Image path         */
        filter?: (path: string) => boolean
```

## compatibility

Whether to enable webp compatibility mode, default is false.  
When enabled, asynchronous code for judging the device's webp compatibility will be inserted into the head tag to dynamically replace the global webp class. Currently, it only supports compatibility with background images in CSS; other images (e.g., img tags) will not be converted to webp.  
Note: iOS may not be compatible with asynchronous requests in the head, which may cause both webp and original images to be loaded. Consider carefully whether to enable it.

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
        rules: {
            /** Folder */
            dir: string
            /** Suffix, default is sprites */
            suffix?: string
            padding?: number
            /** Compression quality */
            quality?: number
            /** CSS scaling */
            scale?: number
            algorithm?:
                | 'top-down'
                | 'left-right'
                | 'diagonal'
                | 'alt-diagonal'
                | 'binary-tree'
        }[]
        /** Inclusion */
        includes?: string | RegExp
        /** Exclusion */
        excludes?: string | RegExp
        /** Suffix, default is sprites */
        suffix?: string
        algorithm?:
            | 'top-down'
            | 'left-right'
            | 'diagonal'
            | 'alt-diagonal'
            | 'binary-tree'
        /**         * Unit conversion         * @param unit Unit in px         * @param filePath Path of a single image         * @returns         */
        transformUnit?: (unit: string, filePath: string) => string
    }
```

Note: To use this function, the width and height in CSS must be specific px values (cannot be %). Otherwise, the size, position, and repeat attributes will be calculated and modified based on the original image's width and height.

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
