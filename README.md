# vite-plugin-image-tools

<p align="center">
  <img src="https://cdn-fusion.imgcdn.store/i/2026/e58943ee633e97e8.png" alt="vite-plugin-image-tools logo" width="500" />
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh.md)

A Vite plugin for image compression, format conversion (WebP/AVIF), sprite sheet generation, and CSS class generation.

> 📚 **v3.x 及更早版本文档**： [English](./docs/README-v3.md) | [中文](./docs/README-v3.zh.md)

## Features

- **Compression**: Production and development image compression
- **Convert**: Main-format conversion (WebP, AVIF, etc.) with `convert` config
- **perImage**: Per-image quality and format overrides
- **Sprites**: Merge images into sprite sheets; dev watcher rebuilds on source changes
- **cssGen**: Auto-generate CSS classes from image directories (with variant rules like `:hover`)
- **Compatibility mode**: WebP detection for CSS background images only

## Installation

```bash
npm i -D vite-plugin-image-tools
# or
pnpm i -D vite-plugin-image-tools
# or
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
      quality: 90,
      enableDev: true,
      enableDevConvert: true
    })
  ]
})
```

## Detailed Configuration Example

Full configuration with all features:

```js
// vite.config.js
import { defineConfig } from 'vite'
import VitePluginImageTools from 'vite-plugin-image-tools'

export default defineConfig({
  plugins: [
    VitePluginImageTools({
      // Basic
      quality: 90,
      enableDev: true,
      enableDevConvert: true,
      compatibility: true,

      // Format conversion
      convert: {
        enable: true,
        format: 'webp',
        deleteOriginImg: false,
        limitSize: 2 * 1024
      },

      // Per-image overrides
      perImage: async (filePath) => {
        if (filePath.includes('hero.jpg')) return { format: 'avif', quality: 60 }
        if (filePath.includes('thumb')) return { quality: 50 }
        return {}
      },

      // Sharp format options
      sharpConfig: {
        webp: { quality: 80 },
        avif: { quality: 60 }
      },

      // Sprite sheets
      spritesConfig: {
        rules: [
          {
            dir: './src/assets/icons',
            name: 'icons',
            outputDir: './src/assets',
            algorithm: 'binary-tree'
          }
        ],
        rootValue: 16
      },

      // Auto-generate CSS classes
      cssGen: {
        rules: [
          {
            inputDir: './src/assets/icons',
            stylePath: 'assets/generated/image-classes.css',
            classPrefix: 'ui--',
            variantRules: [{ regex: /_hover$/, pseudo: ':hover' }]
          },
          {
            inputDir: './src/assets',
            stylePath: 'assets/generated/image-classes.css',
            includes: /\.(png|jpe?g)$/i,
            excludes: /icons\//
          }
        ]
      },

      // Compress public/ images
      publicConfig: {
        enable: true,
        quality: 80
      }
    })
  ]
})
```

## Options

| Option            | Type              | Default                                                       | Description                                                    |
| ----------------- | ----------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| quality           | number            | 80                                                            | Global compression quality (1–100)                             |
| enableDev         | boolean           | false                                                         | Enable compression in development                             |
| enableDevConvert  | boolean           | false                                                         | Enable format conversion in development (default: webp)        |
| convert           | object            | `{ enable: true, format: 'webp', deleteOriginImg: false }`     | Main-format conversion config                                 |
| perImage          | function          | `async () => ({})`                                            | Per-image resolver for quality/format overrides               |
| includes          | string / RegExp   | `/\.(png\|jpe?g\|gif\|webp\|svg\|avif)(\?.*)?$/i`             | Include filter                                                |
| excludes          | string / RegExp   | `''`                                                          | Exclude filter                                                |
| filter            | function          | `() => true`                                                  | Custom filter (async supported)                                |
| limitSize         | number            | -                                                             | Skip compression/conversion for files <= this size             |
| compatibility     | boolean           | false                                                         | WebP compatibility mode (CSS images only)                       |
| bodyWebpClassName | string            | `'webp'`                                                      | Class added to `<body>` when WebP is supported                |
| cacheDir          | string            | `node_modules/.cache/vite-plugin-image`                        | Dev cache directory                                           |
| spritesConfig     | object            | -                                                             | Sprite sheet configuration                                    |
| cssGen            | object            | `{ rules: [], format: 'css' }`                                | CSS class generation rules                                    |
| sharpConfig       | object            | `{}`                                                          | Sharp options (jpeg, png, webp, avif, etc.)                   |
| svgoConfig        | object            | preset-default + removerXMLNS, removeViewBox                   | SVGO configuration                                            |
| publicConfig      | object            | -                                                             | Config for `public/` images                                   |
| imgAssetsDir      | string / string[] | -                                                             | Image assets dir (for Vite 4.x compatibility)                 |
| log               | boolean           | true                                                          | Print output logs                                             |

## Configuration Details

### convert

Main-format conversion (4.0+):

```js
convert: {
  enable: true,
  format: 'webp',        // or 'avif', 'png', etc.
  deleteOriginImg: false,
  limitSize: 2048,       // skip conversion for small files
  filter: (path) => true
}
```

### perImage

Override quality or format per image:

```js
perImage: async (filePath) => {
  if (filePath.includes('hero.jpg')) return { format: 'avif', quality: 60 }
  if (filePath.includes('thumb')) return { quality: 50 }
  return {}
}
```

### spritesConfig

Merge images in a directory into a sprite sheet:

```js
spritesConfig: {
  rules: [
    {
      dir: './src/assets/icons',
      name: 'icons',             // optional, default: dir name + '-sprites'
      outputDir: './src/assets', // optional, default: same as dir
      padding: 0,
      algorithm: 'binary-tree'  // top-down | left-right | diagonal | alt-diagonal | binary-tree
    }
  ],
  outputDir: './dist/sprites',
  includes: /\.(png|jpg)$/,
  excludes: /\.(svg)$/,
  rootValue: 16,
  deleteOriginImg: false
}
```

**Dev watcher**: When `enableDev` is true, the plugin watches sprite source directories. On add/change/unlink of images, it rebuilds the sprite, invalidates the module graph, and triggers a full reload.

**Note**: CSS `width`/`height` must be numeric (px or rem), not `%`.

### cssGen

Auto-generate CSS classes from image directories:

```js
cssGen: {
  rules: [
    {
      inputDir: './src/assets/icons',
      stylePath: 'assets/generated/image-classes.css',
      classPrefix: 'ui--',
      includes: /\.(png|jpg)$/,
      excludes: /\.(svg)$/,
      variantRules: [
        { regex: /_hover$/, pseudo: ':hover' }
      ],
      resolveClass: (filePath, baseName) => `ui--${baseName}`
    }
  ]
}
```

**Dev watcher**: When source images change, regenerates the CSS file and triggers a full reload.

### compatibility

When `true`, inserts a script to detect WebP support and only converts CSS background images. Use when targeting browsers that may not support WebP.

### enableDev / enableDevConvert

- `enableDev`: Enable compression in development, default: false
- `enableDevConvert`: Enable format conversion in development (default: webp), default: false

### sharpConfig

[Sharp output options](https://sharp.pixelplumbing.com/api-output/):

```js
sharpConfig: {
  webp: { quality: 80 },
  avif: { quality: 60 }
}
```

### svgoConfig

[SVGO preset-default](https://svgo.dev/docs/preset-default/)
