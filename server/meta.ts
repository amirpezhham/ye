import { pool } from "./db.js"

/**
 * تزریق متا تگ‌ها در سمت سرور.
 *
 * چرا لازم است؟ پیش‌نمایش لینک در تلگرام، واتساپ و توییتر هیچ جاوااسکریپتی اجرا
 * نمی‌کند. پیش از این متاها فقط با `setSeoMeta` در مرورگر ست می‌شدند، بنابراین
 * اشتراک‌گذاری لینک یک محصول همیشه عنوان پیش‌فرض سایت را نشان می‌داد.
 */

export interface PageMeta {
  title: string
  description: string
  image: string
  canonical: string
  type: "website" | "product" | "article"
  jsonLd?: Record<string, unknown>
}

interface SeoSettings {
  siteTitle?: unknown
  siteDescription?: unknown
  ogImage?: unknown
  homeTitle?: unknown
  homeDescription?: unknown
}

const FALLBACK_TITLE = "یه دود ۲ دود"
const FALLBACK_DESCRIPTION =
  "فروشگاه آنلاین تخصصی سیگار، تنباکو، قلیان، ویپ، ذغال، فندک، اکسسوری و قهوه با ارسال سریع."
const FALLBACK_IMAGE = "/images/logo.jpg"

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** تصویر باید آدرس مطلق باشد، وگرنه تلگرام پیش‌نمایش را نشان نمی‌دهد. */
function absoluteImage(origin: string, value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return `${origin}${FALLBACK_IMAGE}`

  const image = value.trim()
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  // تصاویر قدیمی dataURL برای پیش‌نمایش قابل استفاده نیستند.
  if (image.startsWith("data:")) return `${origin}${FALLBACK_IMAGE}`

  return `${origin}${image.startsWith("/") ? "" : "/"}${image}`
}

function truncate(value: string, max = 300): string {
  const clean = value.replace(/\s+/g, " ").trim()
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

async function loadSeoSettings(): Promise<SeoSettings> {
  const result = await pool.query("SELECT value FROM site_settings WHERE setting_key = 'seo'")
  return (result.rows[0]?.value as SeoSettings | undefined) ?? {}
}

async function loadJsonRecord(table: "products" | "categories" | "posts", slug: string) {
  const result = await pool.query(`SELECT data FROM ${table} WHERE slug = $1`, [slug])
  return (result.rows[0]?.data as Record<string, unknown> | undefined) ?? null
}


/**
 * متای مناسب یک مسیر را می‌سازد. در صورت خطای دیتابیس به متای پیش‌فرض سایت
 * برمی‌گردد تا صفحه هرگز به خاطر سئو خراب نشود.
 */
export async function buildPageMeta(pathname: string, origin: string): Promise<PageMeta> {
  const cleanPath = pathname.replace(/\/+$/, "") || "/"
  const canonical = `${origin}${cleanPath}`

  const fallback = (seo: SeoSettings, title?: unknown, description?: unknown): PageMeta => ({
    title: text(title, text(seo.siteTitle, FALLBACK_TITLE)),
    description: text(description, text(seo.siteDescription, FALLBACK_DESCRIPTION)),
    image: absoluteImage(origin, seo.ogImage),
    canonical,
    type: "website",
  })

  try {
    const seo = await loadSeoSettings()

    if (cleanPath === "/") {
      return fallback(seo, seo.homeTitle, seo.homeDescription)
    }

    const productMatch = /^\/product\/([^/]+)$/.exec(cleanPath)
    if (productMatch) {
      const product = await loadJsonRecord("products", decodeURIComponent(productMatch[1]))
      if (!product) return fallback(seo)

      const name = text(product.name, FALLBACK_TITLE)
      const description = truncate(
        text(product.seoDescription, text(product.description, FALLBACK_DESCRIPTION)),
      )
      const price = typeof product.price === "number" ? product.price : undefined
      const image = absoluteImage(origin, product.image)

      return {
        title: text(product.seoTitle, name),
        description,
        image,
        canonical,
        type: "product",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description,
          image,
          ...(typeof product.brand === "string" && product.brand
            ? { brand: { "@type": "Brand", name: product.brand } }
            : {}),
          ...(typeof product.sku === "string" && product.sku ? { sku: product.sku } : {}),
          ...(price !== undefined
            ? {
                offers: {
                  "@type": "Offer",
                  price,
                  priceCurrency: "IRR",
                  availability:
                    product.status === "out-of-stock"
                      ? "https://schema.org/OutOfStock"
                      : "https://schema.org/InStock",
                  url: canonical,
                },
              }
            : {}),
        },
      }
    }

    const categoryMatch = /^\/products\/([^/]+)$/.exec(cleanPath)
    if (categoryMatch) {
      const category = await loadJsonRecord("categories", decodeURIComponent(categoryMatch[1]))
      if (!category) return fallback(seo)

      return {
        title: `${text(category.name, FALLBACK_TITLE)} | ${text(seo.siteTitle, FALLBACK_TITLE)}`,
        description: truncate(text(category.description, FALLBACK_DESCRIPTION)),
        image: absoluteImage(origin, category.image),
        canonical,
        type: "website",
      }
    }

    const postMatch = /^\/blog\/([^/]+)$/.exec(cleanPath)
    if (postMatch) {
      const post = await loadJsonRecord("posts", decodeURIComponent(postMatch[1]))
      if (!post) return fallback(seo)

      return {
        title: `${text(post.title, FALLBACK_TITLE)} | ${text(seo.siteTitle, FALLBACK_TITLE)}`,
        description: truncate(text(post.excerpt, FALLBACK_DESCRIPTION)),
        image: absoluteImage(origin, post.image),
        canonical,
        type: "article",
      }
    }

    return fallback(seo)
  } catch (error) {
    console.error("ساخت متای صفحه ناموفق بود؛ متای پیش‌فرض استفاده می‌شود:", error)
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      image: `${origin}${FALLBACK_IMAGE}`,
      canonical,
      type: "website",
    }
  }
}

/** تگ‌های HTML آماده برای جایگزینی بین نشانه‌های app-meta در index.html. */
export function renderMetaTags(meta: PageMeta): string {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:locale" content="fa_IR" />`,
    `<meta property="og:site_name" content="${escapeHtml(FALLBACK_TITLE)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
  ]

  if (meta.jsonLd) {
    // محتوای JSON داخل <script> نباید شامل </script> باشد.
    const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }

  return tags.join("\n    ")
}

const META_PATTERN = /<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/

/** متای ساخته‌شده را جایگزین بلوک پیش‌فرض در قالب index.html می‌کند. */
export function injectMeta(template: string, meta: PageMeta): string {
  if (!META_PATTERN.test(template)) return template
  return template.replace(
    META_PATTERN,
    `<!--app-meta:start-->\n    ${renderMetaTags(meta)}\n    <!--app-meta:end-->`,
  )
}
