#!/usr/bin/env node
/**
 * آماده‌سازی محیط توسعه محلی در محیط‌هایی که root / Docker ندارند.
 *
 *  ۱) اگر .env نبود، از .env.example می‌سازد و SESSION_SECRET تصادفی می‌گذارد
 *  ۲) اگر پورت ۵۴۳۲ بسته باشد، یک PostgreSQL کاربرمحور (embedded-postgres) در /tmp بالا می‌آورد
 *  ۳) مهاجرت اسکیما را اجرا می‌کند
 *  ۴) حساب ادمین اولیه را می‌سازد
 *
 * استفاده: npm run dev:bootstrap
 */
import { execFileSync, spawn } from "node:child_process"
import { randomBytes } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import net from "node:net"
import path from "node:path"

const root = process.cwd()
const pgHome = "/tmp/yedood-pg"
const dataDir = "/tmp/yedood-pgdata"
const port = 5432
const dbName = "yedood"
const dbUser = "yedood"
const dbPassword = "change-this-password"
const adminUsername = process.env.ADMIN_USERNAME ?? "admin"
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345678"

function log(message) {
  console.log(`• ${message}`)
}

function portIsOpen(targetPort) {
  return new Promise((resolve) => {
    const socket = net.connect({ port: targetPort, host: "127.0.0.1" })
    socket.setTimeout(1500)
    socket.once("connect", () => {
      socket.destroy()
      resolve(true)
    })
    socket.once("timeout", () => {
      socket.destroy()
      resolve(false)
    })
    socket.once("error", () => resolve(false))
  })
}

function ensureEnvFile() {
  const envPath = path.join(root, ".env")
  if (existsSync(envPath)) {
    log(".env از قبل موجود است")
    return
  }
  const example = readFileSync(path.join(root, ".env.example"), "utf8")
  const secret = randomBytes(24).toString("hex")
  writeFileSync(
    envPath,
    example.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`),
  )
  log(".env ساخته شد (با SESSION_SECRET تصادفی)")
}

async function ensureDatabase() {
  if (await portIsOpen(port)) {
    log(`PostgreSQL از قبل روی پورت ${port} در حال اجراست`)
    return
  }

  const pgModule = path.join(pgHome, "node_modules", "embedded-postgres")
  if (!existsSync(pgModule)) {
    log("نصب embedded-postgres (یک‌بار برای همیشه، بدون نیاز به root)")
    mkdirSync(pgHome, { recursive: true })
    writeFileSync(path.join(pgHome, "package.json"), JSON.stringify({ name: "pg", private: true }))
    execFileSync("npm", ["install", "embedded-postgres", "--silent"], { cwd: pgHome, stdio: "inherit" })
  }

  const script = path.join(pgHome, "start.mjs")
  writeFileSync(
    script,
    `import EmbeddedPostgres from 'embedded-postgres'
const pg = new EmbeddedPostgres({
  databaseDir: ${JSON.stringify(dataDir)},
  user: ${JSON.stringify(dbUser)},
  password: ${JSON.stringify(dbPassword)},
  port: ${port},
  persistent: true,
})
try { await pg.initialise() } catch {}
await pg.start()
try { await pg.createDatabase(${JSON.stringify(dbName)}) } catch {}
console.log('POSTGRES_READY')
setInterval(() => {}, 1 << 30)
`,
  )

  log("بالا آوردن PostgreSQL کاربرمحور...")
  const child = spawn("node", [script], { detached: true, stdio: ["ignore", "ignore", "ignore"] })
  child.unref()

  for (let attempt = 0; attempt < 40; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (await portIsOpen(port)) {
      log("PostgreSQL آماده است")
      return
    }
  }
  throw new Error("PostgreSQL در زمان مورد انتظار بالا نیامد")
}

function runNpm(args, extraEnv = {}) {
  execFileSync("npm", args, { cwd: root, stdio: "inherit", env: { ...process.env, ...extraEnv } })
}

ensureEnvFile()
await ensureDatabase()

log("اجرای مهاجرت اسکیما")
runNpm(["run", "db:migrate"])

log("درج داده‌های نمونه (اگر خالی باشد)")
runNpm(["run", "db:seed"])

log(`ساخت/به‌روزرسانی حساب ادمین «${adminUsername}»`)
runNpm(["run", "db:create-admin"], { ADMIN_USERNAME: adminUsername, ADMIN_PASSWORD: adminPassword })

console.log(`
✅ محیط آماده است.

اجرای پروژه:  npm run dev:all
ورود پنل:      ${adminUsername} / ${adminPassword}
پنل ادمین:     http://localhost:4173/admin/login

توجه: پستگرس در ${dataDir} است و با ری‌استارت سندباکس از بین می‌رود؛
در آن صورت فقط همین دستور را دوباره اجرا کنید.
`)
