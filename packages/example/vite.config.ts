import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import ImageTools from '../src/index'
import ViteImageTools from '../core/src/index'
import { resolve } from 'path'
import { readFileSync, statSync } from 'fs'

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
      enableWebp: true,
      enableDevWebp: true,
      compatibility: true,
      // limitSize: 1024 *1024,
      // publicConfig: {
      //     enable: true,
      //     quality: 50,
      // },
      sharpConfig: {
        webp: {
          quality: 80
        }
      },
    //   webpConfig: {
    //     // limitSize: 1024 *1024,
    //     deleteOriginImg: false,
    //     filter: (path: string) => {
    //       if (path.includes('spine')) {
    //         return false
    //       }

    //       return true
    //     }
    //   },
      // filter: (path: string) => {
      //     try {
      //         const stats = statSync(path)
      //         if (path.includes('-sprites') && stats.size > 1024 * 20) {
      //             return true
      //         }
      //         if (stats.size < 1024 * 200) {
      //             return false
      //         }
      //         return true
      //     } catch (error) {
      //         console.log('ViteImageTools~ filter error:', error)
      //         return false
      //     }
      // },
      // debugLog: true,
      spritesConfig: {
        // outputDir: './src/assets/sprites',
        rules: [
          {
            dir: './src/assets/icons',
    
          },
        ],
        // transformUnit: (unit) => {
        //   return unit / 100 + 'rem'
        // },
        rootValue: 100,
        algorithm: 'binary-tree'
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
