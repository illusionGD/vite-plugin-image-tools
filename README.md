# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh-CN.md)

vite plug-in, support image compression and automatic webp, currently only support 'png', 'jpg', 'webp', 'avif', 'tiff', 'gif'

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

```ts
// vite.config.js
import { defineConfig } from 'vite'
import ImageTools, {PluginOptions} from 'vite-plugin-image-tools'

// type PluginOptions = {
//   quality: number
//   enableDev: boolean
//   enableDevWebp: boolean
//   enableWebp: boolean
//   include: string[]
//   cacheDir: string
//   sharpConfig: {
//   jpeg?: JpegOptions
//   jpg?: JpegOptions
//   png?: PngOptions
//   webp?: WebpOptions
//   avif?: AvifOptions
//   tiff?: TiffOptions
//   gif?: GifOptions
// }
// }

export default defineConfig({
  plugins: [
    ImageTools({
      quality: 80,
      enableWebp: true
    } as Partial<PluginOptions>)
  ]
})
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| quality | number | 80 | picture quality (1-100) |
| include | string[] | ['png', 'jpg', 'webp', 'avif', 'tiff', 'gif'] | The image formats are: png/jpg/webp..., etc. |
| enableWebp | boolean | false | Whether to switch to webp in the production environment |
| enableDev | boolean | false | Whether to enable compression in the development environment |
| enableDevWebp | boolean | false | Whether to switch to webp in the development environment |
| cacheDir | string | ‘node_modules/.cache/vite-plugin-image’ | Cache path,this path is valid only in the development environment |
| sharpConfig | Object | {} | [sharp config](https://sharp.pixelplumbing.com/api-output/#_top) |
