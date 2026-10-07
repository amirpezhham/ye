import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import pg from "pg"

import { config } from "./config.js"

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
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
