import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import ImageTools from '../src/index'
import ImageTools from 'vite-plugin-image-tools'
import { resolve } from 'path'
import { readFileSync, statSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
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
    // vitePluginSprite({
    //   spriteDir: './src/assets/icons'
    // }),
    ImageTools({
      quality: 70,
      enableWebp: true,
      // enableDev: true,
      // enableDevWebp: true,
      spriteConfig: {
        spriteDir: './src/assets/icons'
      },
      // compatibility: false,
      // bodyWebpClassName: 'webp-1',
      // excludes: '',
      // sharpConfig: {
      //   // jpg: {
      //   //   quality: 10
      //   // },
      //   // png: {
      //   //   quality: 70
      //   // }
      // },
      filter: (path) => {
        const file = readFileSync(path)
        if (!file) {
          return false
        }

        const stats = statSync(path)
          // 10kb以下不处理
        if (stats.size <= 1024 * 4) {
          return false
        }
          console.log("🚀 ~ path:", path)
          return true
      }
    })
  ]
})
