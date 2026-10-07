import cookieParser from "cookie-parser"
import cors from "cors"
import express, { type ErrorRequestHandler } from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"

import { config, isProduction } from "./config.js"
import { pool } from "./db.js"
import { startOutboxWorker, stopOutboxWorker } from "./outbox.js"
import { apiRouter } from "./routes.js"

const app = express()
app.disable("x-powered-by")
app.set("trust proxy", isProduction ? 1 : false)
app.use(helmet())
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

app.use((_request, response) => {
  response.status(404).json({ error: { code: "NOT_FOUND", message: "مسیر API پیدا نشد." } })
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

const server = app.listen(config.API_PORT, "0.0.0.0", () => {
  console.info(`API listening on port ${config.API_PORT}`)
  startOutboxWorker()
})

async function shutdown(signal: string) {
  console.info(`${signal} received; shutting down API.`)
  stopOutboxWorker()
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
