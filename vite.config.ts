import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ImageTools from './src/index'
import { builtinModules } from 'module'

const type = process.env.TYPE
const config: UserConfig = {
    plugins: [],
}

if (type) {
    if (type.trim() === 'vue') {
        config.root = 'test/vue'
        config.build = {
            rollupOptions: {
                input: 'test/vue/src/main.ts',
            },
        }
        config.plugins.push(vue(), ImageTools())
    }
} else {
    config.build = {
        lib: {
            entry: 'src',
            name: 'ImageTools',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                ...builtinModules, // 确保不打包 Node.js 内置模块
            ],
        },
    }
}

// https://vite.dev/config/
export default defineConfig(config)
