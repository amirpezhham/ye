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
})

export const config = environmentSchema.parse({
  ...process.env,
  API_PORT: process.env.API_PORT ?? process.env.PORT ?? 4000,
  SERVE_STATIC: process.env.SERVE_STATIC ?? (process.env.NODE_ENV === "production" ? "true" : "false"),
})

export const isProduction = config.NODE_ENV === "production"
export const shouldServeStatic = config.SERVE_STATIC
