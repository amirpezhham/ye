#!/usr/bin/env node
/**
 * اجرای هم‌زمان API و فرانت‌اند در محیط توسعه.
 *
 * چرا لازم است؟ `npm run dev` فقط Vite را بالا می‌آورد، در حالی که درخواست‌های
 * `/api/*` توسط پروکسی Vite به پورت ۴۰۰۰ فرستاده می‌شوند. اگر API بالا نباشد،
 * همهٔ فراخوانی‌های API با خطای 502 Bad Gateway برمی‌گردند.
 *
 * استفاده: npm run dev:all
 */
import { spawn } from "node:child_process"

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"

const RESET = "\u001b[0m"
const targets = [
  { name: "api", color: "\u001b[36m", args: ["run", "api:dev"] },
  { name: "web", color: "\u001b[35m", args: ["run", "dev"] },
]

const children = new Set()
let shuttingDown = false

function pipeWithPrefix(child, name, color, stream) {
  let buffer = ""
  child[stream].setEncoding("utf8")
  child[stream].on("data", (chunk) => {
    buffer += chunk
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (line.trim() !== "") {
        process[stream].write(`${color}[${name}]${RESET} ${line}\n`)
      }
    }
  })
}

function shutdown(code) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM")
  }

  setTimeout(() => process.exit(code), 300).unref()
}

for (const target of targets) {
  const child = spawn(npmCommand, target.args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  })

  children.add(child)
  pipeWithPrefix(child, target.name, target.color, "stdout")
  pipeWithPrefix(child, target.name, target.color, "stderr")

  child.on("error", (error) => {
    console.error(`اجرای ${target.name} ناموفق بود:`, error.message)
    shutdown(1)
  })

  child.on("exit", (code, signal) => {
    children.delete(child)
    if (shuttingDown) return
    const reason = signal ? `سیگنال ${signal}` : `کد ${code ?? 0}`
    console.error(`\n${target.name} متوقف شد (${reason}). بستن بقیهٔ سرویس‌ها...`)
    shutdown(code ?? 1)
  })
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

console.log("API و فرانت‌اند در حال اجرا هستند. برای خروج Ctrl+C را بزنید.\n")
