import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ImageTools from 'vite-plugin-image-tools'
import { resolve } from 'path'

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
      compatibility: false,
      bodyWebpClassName: 'webp-1',
      excludes: '',
      sharpConfig: {
        // jpg: {
        //   quality: 10
        // },
        // png: {
        //   quality: 70
        // }
      },
      filter: async (path) => {
        // console.log("🚀 ~ path:", path)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(true)
          }, 100)
        })

        // return path.includes('.svg')
      }
    })
  ]
})
