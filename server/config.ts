import "dotenv/config"
import { z } from "zod"

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // بیشتر هاست‌ها پورت را با متغیر PORT تزریق می‌کنند؛ API_PORT اولویت دارد.
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  // حالت SSL اتصال به پایگاه‌داده:
  //   true (پیش‌فرض در production) = SSL با اعتبارسنجی گواهی
  //   no-verify = SSL بدون اعتبارسنجی گواهی (برای گواهی self-signed)
  //   false = بدون SSL (پایگاه‌داده‌های داخلی/محلی)
  DATABASE_SSL: z.enum(["true", "false", "no-verify"]).optional(),
  ADMIN_ORIGIN: z.string().url().default("http://localhost:4173"),
  SESSION_SECRET: z.string().min(32),
  ADMIN_SESSION_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  // سرو کردن خروجی بیلد فرانت‌اند از خود Express (تک‌سرویسی روی هاست).
  SERVE_STATIC: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  STATIC_DIR: z.string().optional(),
  // در صورت فعال بودن پروکسی معکوس، آدرس عمومی سایت برای robots/sitemap.
  PUBLIC_SITE_URL: z.string().url().optional(),
  // تعداد هاپ‌های پروکسی معکوس برای تشخیص IP و پروتکل اصلی درخواست.
  //   "false" → بدون پروکسی | عدد → تعداد هاپ‌ها | سایر مقادیر Express مثل "loopback"
  TRUST_PROXY: z.string().optional(),
  // اگر true باشد، درخواست‌های HTTP به HTTPS هدایت می‌شوند (لازم برای کوکی Secure).
  FORCE_HTTPS: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  // اجرای مستقیم HTTPS بدون پروکسی معکوس (مسیر فایل‌های گواهی و کلید).
  TLS_CERT_FILE: z.string().optional(),
  TLS_KEY_FILE: z.string().optional(),
})

const rawNodeEnv = process.env.NODE_ENV ?? "development"
const rawIsProduction = rawNodeEnv === "production"

const parsed = environmentSchema.parse({
  ...process.env,
  API_PORT: process.env.API_PORT ?? process.env.PORT ?? 4000,
  SERVE_STATIC: process.env.SERVE_STATIC ?? (rawIsProduction ? "true" : "false"),
  FORCE_HTTPS: process.env.FORCE_HTTPS ?? "false",
})

/**
 * مقدار «trust proxy» را از متغیر محیطی می‌سازد.
 * پیش‌فرض: در production یک هاپ (معمولاً nginx/Caddy) و در توسعه غیرفعال.
 */
function resolveTrustProxy(value: string | undefined): boolean | number | string {
  if (value === undefined || value.trim() === "") return rawIsProduction ? 1 : false
  if (value === "true") return true
  if (value === "false") return false
  const hops = Number(value)
  if (Number.isInteger(hops) && hops >= 0) return hops
  return value
}

export const config = parsed
export const isProduction = parsed.NODE_ENV === "production"
export const shouldServeStatic = parsed.SERVE_STATIC
export const trustProxy = resolveTrustProxy(parsed.TRUST_PROXY)
export const httpsEnabled = Boolean(parsed.TLS_CERT_FILE && parsed.TLS_KEY_FILE)
