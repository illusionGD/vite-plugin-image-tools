# vite-plugin-image-tools

<p align="center">
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vite.dev/logo.svg" alt="Vite logo">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**中文** | [English](./README.en.md)

vite插件，支持图片压缩和自动转webp，目前只支持'png', 'jpg', 'webp', 'avif', 'tiff', 'gif'

## 特性

🚀 功能

- 支持生产环境压缩和生成webp图片
- 支持开发环境压缩和预览webp图片效果
- 支持配置图片压缩质量

## 安装

```bash
npm i -D sharp

npm i -D vite-plugin-image-tools
```

## 使用

```js
// vite.config.js
import { defineConfig } from 'vite'
import VitePluginImageTools from 'vite-plugin-image-tools'

export default defineConfig({
  plugins: [
    VitePluginImageTools({
      quality: 80,
      enableWebp: true
    })
  ]
})
```

# 配置参数

| 参数              | 类型             | 默认值                                                                                                                                   | Description                                                                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| quality           | number           | 80                                                                                                                                       | 图片质量 (1-100)                                                                                                                |
| includes          | string/RegExp    | ''                                                                                                                                       | '`xxx.png'.includs(inclouds) includes.test('xxx.png')`jpe?g                                                                   |
| excludes          | string/RegExp    | ''                                                                                                                                       | 排除项，如：!'`xxx.png'.includs(inclouds) !includes.test('xxx.png')`                                                          |
| filter            | function<string> | () => true                                                                                                                               | 过滤方法，可自定义过滤图片逻辑，支持async<br/>参数：图片路径<br/>如：<br/>filter: (path) => {  return path.includes('.png') } |
| compatibility     | boolean          | false                                                                                                                                    | 是否兼容低版本浏览器，生产环境生效，<br/>true：只有css中的图片会转webp（暂时只支持打包时候处理css）<br/> false：全部转webp      |
| bodyWebpClassName | string           | webp                                                                                                                                     | body标签的webp class，用于生成兼容webp的class                                                                                   |
| enableWebp        | boolean          | false                                                                                                                                    | 生产环境是否转webp                                                                                                              |
| enableDev         | boolean          | false                                                                                                                                    | 开发环境是否开启压缩                                                                                                            |
| enableDevWebp     | boolean          | false                                                                                                                                    | 开发环境是否开启转webp                                                                                                          |
| cacheDir          | string           | ‘node_modules/.cache/vite-plugin-image’                                                                                                | 缓存路径， 默认，只在开发环境生效                                                                                               |
| sharpConfig       | Object           | { jpeg?: JpegOptions, jpg?: JpegOptions, png?: PngOptions, webp?: WebpOptions, avif?: AvifOptions, tiff?: TiffOptions, gif?: GifOptions} | [sharp配置](https://sharp.pixelplumbing.com/api-output/#_top)                                                                      |
| svgoConfig        | Object           | {plugins:['preset-default',{name:'removerXMLNS'},{name:'removeViewBox'}],js2svg:{indent:2, pretty: true}}                                | [https://svgo.dev/docs/preset-default/]()                                                                                          |
