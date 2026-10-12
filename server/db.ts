import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import pg from "pg"

import { config, isProduction } from "./config.js"

/**
 * تعیین حالت SSL اتصال به پایگاه‌داده.
 *
 * ترتیب اولویت:
 *   ۱) متغیر محیطی `DATABASE_SSL` (کنترل صریح)
 *   ۲) پارامتر `sslmode` داخل رشتهٔ اتصال (مثل پستگرس‌های ابری Neon/Supabase
 *      که `?sslmode=require` می‌دهند) — پیش از این نادیده گرفته می‌شد و در
 *      حالت توسعه اتصال بی‌صدا شکست می‌خورد.
 *   ۳) پیش‌فرض: در production روشن، در توسعه خاموش
 */
function resolveSsl(connectionString: string): { rejectUnauthorized: boolean } | undefined {
  const mode = config.DATABASE_SSL

  if (mode === "false") return undefined
  if (mode === "no-verify") return { rejectUnauthorized: false }
  if (mode === "true") return { rejectUnauthorized: true }

  const sslMode = /[?&]sslmode=([a-z-]+)/i.exec(connectionString)?.[1]?.toLowerCase()
  if (sslMode) {
    if (sslMode === "disable") return undefined
    // معنای «require» در libpq رمزگذاری بدون اعتبارسنجی گواهی است.
    return { rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full" }
  }

  return isProduction ? { rejectUnauthorized: true } : undefined
}

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  ssl: resolveSsl(config.DATABASE_URL),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export async function migrate() {
  const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url))
  const schema = await readFile(schemaPath, "utf8")
  await pool.query(schema)
}

export async function closeDatabase() {
  await pool.end()
}
