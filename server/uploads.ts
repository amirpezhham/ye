import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { config } from "./config.js"

/** پسوند فایل‌های مجاز. */
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

export const uploadDir = path.resolve(process.cwd(), config.UPLOAD_DIR ?? "uploads")

export async function ensureUploadDir(): Promise<void> {
  await mkdir(uploadDir, { recursive: true })
}

export class UploadError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = "UploadError"
    this.code = code
    this.status = status
  }
}

/**
 * یک تصویر dataURL را روی دیسک ذخیره می‌کند و آدرس عمومی آن را برمی‌گرداند.
 *
 * چرا روی دیسک؟ ذخیرهٔ base64 داخل دیتابیس باعث می‌شود هر بار دریافت فهرست
 * محصولات، همهٔ تصاویر هم دانلود شوند و فروشگاه روی موبایل عملاً باز نشود.
 */
export async function saveDataUrlImage(dataUrl: string): Promise<{ url: string; bytes: number }> {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim())

  if (!match) {
    throw new UploadError("INVALID_IMAGE_DATA", "ساختار تصویر ارسالی معتبر نیست.", 400)
  }

  const [, mimeType, base64] = match
  const extension = ALLOWED_TYPES.get(mimeType.toLowerCase())

  if (!extension) {
    throw new UploadError("UNSUPPORTED_IMAGE_TYPE", "فقط تصویر JPG، PNG یا WebP مجاز است.", 400)
  }

  const buffer = Buffer.from(base64, "base64")

  if (buffer.byteLength === 0) {
    throw new UploadError("EMPTY_IMAGE", "تصویر ارسالی خالی است.", 400)
  }

  if (buffer.byteLength > config.UPLOAD_MAX_BYTES) {
    throw new UploadError(
      "IMAGE_TOO_LARGE",
      `حجم تصویر بیش از حد مجاز (${Math.round(config.UPLOAD_MAX_BYTES / 1024)} کیلوبایت) است.`,
      413,
    )
  }

  await ensureUploadDir()

  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${extension}`
  await writeFile(path.join(uploadDir, name), buffer)

  return { url: `/uploads/${name}`, bytes: buffer.byteLength }
}
