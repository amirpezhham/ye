import bcrypt from "bcryptjs"

import { closeDatabase, pool } from "./db.js"

const username = process.env.ADMIN_USERNAME?.trim()
const password = process.env.ADMIN_PASSWORD

if (!username || !password || password.length < 12) {
  throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters.")
}

try {
  const hash = await bcrypt.hash(password, 12)
  await pool.query(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         session_version = admin_users.session_version + 1`,
    [username, hash],
  )
  console.info(`Admin account "${username}" created or updated.`)
} finally {
  await closeDatabase()
}
