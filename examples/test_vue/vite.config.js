import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ImageTools from 'vite-plugin-image-tools'
import { resolve } from 'path'
import { readFileSync, statSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
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
    ImageTools({
      quality: 80,
      enableWebp: true,
      enableDev: true,
      enableDevWebp: true,
      compatibility: true,
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
        if (stats.size <= 1024 * 1024 * 1) {
            console.log("🚀 ~ 1024 * 1024 * 1:", 1024 * 1024 * 1)
            console.log("🚀 ~ path:", path)
        console.log("🚀 ~ stats.size:", stats.size)
          return false
        }
        return true
      }
    })
  ]
})
