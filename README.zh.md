# vite-plugin-image-tools

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **中文**

Vite 图片处理插件：压缩、格式转换（WebP/AVIF）、精灵图合并、CSS 类自动生成。

## 特性

- **压缩**：生产与开发环境图片压缩
- **格式转换**：通过 `convert` 配置主输出格式（WebP、AVIF 等）
- **perImage**：单图质量与格式覆盖
- **精灵图**：合并图片为雪碧图；开发时监听源图变化自动重建
- **cssGen**：根据图片目录自动生成 CSS 类（支持变体如 `:hover`）
- **兼容模式**：仅对 CSS 背景图做 WebP 检测与转换

## 安装

```bash
npm i -D vite-plugin-image-tools
# 或
pnpm i -D vite-plugin-image-tools
# 或
yarn add -D vite-plugin-image-tools
```

## 使用

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

## 详细配置示例

完整功能配置示例：

```js
// vite.config.js
import { defineConfig } from 'vite'
import VitePluginImageTools from 'vite-plugin-image-tools'

export default defineConfig({
  plugins: [
    VitePluginImageTools({
      // 基础
      quality: 90,
      enableDev: true,
      enableDevConvert: true,
      compatibility: true,

      // 格式转换
      convert: {
        enable: true,
        format: 'webp',
        deleteOriginImg: false,
        limitSize: 2 * 1024
      },

      // 单图覆盖
      perImage: async (filePath) => {
        if (filePath.includes('hero.jpg')) return { format: 'avif', quality: 60 }
        if (filePath.includes('thumb')) return { quality: 50 }
        return {}
      },

      // Sharp 各格式选项
      sharpConfig: {
        webp: { quality: 80 },
        avif: { quality: 60 }
      },

      // 精灵图
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

      // 自动生成 CSS 类
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

      // 压缩 public/ 目录图片
      publicConfig: {
        enable: true,
        quality: 80
      }
    })
  ]
})
```

## 配置参数

| 参数                | 类型               | 默认值                                                       | 说明                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| quality             | number             | 80                                                           | 全局压缩质量 (1–100)                                         |
| enableDev           | boolean            | false                                                        | 开发环境是否启用压缩                                         |
| enableDevConvert    | boolean            | false                                                        | 开发环境是否启用格式转换                                     |
| convert             | object             | `{ enable: true, format: 'webp', deleteOriginImg: false }`    | 主格式转换配置                                               |
| perImage            | function           | `async () => ({})`                                           | 单图质量/格式覆盖解析器                                      |
| includes            | string / RegExp    | `/\.(png\|jpe?g\|gif\|webp\|svg\|avif)(\?.*)?$/i`            | 包含规则                                                    |
| excludes            | string / RegExp    | `''`                                                         | 排除规则                                                     |
| filter              | function           | `() => true`                                                 | 自定义过滤（支持 async）                                    |
| limitSize           | number             | -                                                            | 小于等于该值的文件跳过压缩/转换                              |
| compatibility       | boolean            | false                                                        | WebP 兼容模式（仅 CSS 图片）                                 |
| bodyWebpClassName   | string             | `'webp'`                                                     | 检测到 WebP 支持时添加到 body 的类名                         |
| cacheDir            | string             | `node_modules/.cache/vite-plugin-image`                       | 开发环境缓存目录                                             |
| spritesConfig       | object             | -                                                            | 精灵图配置                                                   |
| cssGen              | object             | `{ rules: [], format: 'css' }`                               | CSS 类生成规则                                              |
| sharpConfig         | object             | `{}`                                                         | Sharp 配置（jpeg、png、webp、avif 等）                       |
| svgoConfig          | object             | preset-default + removerXMLNS、removeViewBox                 | SVGO 配置                                                    |
| publicConfig        | object             | -                                                            | `public/` 目录图片配置                                       |
| imgAssetsDir        | string / string[]  | -                                                            | 图片资源目录（兼容 Vite 4.x）                                |
| log                 | boolean            | true                                                         | 是否打印输出日志                                             |

## 配置说明

### convert

主格式转换（4.0+）：

```js
convert: {
  enable: true,
  format: 'webp',        // 或 'avif'、'png' 等
  deleteOriginImg: false,
  limitSize: 2048,       // 小文件跳过转换
  filter: (path) => true
}
```

### perImage

按图片覆盖质量或格式：

```js
perImage: async (filePath) => {
  if (filePath.includes('hero.jpg')) return { format: 'avif', quality: 60 }
  if (filePath.includes('thumb')) return { quality: 50 }
  return {}
}
```

### spritesConfig

将目录内图片合并为精灵图：

```js
spritesConfig: {
  rules: [
    {
      dir: './src/assets/icons',
      name: 'icons',             // 可选，默认：dir 名称 + '-sprites'
      outputDir: './src/assets', // 可选，默认与 dir 相同
      padding: 0,
      algorithm: 'binary-tree'   // top-down | left-right | diagonal | alt-diagonal | binary-tree
    }
  ],
  outputDir: './dist/sprites',
  includes: /\.(png|jpg)$/,
  excludes: /\.(svg)$/,
  rootValue: 16,
  deleteOriginImg: false
}
```

**开发监听**：`enableDev` 为 true 时，插件会监听精灵图源目录。当图片增删改时，会重建精灵图、失效模块缓存并触发整页刷新。

**注意**：CSS 中的 `width`、`height` 需为具体数值（px 或 rem），不能为 `%`。

### cssGen

根据图片目录自动生成 CSS 类：

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

**开发监听**：源图变化时重新生成 CSS 并触发整页刷新。

### compatibility

为 `true` 时，插入脚本检测 WebP 支持，仅对 CSS 背景图做转换。适用于需兼容不支持 WebP 的浏览器场景。

### enableDev / enableDevConvert

- `enableDev`：开发环境启用压缩，默认：false
- `enableDevConvert`：开发环境启用格式转换（默认转 webp），默认：false

### sharpConfig

[Sharp 输出配置](https://sharp.pixelplumbing.com/api-output/)：

```js
sharpConfig: {
  webp: { quality: 80 },
  avif: { quality: 60 }
}
```

### svgoConfig

[SVGO preset-default](https://svgo.dev/docs/preset-default/)
