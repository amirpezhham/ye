import { apiPost } from "@/lib/api"
import { compressImageFile } from "@/lib/image"

export interface UploadResult {
  url: string
  bytes: number
}

/**
 * تصویر را در مرورگر فشرده می‌کند، روی سرور آپلود می‌کند و آدرس آن را برمی‌گرداند.
 *
 * نکته: نتیجهٔ این تابع یک آدرس کوتاه مثل `/uploads/abc.jpg` است، نه dataURL.
 * ذخیرهٔ dataURL در دیتابیس باعث می‌شد هر بار دریافت فهرست محصولات، همهٔ
 * تصاویر هم دانلود شوند.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const compressed = await compressImageFile(file)
  return apiPost<UploadResult>("/admin/uploads", { dataUrl: compressed.dataUrl })
}

/** حجم فایل را به شکل خوانا برای نمایش در فرم‌ها. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} کیلوبایت`
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`
}
