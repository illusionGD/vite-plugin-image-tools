# vite-plugin-image-tools

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh-CN.md)

vite plug-in, support image compression and automatic webp, currently only support png, jpg, jpeg, webp

## Feature

- Supports compression and webp image generation in production environment

- Support development environment compression and preview webp image effects

- Configure image compression quality

## Installation
installation sharp
```bash
npm i -D sharp
```

installation vite-plugin-image-tools
```bash
npm i -D vite-plugin-image-tools
```
## Useage

```js
// vite.config.js
import { defineConfig } from 'vite'
import ImageTools from 'vite-plugin-image-tools'

export default defineConfig({
  plugins: [
    ImageTools({
      quality: 80,
      enableWebp: true
    })
  ]
})
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| quality | number | 80 | picture quality (1-100) |
| include | string[] | ['png', 'jpg'] | The image formats are: png/jpg/webp, etc. |
| enableWebp | boolean | false | Whether to switch to webp in the production environment |
| enableDev | boolean | false | Whether to enable compression in the development environment |
| enableDevWebp | boolean | false | Whether to switch to webp in the development environment |
| cacheDir | string | ‘node_modules/.cache/vite-plugin-image’ | Cache path,this path is valid only in the development environment |
| regExp |  |  | regExp is a regular expression used to filter images in the format |
