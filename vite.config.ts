import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const apiTarget = `http://localhost:${process.env.API_PORT ?? 4000}`

/**
 * پروکسی + پیام راهنما در صورت بالا نبودن API.
 *
 * پیش‌فرض پروکسی Vite یک «502 Bad Gateway» خالی برمی‌گرداند که هیچ سرنخی
 * نمی‌دهد؛ اینجا به‌جایش پیامی می‌فرستیم که مستقیماً بگوید چه کاری لازم است.
 */
function apiProxy(): ProxyOptions {
  return {
    target: apiTarget,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('error', (error, _request, response) => {
        console.error(
          `\n[proxy] ارتباط با API برقرار نشد (${error.message}).\n` +
            `        سرویس API روی ${apiTarget} بالا نیست.\n` +
            '        آن را با «npm run api:dev» در یک ترمینال جدا اجرا کنید\n' +
            '        یا هر دو سرویس را با «npm run dev:all» بالا بیاورید.\n',
        )

        const res = response as { headersSent?: boolean; writeHead?: (code: number, headers: Record<string, string>) => void; end?: (body: string) => void }
        if (!res || res.headersSent) return

        res.writeHead?.(503, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end?.(
          JSON.stringify({
            error: {
              code: 'API_UNAVAILABLE',
              message:
                'سرویس API بالا نیست. آن را با «npm run api:dev» در یک ترمینال جدا اجرا کنید ' +
                'یا هر دو سرویس را با «npm run dev:all» بالا بیاورید.',
            },
          }),
        )
      })
    },
  }
}

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
      '/api': apiProxy(),
      // تصاویر آپلودشده روی دیسک سرور هستند و باید در توسعه هم پروکسی شوند.
      '/uploads': apiProxy(),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
