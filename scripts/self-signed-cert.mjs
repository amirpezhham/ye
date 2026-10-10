#!/usr/bin/env node
/**
 * ساخت گواهی self-signed برای تست HTTPS روی localhost.
 *
 * چرا لازم است؟ در NODE_ENV=production کوکی نشست با پرچم Secure صادر می‌شود،
 * پس روی HTTP ساده مرورگر آن را ذخیره نمی‌کند و ورود پنل ادمین بی‌صدا شکست می‌خورد.
 * با این گواهی می‌توان همان مسیر واقعی production را روی سیستم خودی تست کرد.
 *
 * استفاده: npm run tls:self-signed
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"

const certDir = path.resolve(process.cwd(), ".certs")
const certFile = path.join(certDir, "cert.pem")
const keyFile = path.join(certDir, "key.pem")

if (existsSync(certFile) && existsSync(keyFile)) {
  console.log(`گواهی از قبل موجود است: ${certDir}`)
} else {
  mkdirSync(certDir, { recursive: true })
  try {
    execFileSync(
      "openssl",
      [
        "req", "-x509", "-newkey", "rsa:2048", "-nodes",
        "-keyout", keyFile,
        "-out", certFile,
        "-days", "30",
        "-subj", "/CN=localhost",
        "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    )
  } catch (error) {
    console.error("ساخت گواهی ناموفق بود. آیا openssl نصب است؟")
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
  console.log(`گواهی ساخته شد: ${certDir}`)
}

console.log(`
برای اجرای HTTPS محلی:

  NODE_ENV=production FORCE_HTTPS=true SERVE_STATIC=true \\
  TLS_CERT_FILE=.certs/cert.pem TLS_KEY_FILE=.certs/key.pem \\
  API_PORT=4443 ADMIN_ORIGIN=https://localhost:4443 npm start

سپس این آدرس را باز کنید:  https://localhost:4443/admin/login

مرورگر گواهی self-signed را ناشناس می‌داند؛ یک‌بار از
«Advanced → Proceed to localhost» عبور کنید.
`)
