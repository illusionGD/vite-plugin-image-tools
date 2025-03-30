# vite-plugin-image-compress

[![npm version](https://img.shields.io/npm/v/vite-plugin-image-compress)](https://www.npmjs.com/package/vite-plugin-image-compress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Vite plugin for image compression using Sharp.

## Features

-   🚀 Automatic image compression during build
-   🔧 Supports PNG/JPEG/WEBP formats
-   ⚙️ Configurable quality settings

## Installation

```bash
npm install vite-plugin-image-compress --save-dev
```

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import ImageTools from 'vite-plugin-image-tools'

export default defineConfig({
    plugins: [
        ImageTools({
            quality: 100,
            enableDev: true,
            enableDevWebp: true,
            enableWebP: true,
        }),
    ],
})
```

## Options

| Option  | Type   | Default                  | Description                 |
| ------- | ------ | ------------------------ | --------------------------- |
| quality | number | 80                       | Compression quality (1-100) |
| include | RegExp | /\.(png\|jpe?g\|webp)$/i | File pattern to include     |

## Troubleshooting

如果遇到 Sharp 安装问题：

```bash
npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
npm install
```
