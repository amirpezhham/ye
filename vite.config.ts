import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // باید «/» باشد (نه './')، وگرنه در مسیرهای تودرتوی SPA مثل /product/xyz
  // دارایی‌ها نسبت به همان مسیر درخواست می‌شوند و صفحه سفید می‌شود.
  base: process.env.VITE_BASE_PATH ?? '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? 4000}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
