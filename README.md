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
        // rootValue: 16
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
| deviceCss         | object            | `{ enable: false }`                                           | Per-device CSS image variants (build only)                    |
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
  transformUnit: (unit, filePath) => `${unit / 16}rem`,
  deleteOriginImg: false
}
```

**`transformUnit`**: `(unit: number, filePath: string) => string`

Customizes the unit of every numeric value (`width` / `height` / `background-position`) written into the generated sprite CSS.

- `unit`: the raw pixel value computed for the sprite
- `filePath`: absolute path of the source image, so you can apply per-image conversion
- return: the final value **including its unit** (e.g. `'0.32rem'`, `'10px'`)

When omitted, the default is `` `${unit}px` ``. Use it to output `rem` / `vw` or any custom unit:

```js
// px → rem (design draft base 16px)
transformUnit: (unit) => `${unit / 16}rem`
```

**`rootValue`**: `number`, default `1`

When the source CSS declares an icon's `width` / `height` in `rem`, the plugin converts it to px to compute the sprite's scale ratio relative to the original image. `rootValue` is the number of px per `1rem` (`px = remValue * rootValue`). It has no effect when the source CSS uses px.

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
      resolveClass: (filePath, baseName) => `ui--${baseName}`,
      transform: ({ className, imageUrl, imageAbsPath, width, height }) => {
        if (className !== 'ui-css' || !imageAbsPath.includes('css.jpg')) return
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          width: width ? `${Math.round(width / 4)}px` : undefined,
          height: height ? `${Math.round(height / 4)}px` : undefined
        }
      }
    }
  ]
}
```

`transform` receives:
- `className`: generated class name without leading `.`
- `imageUrl`: relative asset URL used in CSS
- `imageAbsPath`: absolute file path of the source image
- `width` / `height`: image metadata dimensions

Return value of `transform`:
- return a style object (`Record<string, string | number | null | undefined>`)
- supports both `camelCase` and `kebab-case` keys
- return empty (`undefined` / `null`) to fallback to default generated declarations

Detailed `cssGen` configuration example:

```js
cssGen: {
  format: 'css',
  rules: [
    {
      // Scan this directory recursively
      inputDir: './src/assets/icons',
      // Output css file (relative to project root in dev / outDir in build)
      stylePath: 'assets/generated/image-classes.css',
      // Default class name: `${classPrefix}${baseName}`
      classPrefix: 'ui--',
      // Optional include/exclude/filter chain
      includes: /\.(png|jpe?g|webp)$/i,
      excludes: /\/deprecated\//,
      filter: async (absPath) => !absPath.includes('ignore'),
      // Convert filename suffix to pseudo selector
      variantRules: [
        { regex: /_hover$/, pseudo: ':hover' },
        { regex: /_active$/, pseudo: 'active' } // also supports 'active' (auto to ':active')
      ],
      // Optional class-name resolver
      resolveClass: (filePath, baseName) => {
        if (filePath.includes('/brand/')) return `brand-${baseName}`
        return `ui--${baseName}`
      },
      // Optional custom style object
      transform: ({ className, imageUrl, imageAbsPath, width, height }) => {
        // custom style for one image, fallback by returning empty for others
        if (className === 'ui--logo' && imageAbsPath.includes('logo.png')) {
          return {
            backgroundImage: `url(${imageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: width ? `${width}px` : undefined,
            height: height ? `${height}px` : undefined
          }
        }
        return
      }
    }
  ]
}
```

**Dev watcher**: When source images change, regenerates the CSS file and triggers a full reload.

### compatibility

When `true`, inserts a script to detect WebP support and only converts CSS background images. Use when targeting browsers that may not support WebP.

> Mutually exclusive with `deviceCss`. If both are enabled, `compatibility` is disabled.

### deviceCss

**Build only.** Generates per-device compressed variants for CSS background images, injects a synchronous UA-detection script into `<head>` that adds a `device-<name>` class to the `<html>` element, and appends CSS override rules so each device loads its own image.

```js
deviceCss: {
  enable: true,
  classPrefix: 'device',   // → html.device-ios ...
  devices: [
    { name: 'ios',     match: /iphone|ipad|ipod/i, quality: 50, scale: 0.5 },
    { name: 'android', match: /android/i,          quality: 55, scale: 0.5 },
    { name: 'mb',      match: /mobile/i,            quality: 60, scale: 0.75 }
  ],
  includes: /\.(png|jpe?g)$/i,
  excludes: /icons\//
}
```

Generated output:

```html
<!-- injected at the very top of <head>, runs before CSS applies (no FOUC) -->
<script>;(function(){var ua=navigator.userAgent;var name="";
  if(/iphone|ipad|ipod/i.test(ua))name="ios";
  else if(/android/i.test(ua))name="android";
  else if(/mobile/i.test(ua))name="mb";
  if(name)document.documentElement.classList.add("device-"+name)})()</script>
```

```css
.banner{background-image:url(image.webp)}                          /* base — unchanged, shown when no device matches */
html.device-ios .banner{background-image:url(image-ios.webp)}      /* only the url() is swapped */
html.device-android .banner{background-image:url(image-android.webp)}
html.device-mb .banner{background-image:url(image-mb.webp)}
```

**`DeviceProfile`** fields:

- `name`: device id, used as both the class suffix (`device-ios`) and the filename suffix (`image-ios.webp`)
- `match`: UA regex used by the injected script (array order, first match wins)
- `quality`: compression quality for this device, overrides global `quality`
- `scale`: `0-1`, scales the **output bitmap pixels only** (`width`/`height` resized proportionally); the CSS box size is untouched, so the browser renders the smaller image at the same size — fewer bytes on mobile
- `format`: output format, default `convert.format` (or the original format when `convert` is off)
- `sharpConfig`: per-device sharp options, overrides global `sharpConfig`

Notes:

- Only **raster** images referenced by CSS `background`/`background-image` get variants (`svg`/`gif` are skipped). `<img>` tags are not affected.
- A variant is skipped when it ends up larger than the source — that device falls back to the base image.
- When no device matches the UA, no class is added and the original (base) image is used.
- Cannot be combined with `compatibility` (both rewrite CSS background-image selectors) — when both are enabled, `compatibility` is disabled and `deviceCss` takes over.
- Does **not** run in dev (variants are physical files); dev serves the single image as usual.

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
