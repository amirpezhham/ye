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
 *   npm run export:content -- --base-url=https://yedood.ir
 */
import "dotenv/config"

import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { Pool } from "pg"

const args = process.argv.slice(2)
const baseUrlArg = args.find((arg) => arg.startsWith("--base-url="))?.slice("--base-url=".length)
const baseUrl = (baseUrlArg ?? process.env.PUBLIC_SITE_URL ?? "").replace(/\/+$/, "")

const outDir = path.resolve(process.cwd(), "exports")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const products = (await pool.query("SELECT data FROM products ORDER BY created_at")).rows.map((row) => row.data)
const categories = (await pool.query("SELECT data FROM categories ORDER BY slug")).rows.map((row) => row.data)
const posts = (await pool.query("SELECT data FROM posts ORDER BY created_at")).rows.map((row) => row.data)
const settingRows = (await pool.query("SELECT setting_key, value FROM site_settings")).rows
const settings = Object.fromEntries(settingRows.map((row) => [row.setting_key, row.value]))
await pool.end()

/** آدرس تصویر باید مطلق باشد، وگرنه وردپرس نمی‌تواند تصویر را دانلود کند. */
function imageUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return ""
  const image = value.trim()
  if (/^https?:\/\//.test(image)) return image
  if (!baseUrl) return image
  return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`
}

/** فرار دادن مقادیر برای CSV مطابق RFC 4180. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(",")
}

/** فرار دادن متن برای XML. */
function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const numeric = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback

await mkdir(outDir, { recursive: true })

// ---------- ۱) JSON ----------
const jsonPath = path.join(outDir, "site-content.json")
await writeFile(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: baseUrl || null,
      categories,
      products,
      posts,
      settings,
    },
    null,
    2,
  ),
  "utf8",
)


// ---------- ۲) CSV آمادهٔ ووکامرس ----------
const csvHeader = [
  "Type",
  "SKU",
  "Name",
  "Published",
  "Is featured?",
  "Visibility in catalog",
  "Short description",
  "Description",
  "In stock?",
  "Stock",
  "Regular price",
  "Sale price",
  "Categories",
  "Images",
]

const csvLines = [csvRow(csvHeader)]
for (const product of products) {
  const price = numeric(product.price)
  const oldPrice = typeof product.oldPrice === "number" ? product.oldPrice : ""
  const inStock = product.status !== "out-of-stock"

  csvLines.push(
    csvRow([
      "simple",
      product.sku ?? "",
      product.name ?? "",
      1,
      product.featured ? 1 : 0,
      "visible",
      product.description ?? "",
      product.description ?? "",
      inStock ? 1 : 0,
      typeof product.stock === "number" ? product.stock : "",
      price,
      oldPrice,
      product.category ?? "",
      imageUrl(product.image),
    ]),
  )
}

const csvPath = path.join(outDir, "woocommerce-products.csv")
// BOM تا اکسل و ووکامرس متن فارسی را درست بخوانند.
await writeFile(csvPath, `\uFEFF${csvLines.join("\r\n")}\r\n`, "utf8")

// ---------- ۳) WXR برای مطالب وبلاگ ----------
const siteUrl = baseUrl || "https://example.com"
const now = new Date()

const items = posts
  .map((post) => {
    const createdAt = typeof post.createdAt === "number" ? new Date(post.createdAt) : now
    return `  <item>
    <title>${xmlEscape(post.title)}</title>
    <link>${xmlEscape(`${siteUrl}/blog/${post.slug ?? ""}`)}</link>
    <pubDate>${createdAt.toUTCString()}</pubDate>
    <dc:creator><![CDATA[admin]]></dc:creator>
    <guid isPermaLink="false">${xmlEscape(post.id ?? post.slug ?? "")}</guid>
    <description></description>
    <content:encoded><![CDATA[${post.body ?? ""}]]></content:encoded>
    <excerpt:encoded><![CDATA[${post.excerpt ?? ""}]]></excerpt:encoded>
    <wp:post_id>${xmlEscape(post.id ?? "")}</wp:post_id>
    <wp:post_date><![CDATA[${createdAt.toISOString().slice(0, 19).replace("T", " ")}]]></wp:post_date>
    <wp:post_name><![CDATA[${post.slug ?? ""}]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
  </item>`
  })
  .join("\n")

const wxr = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <title>${xmlEscape(settings.seo?.siteTitle ?? "یه دود ۲ دود")}</title>
  <link>${xmlEscape(siteUrl)}</link>
  <description>${xmlEscape(settings.seo?.siteDescription ?? "")}</description>
  <pubDate>${now.toUTCString()}</pubDate>
  <language>fa-IR</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${xmlEscape(siteUrl)}</wp:base_site_url>
  <wp:base_blog_url>${xmlEscape(siteUrl)}</wp:base_blog_url>
${items}
</channel>
</rss>
`

const wxrPath = path.join(outDir, "wordpress-posts.xml")
await writeFile(wxrPath, wxr, "utf8")

console.log(`
✅ خروجی آماده شد در: ${outDir}

  • site-content.json          ${products.length} محصول، ${categories.length} دسته‌بندی، ${posts.length} مطلب
  • woocommerce-products.csv   آمادهٔ درون‌ریزی در ووکامرس
  • wordpress-posts.xml        آمادهٔ درون‌ریزی در وردپرس (ابزار بومی)

نکته: ${baseUrl ? `آدرس پایه: ${baseUrl}` : "آدرس پایه تنظیم نشده؛ مسیر تصاویر نسبی مانده است."}
`)
