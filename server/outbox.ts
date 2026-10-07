import { pool } from "./db.js"
import { config } from "./config.js"
import { sendOrderNotification } from "./telegram.js"

let timer: NodeJS.Timeout | undefined
let running = false

async function deliverPendingNotification() {
  if (running || !config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) return
  running = true

  try {
    const client = await pool.connect()
    let message: { id: number; order_id: string; attempts: number; payload: Parameters<typeof sendOrderNotification>[0] } | undefined
    try {
      await client.query("BEGIN")
      const result = await client.query(
        `SELECT id, order_id, attempts, payload FROM notification_outbox
         WHERE sent_at IS NULL AND available_at <= NOW()
         ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1`,
      )
      if (result.rows[0]) {
        const row = result.rows[0]
        message = { id: row.id, order_id: row.order_id, attempts: Number(row.attempts) + 1, payload: row.payload }
        await client.query(
          `UPDATE notification_outbox
           SET attempts = attempts + 1, available_at = NOW() + INTERVAL '1 minute'
           WHERE id = $1`,
          [message.id],
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    if (!message) return
    try {
      await sendOrderNotification(message.payload)
      await pool.query(
        "UPDATE notification_outbox SET sent_at=NOW(), last_error=NULL WHERE id=$1",
        [message.id],
      )
    } catch (error) {
      const retrySeconds = Math.min(3600, 30 * 2 ** Math.min(6, message.attempts - 1))
      console.error(`Telegram notification for ${message.order_id} failed:`, error)
      await pool.query(
        `UPDATE notification_outbox
         SET available_at=NOW() + ($2 * INTERVAL '1 second'), last_error=$3
         WHERE id=$1`,
        [
          message.id,
          retrySeconds,
          error instanceof Error ? error.message.slice(0, 500) : "Unknown notification error",
        ],
      )
    }
  } finally {
    running = false
  }
}

export function startOutboxWorker() {
  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    console.info("Telegram notifications are disabled; configure both Telegram environment variables to enable them.")
    return
  }
  timer = setInterval(() => {
    void deliverPendingNotification().catch((error: unknown) => {
      console.error("Notification outbox poll failed:", error)
    })
  }, 10_000)
  timer.unref()
  void deliverPendingNotification().catch((error: unknown) => {
    console.error("Notification outbox poll failed:", error)
  })
}

export function stopOutboxWorker() {
  if (timer) clearInterval(timer)
}
