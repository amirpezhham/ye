import { apiGet } from "@/lib/api"

export interface TelegramSettings {
  enabled: boolean
  botUsername: string | null
}

/** تنظیمات عمومی ربات تلگرام (برای ساخت دکمهٔ «تکمیل سفارش در تلگرام»). */
export function getTelegramSettings(): Promise<TelegramSettings> {
  return apiGet<TelegramSettings>("/settings/telegram")
}

/**
 * ساخت لینک deep-link به ربات برای یک سفارش مشخص.
 * ربات با دریافت `/start order_<شناسه>` خلاصهٔ سفارش را نشان می‌دهد و
 * دکمهٔ تأیید نهایی را می‌فرستد.
 */
export function buildOrderTelegramLink(botUsername: string, orderId: string) {
  return `https://t.me/${botUsername}?start=order_${encodeURIComponent(orderId)}`
}
