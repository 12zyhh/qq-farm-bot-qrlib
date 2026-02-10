import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    root: 'web',
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'web/src'),
        },
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})
