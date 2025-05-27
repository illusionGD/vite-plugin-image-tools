# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

vite plug-in, support image compression and automatic webp, currently only support 'png', 'jpg', 'webp', 'avif', 'tiff', 'gif', 'svg'

## Feature

- Supports compression and webp image generation in production environment
- Support development environment compression and preview webp image effects
- Configure image compression quality

## Installation

```bash
npm i -D sharp

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


| Option            | Type          | Default                                                                                                                                  | Description                                                                                                                                                                                                                                 |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quality           | number        | 80                                                                                                                                       | picture quality (1-100)                                                                                                                                                                                                                     |
| includes          | string/RegExp | ''                                                                                                                                       | jpe?g                                                                                                                                                                                                                                       |
| excludes          | string/RegExp | ''                                                                                                                                       | example：!'`xxx.png'.includs(inclouds) !includes.test('xxx.png')`                                                                                                                                                                           |
| filter            | function      | () => true                                                                                                                               | Filtering method, customizable image filtering logic, supported asyncParameter: Image pathexample：filter: (path) => {  return path.includes('.png') }                                                                                      |
| compatibility     | boolean       | false                                                                                                                                    | Whether it is compatible with low-version browsers, it takes effect in the production environment,true：Only images in css will be converted to webp (currently only css processing is supported during packaging). false：all replace webp |
| bodyWebpClassName | string        | webp                                                                                                                                     | The webp class of the body tag is used to generate classes compatible with webp                                                                                                                                                             |
| enableWebp        | boolean       | false                                                                                                                                    | Whether to switch to webp in the production environment                                                                                                                                                                                     |
| enableDev         | boolean       | false                                                                                                                                    | Whether to enable compression in the development environment                                                                                                                                                                                |
| enableDevWebp     | boolean       | false                                                                                                                                    | Whether to switch to webp in the development environment                                                                                                                                                                                    |
| cacheDir          | string        | ‘node_modules/.cache/vite-plugin-image’                                                                                                | Cache path,this path is valid only in the development environment                                                                                                                                                                           |
| sharpConfig       | Object        | { jpeg?: JpegOptions, jpg?: JpegOptions, png?: PngOptions, webp?: WebpOptions, avif?: AvifOptions, tiff?: TiffOptions, gif?: GifOptions} | [sharp config](https://sharp.pixelplumbing.com/api-output/#_top)                                                                                                                                                                            |
| svgoConfig        | Object        | {plugins:['preset-default',{name:'removerXMLNS'},{name:'removeViewBox'}],js2svg:{indent:2, pretty: true}}                                | [https://svgo.dev/docs/preset-default/]()                                                                                                                                                                                                   |
