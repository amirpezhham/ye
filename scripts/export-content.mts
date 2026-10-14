/**
 * خروجی گرفتن از محتوای سایت برای انتقال به وردپرس.
 *
 * سه فایل می‌سازد:
 *   - site-content.json        : همهٔ داده‌ها (پشتیبان‌گیری / مصرف با کد)
 *   - woocommerce-products.csv : آمادهٔ درون‌ریزی در ووکامرس (ابزار بومی CSV)
 *   - wordpress-posts.xml      : WXR که درون‌ریز بومی وردپرس قبولش می‌کند
 *
 * استفاده:
 *   npm run export:content
 *   npm run export:content -- --base-url=https://yedood2dood.ir
 *
 * نکته: وردپرس فایل JSON را به‌عنوان ورودی نمی‌شناسد؛ به همین دلیل کنار JSON
 * دو فرمت بومی وردپرس (CSV برای ووکامرس و WXR برای مطالب) هم تولید می‌شود.
 */
import "dotenv/config"

import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { Pool } from "pg"

import {
  buildSiteContent,
  buildWooCommerceCsv,
  buildWxr,
  type JsonRecord,
} from "../src/lib/wordpress-export.ts"

const args = process.argv.slice(2)
const baseUrlArg = args
  .find((arg) => arg.startsWith("--base-url="))
  ?.slice("--base-url=".length)
const baseUrl = (baseUrlArg ?? process.env.PUBLIC_SITE_URL ?? "").replace(/\/+$/, "")

const outDir = path.resolve(process.cwd(), "exports")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const products = (await pool.query("SELECT data FROM products ORDER BY created_at"))
  .rows.map((row) => row.data) as JsonRecord[]
const categories = (
  await pool.query("SELECT data FROM categories ORDER BY slug")
).rows.map((row) => row.data) as JsonRecord[]
const posts = (await pool.query("SELECT data FROM posts ORDER BY created_at")).rows.map(
  (row) => row.data,
) as JsonRecord[]
const settingRows = (
  await pool.query("SELECT setting_key, value FROM site_settings")
).rows as { setting_key: string; value: unknown }[]
const settings = Object.fromEntries(
  settingRows.map((row) => [row.setting_key, row.value]),
)
await pool.end()

await mkdir(outDir, { recursive: true })

// ---------- ۱) JSON (پشتیبان‌گیری یا مصرف با ابزار سفارشی) ----------
const jsonPath = path.join(outDir, "site-content.json")
await writeFile(
  jsonPath,
  buildSiteContent({
    generatedAt: new Date().toISOString(),
    baseUrl,
    categories,
    products,
    posts,
    settings,
  }),
  "utf8",
)

// ---------- ۲) CSV آمادهٔ ووکامرس ----------
const csvPath = path.join(outDir, "woocommerce-products.csv")
await writeFile(csvPath, buildWooCommerceCsv(products, baseUrl), "utf8")

// ---------- ۳) WXR برای مطالب وبلاگ ----------
const wxrPath = path.join(outDir, "wordpress-posts.xml")
await writeFile(wxrPath, buildWxr(posts, settings, baseUrl), "utf8")

console.log(`
✅ خروجی آماده شد در: ${outDir}

  • site-content.json          ${products.length} محصول، ${categories.length} دسته‌بندی، ${posts.length} مطلب
  • woocommerce-products.csv   آمادهٔ درون‌ریزی در ووکامرس
  • wordpress-posts.xml        آمادهٔ درون‌ریزی در وردپرس (ابزار بومی)

نکته: ${baseUrl ? `آدرس پایه: ${baseUrl}` : "آدرس پایه تنظیم نشده؛ مسیر تصاویر نسبی مانده است."}
`)
