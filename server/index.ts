import { existsSync, readFileSync } from "node:fs"
import https from "node:https"
import path from "node:path"

import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express, { type ErrorRequestHandler } from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"

import { startTelegramBot, stopTelegramBot } from "./bot.js"
import { config, httpsEnabled, shouldServeStatic, trustProxy } from "./config.js"
import { pool } from "./db.js"
import { startOutboxWorker, stopOutboxWorker } from "./outbox.js"
import { apiRouter } from "./routes.js"

const app = express()
app.disable("x-powered-by")
app.set("trust proxy", trustProxy)

app.use(compression())
app.use(
  helmet({
    // HSTS فقط روی پاسخ‌های واقعاً امن فرستاده می‌شود (پایین‌تر)، نه روی HTTP.
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // تصاویر محصول/بنر ممکن است از فضای ذخیره‌سازی بیرونی با https بیایند.
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "https:", "data:"],
      },
    },
  }),
)
// اگر HTTPS اجباری باشد، هر درخواست HTTP پیش از هر چیز به HTTPS هدایت می‌شود.
// کوکی نشست در production پرچم Secure دارد و روی HTTP ساده توسط مرورگر ذخیره
// نمی‌شود؛ این هدایت جلوی «ورود بی‌صدا شکست خورد» را می‌گیرد.
if (config.FORCE_HTTPS) {
  app.use((request, response, next) => {
    // بررسی سلامت برخی هاست‌ها روی HTTP انجام می‌شود و نباید هدایت شود.
    if (request.secure || request.path === "/api/health") {
      next()
      return
    }
    response.redirect(301, `https://${request.get("host") ?? ""}${request.originalUrl}`)
  })
}

// HSTS فقط روی اتصال واقعاً امن (شامل X-Forwarded-Proto وقتی trust proxy فعال است).
app.use((request, response, next) => {
  if (request.secure) {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  next()
})

app.use(cors({
  origin: config.ADMIN_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Idempotency-Key"],
}))
app.use(express.json({ limit: "12mb" }))
app.use(cookieParser())
app.use("/api", rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}))
app.use("/api", apiRouter)

// مسیرهای ناشناختهٔ API نباید به index.html سقوط کنند.
app.use("/api", (_request, response) => {
  response.status(404).json({ error: { code: "NOT_FOUND", message: "مسیر API پیدا نشد." } })
})

const staticDir = config.STATIC_DIR ?? path.resolve(process.cwd(), "dist")
const indexFile = path.join(staticDir, "index.html")
const serveStatic = shouldServeStatic && existsSync(indexFile)

if (shouldServeStatic && !serveStatic) {
  console.warn(`SERVE_STATIC فعال است اما فایل ${indexFile} پیدا نشد؛ ابتدا «npm run build» را اجرا کنید.`)
}

if (serveStatic) {
  const siteOrigin = (request: express.Request) =>
    (config.PUBLIC_SITE_URL ?? `${request.protocol}://${request.get("host") ?? "localhost"}`).replace(/\/+$/, "")

  // مسیرهای عمومی سایت برای نقشهٔ سایت و خزش موتورهای جست‌وجو.
  const publicRoutes = ["/", "/shop", "/products", "/lounge", "/about", "/blog"]

  app.get("/robots.txt", (request, response) => {
    response
      .type("text/plain")
      .setHeader("Cache-Control", "public, max-age=3600")
      .send(
        [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /checkout",
          "",
          `Sitemap: ${siteOrigin(request)}/sitemap.xml`,
          "",
        ].join("\n"),
      )
  })

  app.get("/sitemap.xml", (request, response) => {
    const origin = siteOrigin(request)
    const urls = publicRoutes
      .map((route) => `  <url><loc>${origin}${route}</loc></url>`)
      .join("\n")
    response
      .type("application/xml")
      .setHeader("Cache-Control", "public, max-age=3600")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )
  })

  app.use(
    express.static(staticDir, {
      index: false,
      setHeaders: (response, filePath) => {
        // فایل‌های هش‌دار assets برای همیشه کش می‌شوند؛ بقیه یک روز.
        response.setHeader(
          "Cache-Control",
          filePath.includes(`${path.sep}assets${path.sep}`)
            ? "public, max-age=31536000, immutable"
            : "public, max-age=86400",
        )
      },
    }),
  )

  // fallback تک‌صفحه‌ای: هر مسیر HTML ناشناخته به اپ React می‌رود تا روتر تصمیم بگیرد.
  app.get(/^(?!\/api\/).*/, (request, response, next) => {
    // فقط درخواست‌های ناوبری مرورگر (Accept صریح text/html) و مسیرهای بدون پسوند.
    // در غیر این صورت یک فایل جاوااسکریپت/تصویر گمشده به‌جای 404، HTML می‌گرفت.
    const wantsHtml = (request.headers.accept ?? "").includes("text/html")
    if (!wantsHtml || path.extname(request.path) !== "") {
      next()
      return
    }
    response.setHeader("Cache-Control", "no-cache")
    response.sendFile(indexFile, (error) => {
      if (error) next(error)
    })
  })
}

app.use((_request, response) => {
  response.status(404).json({ error: { code: "NOT_FOUND", message: "مسیر درخواستی پیدا نشد." } })
})

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error("API request failed:", error)
  if (response.headersSent) return
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code
    if (code === "23505") {
      response.status(409).json({ error: { code: "ALREADY_EXISTS", message: "رکوردی با این شناسه یا نشانی از قبل وجود دارد." } })
      return
    }
    if (code === "23503") {
      response.status(409).json({ error: { code: "IN_USE", message: "این رکورد به داده‌های دیگری وابسته است." } })
      return
    }
  }
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = error.status
    if (status === 413) {
      response.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: "حجم درخواست بیش از حد مجاز است." } })
      return
    }
    if (status === 400) {
      response.status(400).json({ error: { code: "INVALID_JSON", message: "بدنه درخواست JSON معتبر نیست." } })
      return
    }
  }
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "خطای داخلی سرور رخ داد." },
  })
}
app.use(errorHandler)

const onListening = () => {
  console.info(`${httpsEnabled ? "HTTPS" : "HTTP"} API listening on port ${config.API_PORT}`)
  if (serveStatic) {
    console.info(`Serving frontend build from ${staticDir}`)
  }
  if (config.FORCE_HTTPS) {
    console.info("FORCE_HTTPS فعال است؛ درخواست‌های HTTP به HTTPS هدایت می‌شوند.")
  }
  startOutboxWorker()
  void startTelegramBot().catch((error: unknown) => {
    console.error("راه‌اندازی ربات تلگرام ناموفق بود:", error)
  })
}

// اگر فایل گواهی و کلید تنظیم شده باشد، خود Express روی HTTPS بالا می‌آید
// (برای هاست‌هایی که پروکسی معکوس ندارند). در غیر این صورت HTTP معمول.
const server = httpsEnabled
  ? https
      .createServer(
        {
          cert: readFileSync(config.TLS_CERT_FILE as string),
          key: readFileSync(config.TLS_KEY_FILE as string),
        },
        app,
      )
      .listen(config.API_PORT, "0.0.0.0", onListening)
  : app.listen(config.API_PORT, "0.0.0.0", onListening)

async function shutdown(signal: string) {
  console.info(`${signal} received; shutting down API.`)
  stopOutboxWorker()
  stopTelegramBot()
  server.close(async (error) => {
    if (error) {
      console.error("Failed to close API server:", error)
      process.exitCode = 1
    }
    await pool.end()
    process.exit()
  })
}

process.once("SIGINT", () => void shutdown("SIGINT"))
process.once("SIGTERM", () => void shutdown("SIGTERM"))
