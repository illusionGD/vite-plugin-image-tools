import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteImageTools from '../core/src/index'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: (file: string) => {
      return false
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        index_2: resolve(__dirname, 'index_2.html'),
        test: resolve(__dirname, './src/pages/test.html')
      }
    }
  },
  plugins: [
    vue(),
    ViteImageTools({
      quality: 90,
      enableDev: true,
      enableDevConvert: true,
      compatibility: false,
      convert: {
        enable: true,
        format: 'webp',
        deleteOriginImg: true,
        limitSize: 2 * 1024
      },
      perImage: async (filePath: string) => {
        if (filePath.includes('import.jpg')) {
          return { format: 'avif', quality: 60 }
        }
        if (filePath.includes('css.jpg')) {
          return { quality: 50 }
        }
        return {}
      },
      sharpConfig: {
        webp: {
          quality: 80
        },
        avif: {
          quality: 60
        }
      },
      spritesConfig: {
        rules: [
          {
            dir: './src/assets/icons',
            outputDir: './src/assets/sprites',
            name: 'icons-sprites-test',
          }
        ],
        rootValue: 100,
        algorithm: 'binary-tree'
      },
      cssGen: {
        rules: [
          {
            inputDir: './src/assets/icons',
            stylePath: 'assets/generated/image-classes.css',
            classPrefix: 'ui--',
            variantRules: [
              {
                regex: /_hover$/,
                pseudo: ':hover'
              }
            ]
          },
          {
            inputDir: './src/assets',
            stylePath: 'assets/generated/image-classes.css',
            includes: /\.(png|jpe?g)$/i,
            excludes: /icons\//
          }
        ]
      },
      publicConfig: {
        enable: true,
        quality: 80,
      }
    })
  ]
  //   experimental: {
  //     renderBuiltUrl(filename, opt) {
  //       console.log('🚀 ~ opt:', opt)
  //       console.log('🚀 ~ filename:', filename)
  //       return filename
  //     }
  //   }
})
