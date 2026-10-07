import { closeDatabase, migrate } from "./db.js"

try {
  await migrate()
  console.info("Database schema is up to date.")
} finally {
  await closeDatabase()
}
