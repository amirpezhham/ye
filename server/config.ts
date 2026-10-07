import "dotenv/config"
import { z } from "zod"

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  ADMIN_ORIGIN: z.string().url().default("http://localhost:4173"),
  SESSION_SECRET: z.string().min(32),
  ADMIN_SESSION_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
})

export const config = environmentSchema.parse(process.env)
export const isProduction = config.NODE_ENV === "production"
