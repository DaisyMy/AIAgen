import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')  // 重写路径，去掉 /api 前缀
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
    },
})
