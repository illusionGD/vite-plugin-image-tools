# vite-plugin-image-tools

<p align="center">
  <img src="https://cdn-fusion.imgcdn.store/i/2026/e58943ee633e97e8.png" alt="vite-plugin-image-tools logo" width="500" />
</p>

[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **中文**

Vite 图片处理插件：压缩、格式转换（WebP/AVIF）、精灵图合并、CSS 类自动生成。

> 📚 **v3.x 及更早版本文档**：[English](./docs/README-v3.md) | [中文](./docs/README-v3.zh.md)

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
        // rootValue: 16
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
| deviceCss           | object             | `{ enable: false }`                                          | 多端 CSS 图片变体（仅构建期）                               |
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
  transformUnit: (unit, filePath) => `${unit / 16}rem`,
  deleteOriginImg: false
}
```

**`transformUnit`**：`(unit: number, filePath: string) => string`

自定义写入生成的精灵图 CSS 中每个数值（`width` / `height` / `background-position`）的单位。

- `unit`：精灵图计算出的原始像素值
- `filePath`：源图绝对路径，可据此对不同图片做差异化转换
- 返回值：**带单位**的最终值（如 `'0.32rem'`、`'10px'`）

不传时默认为 `` `${unit}px` ``。可用于输出 `rem` / `vw` 或其它自定义单位：

```js
// px → rem（设计稿基准 16px）
transformUnit: (unit) => `${unit / 16}rem`
```

**`rootValue`**：`number`，默认 `1`

当源 CSS 中图标的 `width` / `height` 使用 `rem` 单位时，插件需要先把它换算成 px，才能计算精灵图相对原图的缩放比例。`rootValue` 即每 `1rem` 对应的 px 数（`px = rem 值 × rootValue`）。源 CSS 使用 px 时该配置不生效。

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

`transform` 的入参：
- `className`：生成后的类名（不含前导 `.`）
- `imageUrl`：CSS 中使用的相对图片路径
- `imageAbsPath`：源图片绝对路径
- `width` / `height`：图片元信息宽高

`transform` 的返回值：
- 返回样式对象（`Record<string, string | number | null | undefined>`）
- 键名支持 `camelCase` 和 `kebab-case`
- 返回空值（`undefined` / `null`）时，回退到默认生成声明

`cssGen` 详细配置示例：

```js
cssGen: {
  format: 'css',
  rules: [
    {
      // 递归扫描该目录
      inputDir: './src/assets/icons',
      // 输出 CSS 文件（开发环境相对项目根目录 / 构建时相对 outDir）
      stylePath: 'assets/generated/image-classes.css',
      // 默认类名：`${classPrefix}${baseName}`
      classPrefix: 'ui--',
      // 可选的 includes / excludes / filter 过滤链
      includes: /\.(png|jpe?g|webp)$/i,
      excludes: /\/deprecated\//,
      filter: async (absPath) => !absPath.includes('ignore'),
      // 文件名后缀转伪类
      variantRules: [
        { regex: /_hover$/, pseudo: ':hover' },
        { regex: /_active$/, pseudo: 'active' } // 也支持 'active'（会自动转成 ':active'）
      ],
      // 可选的类名解析器
      resolveClass: (filePath, baseName) => {
        if (filePath.includes('/brand/')) return `brand-${baseName}`
        return `ui--${baseName}`
      },
      // 可选自定义样式对象
      transform: ({ className, imageUrl, imageAbsPath, width, height }) => {
        // 只对某张图自定义，其它返回空值走默认回退
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

**开发监听**：源图变化时重新生成 CSS 并触发整页刷新。

### compatibility

为 `true` 时，插入脚本检测 WebP 支持，仅对 CSS 背景图做转换。适用于需兼容不支持 WebP 的浏览器场景。

> 与 `deviceCss` 互斥。两者同时开启时，`compatibility` 会被禁用。

### deviceCss

**仅构建期生效。** 为 CSS 背景图按端生成不同压缩档的变体，向 `<head>` 注入同步的 UA 检测脚本（给 `<html>` 加 `device-<name>` 类），并在 CSS 末尾追加覆盖规则，使各端加载各自的图片。

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

生成产物：

```html
<!-- 注入在 <head> 最前，CSS 生效前同步执行（无闪烁） -->
<script>;(function(){var ua=navigator.userAgent;var name="";
  if(/iphone|ipad|ipod/i.test(ua))name="ios";
  else if(/android/i.test(ua))name="android";
  else if(/mobile/i.test(ua))name="mb";
  if(name)document.documentElement.classList.add("device-"+name)})()</script>
```

```css
.banner{background-image:url(image.webp)}                          /* 基础图 —— 不变，无端匹配时使用 */
html.device-ios .banner{background-image:url(image-ios.webp)}      /* 只替换 url() */
html.device-android .banner{background-image:url(image-android.webp)}
html.device-mb .banner{background-image:url(image-mb.webp)}
```

**`DeviceProfile`** 字段：

- `name`：端标识，同时作为 class 后缀（`device-ios`）和文件名后缀（`image-ios.webp`）
- `match`：注入脚本使用的 UA 正则（按数组顺序，先匹配先生效）
- `quality`：该端压缩质量，覆盖全局 `quality`
- `scale`：`0-1`，**仅缩小输出图的像素**（宽高等比缩放），不改变 CSS 盒子尺寸——浏览器把更小的图渲染到同样大小，移动端字节更省
- `format`：输出格式，默认 `convert.format`（`convert` 关闭时为原格式）
- `sharpConfig`：该端 sharp 细粒度配置，覆盖全局 `sharpConfig`

注意：

- 仅对 CSS `background`/`background-image` 引用的**位图**生成变体（跳过 `svg`/`gif`）；`<img>` 标签不受影响。
- 变体若比原图还大则跳过，该端回退到基础图。
- UA 未匹配任何端时不加 class，使用原始基础图。
- 不能与 `compatibility` 同时使用（两者都会改写 CSS 背景图选择器）——同时开启时 `compatibility` 会被禁用，由 `deviceCss` 接管。
- **dev 不生效**（变体是物理文件），dev 仍按单图服务。

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
