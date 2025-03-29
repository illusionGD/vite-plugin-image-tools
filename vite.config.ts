import { defineConfig, UserConfig } from 'vite'
import { builtinModules } from 'module'

// https://vite.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src',
            name: 'ImageTools',
            formats: ['es', 'cjs', 'umd'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                ...builtinModules, // 确保不打包 Node.js 内置模块
                'sharp',
                'vite',
            ],
        },
    },
})
