export function readStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (typeof window === "undefined") {
    return fallback
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallback
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    return isValid(parsed) ? parsed : fallback
  } catch (error) {
    console.error(`خواندن داده ذخیره‌شده «${key}» ناموفق بود.`, error)

    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))

    return true
  } catch (error) {
    console.error(`ذخیره‌سازی «${key}» ناموفق بود.`, error)

    return false
  }
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    )
}

export function normalizeIranianPhone(value: string): string {
  const normalized = normalizeDigits(value).replace(/\s|-/g, "")

  if (normalized.startsWith("+98")) {
    return `0${normalized.slice(3)}`
  }

  return normalized
}

export function isIranianPhone(value: string): boolean {
  return /^09\d{9}$/.test(normalizeIranianPhone(value))
}

export function validateImageFile(
  file: File,
  maxSizeBytes = 2 * 1024 * 1024,
): string | null {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return "فقط تصویر JPG، PNG یا WebP مجاز است."
  }

  if (file.size > maxSizeBytes) {
    return "حجم تصویر نباید بیشتر از ۲ مگابایت باشد."
  }

  return null
}
