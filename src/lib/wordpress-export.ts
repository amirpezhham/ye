/**
 * تولید خروجی‌های انتقال محتوا به وردپرس.
 *
 * این توابع خالص (pure) هستند و به دیتابیس/فایل‌سیستم وابسته نیستند تا هم
 * اسکریپت `scripts/export-content.mts` از آن‌ها استفاده کند و هم قابل تست باشند.
 *
 * سه قالب پشتیبانی می‌شود:
 *   - JSON : پشتیبان‌گیری کامل یا مصرف با کد سفارشی (وردپرس خودش JSON نمی‌خورد)
 *   - CSV  : فرمت بومی درون‌ریزی محصولات در ووکامرس
 *   - WXR  : فرمت بومی درون‌ریزی مطالب در وردپرس
 */

export type JsonRecord = Record<string, unknown>

export interface SiteContentInput {
  generatedAt: string
  baseUrl: string
  categories: JsonRecord[]
  products: JsonRecord[]
  posts: JsonRecord[]
  settings: JsonRecord
}

/** ستون‌های CSV مطابق نام‌های استاندارد درون‌ریز ووکامرس. */
export const WOOCOMMERCE_HEADER = [
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
] as const

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

/**
 * آدرس تصویر باید مطلق باشد، وگرنه وردپرس نمی‌تواند تصویر را دانلود کند.
 * اگر `baseUrl` داده نشود، مسیر نسبی دست‌نخورده برمی‌گردد.
 */
export function absoluteImageUrl(value: unknown, baseUrl: string): string {
  if (typeof value !== "string" || !value.trim()) return ""
  const image = value.trim()
  if (/^https?:\/\//i.test(image)) return image
  const trimmedBase = baseUrl.replace(/\/+$/, "")
  if (!trimmedBase) return image
  return `${trimmedBase}${image.startsWith("/") ? "" : "/"}${image}`
}

/** فرار دادن یک مقدار برای CSV مطابق RFC 4180. */
export function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function csvRow(values: readonly unknown[]): string {
  return values.map(csvCell).join(",")
}

/** فرار دادن متن برای XML. */
export function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** خروجی JSON کامل (پشتیبان‌گیری یا مصرف با ابزار سفارشی). */
export function buildSiteContent(input: SiteContentInput): string {
  return JSON.stringify(
    {
      generatedAt: input.generatedAt,
      baseUrl: input.baseUrl || null,
      categories: input.categories,
      products: input.products,
      posts: input.posts,
      settings: input.settings,
    },
    null,
    2,
  )
}

/** CSV آمادهٔ درون‌ریزی در ووکامرس (با BOM تا متن فارسی درست خوانده شود). */
export function buildWooCommerceCsv(
  products: JsonRecord[],
  baseUrl: string,
): string {
  const lines = [csvRow(WOOCOMMERCE_HEADER)]

  for (const product of products) {
    const price = asNumber(product.price)
    const oldPrice = typeof product.oldPrice === "number" ? product.oldPrice : ""
    const inStock = product.status !== "out-of-stock"

    lines.push(
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
        absoluteImageUrl(product.image, baseUrl),
      ]),
    )
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`
}

/** XML به فرمت WXR که درون‌ریز بومی وردپرس قبولش می‌کند. */
export function buildWxr(
  posts: JsonRecord[],
  settings: JsonRecord,
  baseUrl: string,
  now: Date = new Date(),
): string {
  const siteUrl = baseUrl || "https://example.com"
  const seo = (settings.seo ?? {}) as JsonRecord

  const items = posts
    .map((post) => {
      const createdAtRaw = post.createdAt
      const createdAt = typeof createdAtRaw === "number" ? new Date(createdAtRaw) : now
      return `  <item>
    <title>${xmlEscape(post.title)}</title>
    <link>${xmlEscape(`${siteUrl}/blog/${asString(post.slug)}`)}</link>
    <pubDate>${createdAt.toUTCString()}</pubDate>
    <dc:creator><![CDATA[admin]]></dc:creator>
    <guid isPermaLink="false">${xmlEscape(asString(post.id) || asString(post.slug))}</guid>
    <description></description>
    <content:encoded><![CDATA[${asString(post.body)}]]></content:encoded>
    <excerpt:encoded><![CDATA[${asString(post.excerpt)}]]></excerpt:encoded>
    <wp:post_id>${xmlEscape(asString(post.id))}</wp:post_id>
    <wp:post_date><![CDATA[${createdAt.toISOString().slice(0, 19).replace("T", " ")}]]></wp:post_date>
    <wp:post_name><![CDATA[${asString(post.slug)}]]></wp:post_name>
    <wp:status><![CDATA[publish]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
  </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <title>${xmlEscape(seo.siteTitle ?? "یه دود ۲ دود")}</title>
  <link>${xmlEscape(siteUrl)}</link>
  <description>${xmlEscape(seo.siteDescription ?? "")}</description>
  <pubDate>${now.toUTCString()}</pubDate>
  <language>fa-IR</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${xmlEscape(siteUrl)}</wp:base_site_url>
  <wp:base_blog_url>${xmlEscape(siteUrl)}</wp:base_blog_url>
${items}
</channel>
</rss>
`
}
