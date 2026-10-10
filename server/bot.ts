import { config, telegramAdminCode, useTelegramWebhook } from "./config.js"
import { pool } from "./db.js"
import {
  answerCallbackQuery,
  deleteWebhook,
  editMessageText,
  getUpdates,
  resolveBotUsername,
  sendMessage,
  setWebhook,
  type TelegramCallbackQuery,
  type TelegramMessage,
  type TelegramUpdate,
} from "./telegram.js"

export interface OrderNotificationPayload {
  id: string
  fullName: string
  phone: string
  totalItems: number
  totalPrice: number
}

const POLL_INTERVAL_MS = 3_000
const CONFIRM_PREFIX = "confirm:"
const ORDER_PAYLOAD_PREFIX = "order_"
const ADMIN_PAYLOAD_PREFIX = "admin_"

let timer: NodeJS.Timeout | undefined
let polling = false
let updateOffset = 0

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

/** شناسهٔ چت‌هایی که اعلان سفارش برایشان فرستاده می‌شود. */
export async function adminChatIds(): Promise<string[]> {
  const ids = new Set<string>()
  if (config.TELEGRAM_CHAT_ID?.trim()) ids.add(config.TELEGRAM_CHAT_ID.trim())

  try {
    const result = await pool.query("SELECT chat_id FROM telegram_chats WHERE is_admin = TRUE")
    for (const row of result.rows) ids.add(String(row.chat_id))
  } catch (error) {
    console.error("خواندن ادمین‌های تلگرام ناموفق بود:", error)
  }

  return [...ids]
}

/**
 * ارسال پیام به همهٔ ادمین‌های ثبت‌شده.
 * اگر «همهٔ» ارسال‌ها شکست بخورد خطا پرتاب می‌شود تا صف اعلان دوباره تلاش کند؛
 * شکست تک‌تک چت‌ها فقط لاگ می‌شود تا یک چت خراب بقیه را متوقف نکند.
 */
export async function notifyAdmins(text: string): Promise<void> {
  const ids = await adminChatIds()
  if (ids.length === 0) {
    throw new Error("هیچ چت ادمینی برای اعلان ثبت نشده است.")
  }

  const results = await Promise.allSettled(ids.map((id) => sendMessage(id, text)))
  const failures = results.filter((result) => result.status === "rejected")

  for (const failure of failures) {
    if (failure.status === "rejected") console.error("ارسال اعلان تلگرام ناموفق بود:", failure.reason)
  }

  if (failures.length === ids.length) {
    const first = failures[0]
    throw new Error(
      first?.status === "rejected" && first.reason instanceof Error
        ? first.reason.message
        : "ارسال اعلان تلگرام ناموفق بود.",
    )
  }
}

export async function notifyAdminsNewOrder(payload: OrderNotificationPayload): Promise<void> {
  const lines = [
    "🛒 سفارش جدید",
    "",
    `شماره سفارش: ${payload.id}`,
    `نام مشتری: ${payload.fullName}`,
    `تلفن: ${payload.phone}`,
    `تعداد کالا: ${formatNumber(payload.totalItems)} عدد`,
    `مبلغ کل: ${formatNumber(payload.totalPrice)} تومان`,
  ]
  await notifyAdmins(lines.join("\n"))
}

/** ثبت/به‌روزرسانی یک چت بر اساس شناسه (برای callback query که پیام کامل ندارد). */
async function rememberChatId(chatId: number) {
  await pool.query(
    `INSERT INTO telegram_chats (chat_id) VALUES ($1)
     ON CONFLICT (chat_id) DO UPDATE SET last_seen_at = NOW()`,
    [chatId],
  )
}

async function rememberChat(message: TelegramMessage) {
  await pool.query(
    `INSERT INTO telegram_chats (chat_id, username, first_name)
     VALUES ($1,$2,$3)
     ON CONFLICT (chat_id) DO UPDATE
     SET username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_seen_at = NOW()`,
    [message.chat.id, message.chat.username ?? null, message.chat.first_name ?? null],
  )
}

function welcomeText(chatId: number) {
  return [
    "سلام! 👋 به ربات یه دود ۲ دود خوش آمدید.",
    "",
    "این ربات برای پیگیری و تأیید سفارش‌هاست.",
    "اگر سفارش تازه‌ای ثبت کرده‌اید، از دکمهٔ «تکمیل سفارش در تلگرام» در صفحهٔ سفارش استفاده کنید.",
    "",
    `شناسهٔ چت شما: ${chatId}`,
  ].join("\n")
}

async function showOrderConfirmation(chatId: number, orderId: string) {
  const result = await pool.query(
    `SELECT id, full_name, phone, total_items, total_price, status, telegram_confirmed_at
     FROM orders WHERE id = $1 AND deleted_at IS NULL`,
    [orderId],
  )
  const order = result.rows[0]

  if (!order) {
    await sendMessage(chatId, "سفارشی با این شماره پیدا نشد. لطفاً شمارهٔ سفارش را بررسی کنید.")
    return
  }

  await pool.query("UPDATE orders SET telegram_chat_id = $2 WHERE id = $1", [orderId, chatId])

  const summary = [
    "🧾 سفارش شما",
    "",
    `شماره سفارش: ${order.id}`,
    `نام: ${order.full_name}`,
    `تلفن: ${order.phone}`,
    `تعداد کالا: ${formatNumber(Number(order.total_items))} عدد`,
    `مبلغ کل: ${formatNumber(Number(order.total_price))} تومان`,
  ].join("\n")

  if (order.telegram_confirmed_at) {
    await sendMessage(chatId, `${summary}\n\n✅ این سفارش قبلاً تأیید شده است.`)
    return
  }

  await sendMessage(chatId, `${summary}\n\nبرای نهایی‌کردن، دکمهٔ زیر را بزنید.`, {
    keyboard: [[{ text: "✅ تأیید سفارش", callback_data: `${CONFIRM_PREFIX}${orderId}` }]],
  })
}

async function handleAdminRegistration(chatId: number, code: string) {
  if (code.toUpperCase() !== telegramAdminCode()) {
    await sendMessage(chatId, "❌ کد اتصال ادمین نامعتبر است.")
    return
  }

  await pool.query("UPDATE telegram_chats SET is_admin = TRUE WHERE chat_id = $1", [chatId])
  await sendMessage(
    chatId,
    "✅ این چت به عنوان ادمین ثبت شد.\nاز این پس هر سفارش جدید همین‌جا اعلام می‌شود.",
  )
}

async function handleStart(chatId: number, payload: string, message: TelegramMessage) {
  if (payload.startsWith(ORDER_PAYLOAD_PREFIX)) {
    await showOrderConfirmation(chatId, payload.slice(ORDER_PAYLOAD_PREFIX.length))
    return
  }

  if (payload.startsWith(ADMIN_PAYLOAD_PREFIX)) {
    await handleAdminRegistration(chatId, payload.slice(ADMIN_PAYLOAD_PREFIX.length).trim())
    return
  }

  await sendMessage(chatId, welcomeText(chatId))
}

async function handleCallback(query: TelegramCallbackQuery) {
  const data = query.data ?? ""

  if (!data.startsWith(CONFIRM_PREFIX)) {
    await answerCallbackQuery(query.id)
    return
  }

  const orderId = data.slice(CONFIRM_PREFIX.length)
  const chatId = query.message?.chat.id ?? query.from.id
  await rememberChatId(chatId)

  const result = await pool.query(
    `UPDATE orders
     SET telegram_confirmed_at = COALESCE(telegram_confirmed_at, NOW()), telegram_chat_id = $2
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, full_name, total_price, total_items`,
    [orderId, chatId],
  )
  const order = result.rows[0]

  if (!order) {
    await answerCallbackQuery(query.id, "این سفارش در دسترس نیست.")
    return
  }

  // پاسخ به callback نباید بقیهٔ جریان (ویرایش پیام و اعلان ادمین) را متوقف کند.
  try {
    await answerCallbackQuery(query.id, "سفارش شما تأیید شد ✅")
  } catch (error) {
    console.error("پاسخ به callback تلگرام ناموفق بود:", error)
  }

  if (query.message) {
    try {
      await editMessageText(
        chatId,
        query.message.message_id,
        `✅ سفارش ${order.id} تأیید شد.\nبه‌زودی برای هماهنگی ارسال با شما تماس می‌گیریم.`,
      )
    } catch (error) {
      console.error("ویرایش پیام تأیید سفارش ناموفق بود:", error)
    }
  }

  try {
    await notifyAdmins(
      [
        "✅ مشتری سفارش را در تلگرام تأیید کرد",
        "",
        `شماره سفارش: ${order.id}`,
        `نام مشتری: ${order.full_name}`,
        `مبلغ کل: ${formatNumber(Number(order.total_price))} تومان`,
      ].join("\n"),
    )
  } catch (error) {
    console.error("اعلان تأیید سفارش به ادمین‌ها ناموفق بود:", error)
  }
}


/** پردازش یک آپدیت تلگرام (هم از وبهوک و هم از long-polling استفاده می‌شود). */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallback(update.callback_query)
    return
  }

  const message = update.message
  if (!message?.text) return

  // هر پیام ورودی ابتدا ثبت می‌شود تا مسیرهایی مثل «/start admin_CODE»
  // که پیام /start جداگانه‌ای نداشته‌اند هم کار کنند.
  await rememberChat(message)

  const [command = "", ...rest] = message.text.trim().split(/\s+/)
  const payload = rest.join(" ")

  if (command === "/start" || command.startsWith("/start@")) {
    await handleStart(message.chat.id, payload, message)
    return
  }

  if (command === "/id" || command.startsWith("/id@")) {
    await sendMessage(message.chat.id, `شناسهٔ چت شما: ${message.chat.id}`)
  }
}

async function pollOnce() {
  if (polling) return
  polling = true

  try {
    const updates = await getUpdates(updateOffset)
    for (const update of updates) {
      updateOffset = update.update_id + 1
      try {
        await handleTelegramUpdate(update)
      } catch (error) {
        console.error("پردازش آپدیت تلگرام ناموفق بود:", error)
      }
    }
  } finally {
    polling = false
  }
}

export async function startTelegramBot(): Promise<void> {
  if (!config.TELEGRAM_BOT_TOKEN) {
    console.info("ربات تلگرام غیرفعال است؛ TELEGRAM_BOT_TOKEN تنظیم نشده است.")
    return
  }

  try {
    const username = await resolveBotUsername()
    console.info(`ربات تلگرام فعال است: @${username ?? "?"}`)
  } catch (error) {
    console.error("ارتباط با Bot API برقرار نشد:", error)
    return
  }

  if (useTelegramWebhook) {
    try {
      await setWebhook(config.TELEGRAM_WEBHOOK_URL as string, config.TELEGRAM_WEBHOOK_SECRET as string)
      console.info(`وبهوک تلگرام تنظیم شد: ${config.TELEGRAM_WEBHOOK_URL}`)
    } catch (error) {
      console.error("تنظیم وبهوک تلگرام ناموفق بود:", error)
    }
    return
  }

  // در حالت polling نباید وبهوک فعال باشد، وگرنه getUpdates خطا می‌دهد.
  try {
    await deleteWebhook()
  } catch {
    // اگر وبهوکی وجود نداشت، این خطا مهم نیست.
  }

  timer = setInterval(() => {
    void pollOnce().catch((error: unknown) => {
      console.error("دریافت آپدیت‌های تلگرام ناموفق بود:", error)
    })
  }, POLL_INTERVAL_MS)
  timer.unref()

  void pollOnce().catch((error: unknown) => {
    console.error("دریافت آپدیت‌های تلگرام ناموفق بود:", error)
  })
}

export function stopTelegramBot(): void {
  if (timer) clearInterval(timer)
  timer = undefined
}

/** یوزرنیم ربات برای ساخت لینک در فرانت‌اند (از طریق endpoint عمومی). */
export async function publicBotUsername(): Promise<string | null> {
  if (!config.TELEGRAM_BOT_TOKEN) return null
  try {
    return await resolveBotUsername()
  } catch (error) {
    console.error("خواندن یوزرنیم ربات ناموفق بود:", error)
    return null
  }
}
