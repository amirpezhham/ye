import { config } from "./config.js"

const API_BASE = "https://api.telegram.org"
const REQUEST_TIMEOUT_MS = 15_000

export interface TelegramChat {
  id: number
  type: string
  username?: string
  first_name?: string
}

export interface TelegramMessage {
  message_id: number
  chat: TelegramChat
  from?: { id: number; first_name?: string; username?: string }
  text?: string
}

export interface TelegramCallbackQuery {
  id: string
  from: { id: number; first_name?: string; username?: string }
  data?: string
  message?: TelegramMessage
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface InlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
}

/**
 * فراخوانی هر متد Bot API.
 * در صورت خطا، توضیح تلگرام داخل پیام خطا می‌آید تا در لاگ و صف اعلان مفید باشد.
 */
export async function callTelegram<T = unknown>(
  method: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  if (!config.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.")
  }

  const response = await fetch(`${API_BASE}/bot${config.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const body: unknown = await response.json().catch(() => null)

  if (typeof body !== "object" || body === null || !("ok" in body) || body.ok !== true) {
    const description =
      typeof body === "object" && body !== null && "description" in body && typeof body.description === "string"
        ? body.description
        : `HTTP ${response.status}`
    throw new Error(`Telegram ${method} failed: ${description}`)
  }

  return (body as unknown as { result: T }).result
}

export function sendMessage(
  chatId: number | string,
  text: string,
  options: { keyboard?: InlineKeyboardButton[][] } = {},
) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...(options.keyboard ? { reply_markup: { inline_keyboard: options.keyboard } } : {}),
  })
}

export function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  })
}

export function editMessageText(chatId: number | string, messageId: number, text: string) {
  return callTelegram("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    disable_web_page_preview: true,
  })
}

let cachedUsername: string | null = null

/** یوزرنیم ربات (بدون @) برای ساخت لینک deep-link در فرانت‌اند. */
export async function resolveBotUsername(): Promise<string | null> {
  if (config.TELEGRAM_BOT_USERNAME) return config.TELEGRAM_BOT_USERNAME.replace(/^@/, "")
  if (cachedUsername) return cachedUsername
  if (!config.TELEGRAM_BOT_TOKEN) return null

  const me = await callTelegram<{ username?: string }>("getMe")
  cachedUsername = me.username ?? null
  return cachedUsername
}

export function setWebhook(url: string, secretToken: string) {
  return callTelegram("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
  })
}

export function deleteWebhook() {
  return callTelegram("deleteWebhook", { drop_pending_updates: false })
}

export interface BotCommand {
  command: string
  description: string
}

/** ثبت منوی دستورات؛ تلگرام آن را به‌صورت دکمهٔ «☰» کنار فیلد پیام نشان می‌دهد. */
export function setMyCommands(commands: BotCommand[]) {
  return callTelegram("setMyCommands", { commands })
}

export function getUpdates(offset: number) {
  return callTelegram<TelegramUpdate[]>("getUpdates", {
    offset,
    timeout: 0,
    allowed_updates: ["message", "callback_query"],
  })
}
