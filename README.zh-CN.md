# vite-plugin-image-tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

vite插件，支持图片压缩和自动转webp，目前只支持png、jpg、jpeg、webp

## 特性

🚀 功能

- 支持生产环境压缩和生成webp图片

- 支持开发环境压缩和预览webp图片效果

- 支持配置图片压缩质量

## 安装

## 使用

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
| quality | number | 80 | 图片质量 (1-100) |
| include | string[] | ['png', 'jpg'] | 包含的图片格式：png/jpg/webp等 |
| enableWebp | boolean | false | 生产环境是否转webp |
| enableDev | boolean | false | 开发环境是否开启压缩 |
| enableDevWebp | boolean | false | 开发环境是否开启转webp |
| cacheDir | string | ‘node_modules/.cache/vite-plugin-image’ | 缓存路径， 默认，只在开发环境生效 |
| regExp |  |  | 正则表达式，用于过滤图片格式 |
