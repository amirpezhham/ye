/**
 * فشرده‌سازی تصویر در مرورگر پیش از آپلود.
 *
 * چرا؟ عکس‌های دوربین موبایل چند مگابایت هستند. اگر همان‌طور آپلود شوند،
 * هم آپلود کند می‌شود و هم صفحهٔ فروشگاه سنگین. اینجا تصویر تا سقف
 * MAX_DIMENSION کوچک و دوباره کدگذاری می‌شود.
 */

const MAX_DIMENSION = 1400
const JPEG_QUALITY = 0.82
/** اگر PNG بزرگ‌تر از این شد، به JPEG روی پس‌زمینهٔ سفید تبدیل می‌شود. */
const PNG_KEEP_LIMIT_BYTES = 600 * 1024

export interface CompressedImage {
  dataUrl: string
  width: number
  height: number
  bytes: number
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("خواندن تصویر ناموفق بود."))
    }
    image.src = objectUrl
  })
}

/** حجم تقریبی یک dataURL بر حسب بایت. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1)
  return Math.round((base64.length * 3) / 4)
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  const image = await loadImageElement(file)

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("پردازش تصویر در این مرورگر پشتیبانی نمی‌شود.")
  }

  context.imageSmoothingQuality = "high"
  context.drawImage(image, 0, 0, width, height)

  // PNG اول به‌صورت PNG نگه داشته می‌شود تا شفافیت از بین نرود.
  if (file.type === "image/png") {
    const png = canvas.toDataURL("image/png")
    if (dataUrlBytes(png) <= PNG_KEEP_LIMIT_BYTES) {
      return { dataUrl: png, width, height, bytes: dataUrlBytes(png) }
    }
  }

  // بقیه به JPEG تبدیل می‌شوند؛ پس‌زمینهٔ سفید تا شفافیت به سیاهی تبدیل نشود.
  const flattened = document.createElement("canvas")
  flattened.width = width
  flattened.height = height
  const flatContext = flattened.getContext("2d")
  if (!flatContext) {
    throw new Error("پردازش تصویر در این مرورگر پشتیبانی نمی‌شود.")
  }
  flatContext.fillStyle = "#ffffff"
  flatContext.fillRect(0, 0, width, height)
  flatContext.imageSmoothingQuality = "high"
  flatContext.drawImage(image, 0, 0, width, height)

  const jpeg = flattened.toDataURL("image/jpeg", JPEG_QUALITY)
  return { dataUrl: jpeg, width, height, bytes: dataUrlBytes(jpeg) }
}
