import { config } from "./config.js"

interface TelegramOrder {
  id: string
  fullName: string
  phone: string
  totalItems: number
  totalPrice: number
}

export async function sendOrderNotification(order: TelegramOrder) {
  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    throw new Error("Telegram notification is not configured.")
  }

  const lines = [
    "🛒 سفارش جدید",
    `شماره سفارش: ${order.id}`,
    `نام: ${order.fullName}`,
    `تلفن: ${order.phone}`,
    `تعداد کالا: ${order.totalItems}`,
    `مبلغ: ${new Intl.NumberFormat("fa-IR").format(order.totalPrice)} تومان`,
  ]
  const response = await fetch(
    `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: config.TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8_000),
    },
  )

  if (!response.ok) {
    throw new Error(`Telegram returned HTTP ${response.status}.`)
  }

  const result: unknown = await response.json()
  if (
    typeof result !== "object" || result === null ||
    !("ok" in result) || result.ok !== true
  ) {
    throw new Error("Telegram did not confirm the notification.")
  }
}
