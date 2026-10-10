import { randomUUID, timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"
import { Router, type Response } from "express"
import type { Pool, PoolClient } from "pg"
import rateLimit from "express-rate-limit"
import { z } from "zod"

import { handleTelegramUpdate, publicBotUsername } from "./bot.js"
import { config, telegramAdminCode, useTelegramWebhook } from "./config.js"
import { pool } from "./db.js"
import {
  type AuthenticatedRequest,
  clearSessionCookie,
  createSession,
  requireAdmin,
  setSessionCookie,
} from "./session.js"
import {
  categorySchema,
  jsonObjectSchema,
  loginSchema,
  localDataMigrationSchema,
  orderRequestSchema,
  orderStatusSchema,
  passwordChangeSchema,
  postSchema,
  productSchema,
} from "./validation.js"

export const apiRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: { code: "LOGIN_RATE_LIMIT", message: "تعداد تلاش‌ها زیاد است؛ کمی بعد دوباره تلاش کنید." } },
})

const orderStatusValues = ["new", "reviewing", "ready", "shipped", "delivered", "cancelled"] as const
const idSchema = z.string().min(1).max(120)

function sendValidationError(response: Response, error: z.ZodError) {
  response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "اطلاعات واردشده معتبر نیست.",
      details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    },
  })
}

function parsed<T>(schema: z.ZodType<T>, input: unknown, response: Response): T | null {
  const result = schema.safeParse(input)
  if (!result.success) {
    sendValidationError(response, result.error)
    return null
  }
  return result.data
}

function mapOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    address: row.address,
    note: row.note ?? undefined,
    totalItems: row.total_items,
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: new Date(String(row.created_at)).getTime(),
    items: row.items ?? [],
  }
}

/**
 * نگاشت مخصوص پنل ادمین.
 * اطلاعات تلگرام (شناسهٔ چت و زمان تأیید) فقط در پاسخ‌های ادمین برمی‌گردد و
 * هرگز در پاسخ عمومی «ثبت سفارش» قرار نمی‌گیرد.
 */
function mapAdminOrder(row: Record<string, unknown>) {
  return {
    ...mapOrder(row),
    telegramChatId:
      row.telegram_chat_id === null || row.telegram_chat_id === undefined
        ? undefined
        : String(row.telegram_chat_id),
    telegramConfirmedAt: row.telegram_confirmed_at
      ? new Date(String(row.telegram_confirmed_at)).getTime()
      : undefined,
  }
}

async function fetchOrder(client: Pool | PoolClient, orderId: string, forAdmin = false) {
  const result = await client.query(
    `SELECT o.*,
       COALESCE(jsonb_agg(oi.data ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::jsonb) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1 AND o.deleted_at IS NULL
     GROUP BY o.id`,
    [orderId],
  )
  if (!result.rows[0]) return null
  return forAdmin ? mapAdminOrder(result.rows[0]) : mapOrder(result.rows[0])
}

async function withTransaction<T>(operation: (client: import("pg").PoolClient) => Promise<T>) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await operation(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

apiRouter.get("/health", async (_request, response) => {
  await pool.query("SELECT 1")
  response.json({ status: "ok" })
})

apiRouter.post("/admin/login", loginLimiter, async (request, response) => {
  const input = parsed(loginSchema, request.body, response)
  if (!input) return

  const result = await pool.query(
    "SELECT id, username, password_hash, session_version FROM admin_users WHERE username = $1",
    [input.username],
  )
  const admin = result.rows[0]
  const valid = admin ? await bcrypt.compare(input.password, admin.password_hash) : false
  if (!valid) {
    response.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "نام کاربری یا رمز عبور اشتباه است." } })
    return
  }

  setSessionCookie(response, createSession(admin.id, admin.username, admin.session_version))
  response.json({ username: admin.username })
})

apiRouter.post("/admin/logout", (_request, response) => {
  clearSessionCookie(response)
  response.status(204).end()
})

apiRouter.get("/admin/session", requireAdmin, (request: AuthenticatedRequest, response) => {
  response.json({ username: request.admin?.username })
})

apiRouter.post("/admin/migrate-local-data", requireAdmin, async (request, response) => {
  const input = parsed(localDataMigrationSchema, request.body, response)
  if (!input) return

  try {
    const summary = await withTransaction(async (client) => {
    const existing = await client.query(
      "SELECT migration_key FROM data_migrations WHERE migration_key='browser-localstorage-v1' FOR UPDATE",
    )
    if (existing.rowCount) {
      const error = new Error("MIGRATION_ALREADY_COMPLETED")
      error.name = "MIGRATION_ALREADY_COMPLETED"
      throw error
    }

    let categories = 0
    let products = 0
    let posts = 0
    let orders = 0
    for (const category of input.categories) {
      const result = await client.query(
        `INSERT INTO categories (id,slug,data) VALUES ($1,$2,$3::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [category.id, category.slug, JSON.stringify(category)],
      )
      categories += result.rowCount ?? 0
    }
    for (const product of input.products) {
      const result = await client.query(
        `INSERT INTO products (id,slug,category_slug,price,stock,status,data)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT (id) DO NOTHING`,
        [product.id, product.slug, product.categorySlug, product.price, product.stock ?? null, product.status, JSON.stringify(product)],
      )
      products += result.rowCount ?? 0
    }
    for (const post of input.posts) {
      const result = await client.query(
        `INSERT INTO posts (id,slug,data,created_at) VALUES ($1,$2,$3::jsonb,$4)
         ON CONFLICT (id) DO NOTHING`,
        [post.id, post.slug, JSON.stringify(post), new Date(post.createdAt)],
      )
      posts += result.rowCount ?? 0
    }
    for (const order of input.orders) {
      const inserted = await client.query(
        `INSERT INTO orders (id,full_name,phone,address,note,total_items,total_price,status,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING RETURNING id`,
        [order.id, order.fullName, order.phone, order.address, order.note ?? null, order.totalItems, order.totalPrice, order.status, new Date(order.createdAt)],
      )
      if (!inserted.rowCount) continue
      orders += 1
      for (const item of order.items) {
        const product = await client.query("SELECT id FROM products WHERE id=$1", [item.id])
        const snapshot = { ...item, productId: item.id }
        await client.query(
          `INSERT INTO order_items (order_id,product_id,quantity,unit_price,data)
           VALUES ($1,$2,$3,$4,$5::jsonb)`,
          [order.id, product.rows[0]?.id ?? null, item.quantity, item.price, JSON.stringify(snapshot)],
        )
      }
    }
    for (const [key, value] of [["seo", input.seo], ["about", input.about]] as const) {
      await client.query(
        `INSERT INTO site_settings (setting_key,value) VALUES ($1,$2::jsonb)
         ON CONFLICT (setting_key) DO NOTHING`,
        [key, JSON.stringify(value)],
      )
    }
    const result = { products, categories, posts, orders }
    const marker = await client.query(
      `INSERT INTO data_migrations (migration_key,summary)
       VALUES ('browser-localstorage-v1',$1::jsonb) ON CONFLICT (migration_key) DO NOTHING`,
      [JSON.stringify(result)],
    )
    if (!marker.rowCount) {
      const error = new Error("MIGRATION_ALREADY_COMPLETED")
      error.name = "MIGRATION_ALREADY_COMPLETED"
      throw error
    }
    return result
    })

    response.status(201).json({ imported: summary })
  } catch (error) {
    if (error instanceof Error && error.name === "MIGRATION_ALREADY_COMPLETED") {
      response.status(409).json({ error: { code: error.name, message: "انتقال این مرورگر قبلاً انجام شده است." } })
      return
    }
    throw error
  }
})

apiRouter.patch("/admin/password", requireAdmin, async (request: AuthenticatedRequest, response) => {
  const input = parsed(passwordChangeSchema, request.body, response)
  if (!input || !request.admin) return

  const result = await pool.query(
    "SELECT password_hash FROM admin_users WHERE id = $1",
    [request.admin.adminId],
  )
  const admin = result.rows[0]
  if (!admin || !(await bcrypt.compare(input.currentPassword, admin.password_hash))) {
    response.status(400).json({ error: { code: "CURRENT_PASSWORD_INVALID", message: "رمز عبور فعلی اشتباه است." } })
    return
  }
  const passwordHash = await bcrypt.hash(input.newPassword, 12)
  await pool.query(
    "UPDATE admin_users SET password_hash = $1, session_version = session_version + 1 WHERE id = $2",
    [passwordHash, request.admin.adminId],
  )
  clearSessionCookie(response)
  response.status(204).end()
})

apiRouter.get("/products", async (request, response) => {
  const category = typeof request.query.category === "string" ? request.query.category : null
  const search = typeof request.query.search === "string" ? request.query.search.trim() : ""
  const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 100))
  const offset = Math.max(0, Number(request.query.offset) || 0)
  const result = await pool.query(
    `SELECT data FROM products
     WHERE ($1::text IS NULL OR category_slug = $1)
       AND ($2::text = '' OR data->>'name' ILIKE '%' || $2 || '%' OR data->>'brand' ILIKE '%' || $2 || '%')
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [category, search, limit, offset],
  )
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products
     WHERE ($1::text IS NULL OR category_slug = $1)
       AND ($2::text = '' OR data->>'name' ILIKE '%' || $2 || '%' OR data->>'brand' ILIKE '%' || $2 || '%')`,
    [category, search],
  )
  response.json({ items: result.rows.map((row) => row.data), total: countResult.rows[0].total })
})

apiRouter.get("/products/:slug", async (request, response) => {
  const result = await pool.query(
    "SELECT data FROM products WHERE slug = $1",
    [request.params.slug],
  )
  if (!result.rows[0]) {
    response.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "محصول پیدا نشد." } })
    return
  }
  response.json(result.rows[0].data)
})

apiRouter.get("/categories", async (_request, response) => {
  const result = await pool.query("SELECT data FROM categories ORDER BY created_at")
  response.json(result.rows.map((row) => row.data))
})

apiRouter.get("/posts", async (_request, response) => {
  const result = await pool.query("SELECT data FROM posts ORDER BY created_at DESC")
  response.json(result.rows.map((row) => row.data))
})

apiRouter.get("/posts/:slug", async (request, response) => {
  const result = await pool.query("SELECT data FROM posts WHERE slug = $1", [request.params.slug])
  if (!result.rows[0]) {
    response.status(404).json({ error: { code: "POST_NOT_FOUND", message: "مطلب پیدا نشد." } })
    return
  }
  response.json(result.rows[0].data)
})

/**
 * وبهوک تلگرام. اگر TELEGRAM_WEBHOOK_URL تنظیم شده باشد، تلگرام آپدیت‌ها را
 * به این مسیر می‌فرستد (به‌جای long-polling).
 */
apiRouter.post("/telegram/webhook", async (request, response) => {
  if (!useTelegramWebhook || !config.TELEGRAM_WEBHOOK_SECRET) {
    response.status(404).json({ error: { code: "NOT_FOUND", message: "وبهوک فعال نیست." } })
    return
  }

  const provided = Buffer.from(request.get("x-telegram-bot-api-secret-token") ?? "")
  const expected = Buffer.from(config.TELEGRAM_WEBHOOK_SECRET)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    response.status(401).json({ error: { code: "UNAUTHORIZED", message: "درخواست نامعتبر است." } })
    return
  }

  // تلگرام منتظر پاسخ سریع است؛ پردازش خطا نباید باعث تکرار بی‌پایان شود.
  try {
    await handleTelegramUpdate(request.body)
  } catch (error) {
    console.error("پردازش آپدیت وبهوک تلگرام ناموفق بود:", error)
  }
  response.status(200).json({ ok: true })
})

/** اطلاعات عمومی ربات برای ساخت دکمهٔ «تکمیل سفارش در تلگرام» در فروشگاه. */
apiRouter.get("/settings/telegram", async (_request, response) => {
  const botUsername = await publicBotUsername()
  response.json({ enabled: Boolean(botUsername), botUsername })
})

apiRouter.get("/settings/:key", async (request, response) => {
  if (request.params.key !== "seo" && request.params.key !== "about") {
    response.status(404).json({ error: { code: "SETTING_NOT_FOUND", message: "تنظیمات پیدا نشد." } })
    return
  }
  const result = await pool.query("SELECT value FROM site_settings WHERE setting_key = $1", [request.params.key])
  if (!result.rows[0]) {
    response.status(404).json({ error: { code: "SETTING_NOT_FOUND", message: "تنظیمات پیدا نشد." } })
    return
  }
  response.json(result.rows[0].value)
})

apiRouter.post("/orders", async (request, response) => {
  const input = parsed(orderRequestSchema, request.body, response)
  if (!input) return
  const quantities = new Map<string, number>()
  for (const item of input.items) {
    const totalQuantity = (quantities.get(item.productId) ?? 0) + item.quantity
    if (totalQuantity > 99) {
      response.status(400).json({ error: { code: "INVALID_QUANTITY", message: "تعداد هر محصول در سفارش حداکثر ۹۹ عدد است." } })
      return
    }
    quantities.set(item.productId, totalQuantity)
  }
  const idempotencyKey = request.get("Idempotency-Key")?.trim()
  if (idempotencyKey && (idempotencyKey.length > 200 || idempotencyKey.length < 8)) {
    response.status(400).json({ error: { code: "INVALID_IDEMPOTENCY_KEY", message: "شناسه درخواست معتبر نیست." } })
    return
  }

  try {
    const order = await withTransaction(async (client) => {
      if (idempotencyKey) {
        const existing = await client.query("SELECT id FROM orders WHERE idempotency_key = $1", [idempotencyKey])
        if (existing.rows[0]) return await fetchOrder(client, existing.rows[0].id)
      }

      const ids = [...quantities.keys()]
      const productsResult = await client.query(
        "SELECT id, price, stock, status, data FROM products WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE",
        [ids],
      )
      if (productsResult.rowCount !== ids.length) {
        const error = new Error("PRODUCT_NOT_FOUND")
        error.name = "PRODUCT_NOT_FOUND"
        throw error
      }

      const rowsById = new Map<string, Record<string, unknown>>(
        productsResult.rows.map((row) => [row.id, row]),
      )
      let subtotal = 0
      let totalItems = 0
      const itemSnapshots: Array<{ productId: string; quantity: number; unitPrice: number; data: Record<string, unknown> }> = []

      for (const [productId, quantity] of quantities) {
        const productRow = rowsById.get(productId)!
        if (
          productRow.status === "out-of-stock" ||
          (productRow.stock !== null && Number(productRow.stock) < quantity)
        ) {
          const error = new Error("INSUFFICIENT_STOCK")
          error.name = "INSUFFICIENT_STOCK"
          throw error
        }
        const price = Number(productRow.price)
        if (!Number.isSafeInteger(price) || price < 0 || price * quantity > Number.MAX_SAFE_INTEGER) {
          const error = new Error("INVALID_PRICE")
          error.name = "INVALID_PRICE"
          throw error
        }
        const data = { ...(productRow.data as Record<string, unknown>), quantity }
        subtotal += price * quantity
        totalItems += quantity
        itemSnapshots.push({ productId, quantity, unitPrice: price, data })
      }

      const shippingFee = subtotal > 0 && subtotal < 2_000_000 ? 30_000 : 0
      const totalPrice = subtotal + shippingFee
      if (!Number.isSafeInteger(totalPrice)) {
        const error = new Error("INVALID_PRICE")
        error.name = "INVALID_PRICE"
        throw error
      }
      const id = `ORD-${randomUUID()}`
      await client.query(
        `INSERT INTO orders (id, full_name, phone, address, note, total_items, total_price, idempotency_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, input.fullName, input.phone, input.address, input.note ?? null, totalItems, totalPrice, idempotencyKey ?? null],
      )
      for (const item of itemSnapshots) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, data)
           VALUES ($1,$2,$3,$4,$5::jsonb)`,
          [id, item.productId, item.quantity, item.unitPrice, JSON.stringify(item.data)],
        )
        const row = rowsById.get(item.productId)!
        if (row.stock !== null) {
          const remaining = Number(row.stock) - item.quantity
          const status = remaining === 0 ? "out-of-stock" : remaining <= 5 ? "low-stock" : "in-stock"
          const updatedData = { ...(row.data as Record<string, unknown>), stock: remaining, status }
          await client.query(
            "UPDATE products SET stock = $1, status = $2, data = $3::jsonb, updated_at = NOW() WHERE id = $4",
            [remaining, status, JSON.stringify(updatedData), item.productId],
          )
        }
      }
      const snapshot = await fetchOrder(client, id)
      await client.query(
        "INSERT INTO notification_outbox (order_id, payload) VALUES ($1, $2::jsonb)",
        [id, JSON.stringify({
          id,
          fullName: input.fullName,
          phone: input.phone,
          totalItems,
          totalPrice,
        })],
      )
      return snapshot
    })

    response.status(201).json(order)
  } catch (error) {
    if (error instanceof Error && error.name === "PRODUCT_NOT_FOUND") {
      response.status(400).json({ error: { code: error.name, message: "یکی از محصولات دیگر در دسترس نیست." } })
      return
    }
    if (error instanceof Error && error.name === "INSUFFICIENT_STOCK") {
      response.status(409).json({ error: { code: error.name, message: "موجودی یکی از محصولات برای تعداد درخواستی کافی نیست." } })
      return
    }
    if (error instanceof Error && error.name === "INVALID_PRICE") {
      response.status(409).json({ error: { code: error.name, message: "مبلغ سفارش بیش از حد مجاز است." } })
      return
    }
    throw error
  }
})

apiRouter.use("/admin", requireAdmin)

apiRouter.get("/admin/products", async (_request, response) => {
  const result = await pool.query("SELECT data FROM products ORDER BY created_at DESC")
  response.json(result.rows.map((row) => row.data))
})

apiRouter.post("/admin/products", async (request, response) => {
  const product = parsed(productSchema, request.body, response)
  if (!product) return
  await pool.query(
    `INSERT INTO products (id, slug, category_slug, price, stock, status, data)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [product.id, product.slug, product.categorySlug, product.price, product.stock ?? null, product.status, JSON.stringify(product)],
  )
  response.status(201).json(product)
})

apiRouter.put("/admin/products/:id", async (request, response) => {
  const product = parsed(productSchema, request.body, response)
  const id = parsed(idSchema, request.params.id, response)
  if (!product || !id) return
  if (product.id !== id) {
    response.status(400).json({ error: { code: "ID_MISMATCH", message: "شناسه محصول با مسیر یکسان نیست." } })
    return
  }
  const result = await pool.query(
    `UPDATE products SET slug=$1, category_slug=$2, price=$3, stock=$4, status=$5,
       data=$6::jsonb, updated_at=NOW() WHERE id=$7`,
    [product.slug, product.categorySlug, product.price, product.stock ?? null, product.status, JSON.stringify(product), id],
  )
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "محصول پیدا نشد." } })
    return
  }
  response.json(product)
})

apiRouter.delete("/admin/products/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  if (!id) return
  const result = await pool.query("DELETE FROM products WHERE id=$1", [id])
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "محصول پیدا نشد." } })
    return
  }
  response.status(204).end()
})

apiRouter.get("/admin/categories", async (_request, response) => {
  const result = await pool.query("SELECT data FROM categories ORDER BY created_at")
  response.json(result.rows.map((row) => row.data))
})

apiRouter.post("/admin/categories", async (request, response) => {
  const category = parsed(categorySchema, request.body, response)
  if (!category) return
  await pool.query(
    "INSERT INTO categories (id, slug, data) VALUES ($1,$2,$3::jsonb)",
    [category.id, category.slug, JSON.stringify(category)],
  )
  response.status(201).json(category)
})

apiRouter.put("/admin/categories/:id", async (request, response) => {
  const category = parsed(categorySchema, request.body, response)
  const id = parsed(idSchema, request.params.id, response)
  if (!category || !id) return
  if (category.id !== id) {
    response.status(400).json({ error: { code: "ID_MISMATCH", message: "شناسه دسته‌بندی با مسیر یکسان نیست." } })
    return
  }
  const result = await pool.query(
    "UPDATE categories SET slug=$1, data=$2::jsonb, updated_at=NOW() WHERE id=$3",
    [category.slug, JSON.stringify(category), id],
  )
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "CATEGORY_NOT_FOUND", message: "دسته‌بندی پیدا نشد." } })
    return
  }
  response.json(category)
})

apiRouter.delete("/admin/categories/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  if (!id) return
  const categoryResult = await pool.query("SELECT slug FROM categories WHERE id=$1", [id])
  if (!categoryResult.rows[0]) {
    response.status(404).json({ error: { code: "CATEGORY_NOT_FOUND", message: "دسته‌بندی پیدا نشد." } })
    return
  }
  const productUsage = await pool.query(
    "SELECT COUNT(*)::int AS count FROM products WHERE category_slug=$1",
    [categoryResult.rows[0].slug],
  )
  if (Number(productUsage.rows[0].count) > 0) {
    response.status(409).json({ error: { code: "CATEGORY_IN_USE", message: "ابتدا محصولات این دسته‌بندی را جابه‌جا یا حذف کنید." } })
    return
  }
  const result = await pool.query("DELETE FROM categories WHERE id=$1", [id])
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "CATEGORY_NOT_FOUND", message: "دسته‌بندی پیدا نشد." } })
    return
  }
  response.status(204).end()
})

apiRouter.get("/admin/posts", async (_request, response) => {
  const result = await pool.query("SELECT data FROM posts ORDER BY created_at DESC")
  response.json(result.rows.map((row) => row.data))
})

apiRouter.post("/admin/posts", async (request, response) => {
  const post = parsed(postSchema, request.body, response)
  if (!post) return
  await pool.query(
    "INSERT INTO posts (id, slug, data) VALUES ($1,$2,$3::jsonb)",
    [post.id, post.slug, JSON.stringify(post)],
  )
  response.status(201).json(post)
})

apiRouter.put("/admin/posts/:id", async (request, response) => {
  const post = parsed(postSchema, request.body, response)
  const id = parsed(idSchema, request.params.id, response)
  if (!post || !id) return
  if (post.id !== id) {
    response.status(400).json({ error: { code: "ID_MISMATCH", message: "شناسه مطلب با مسیر یکسان نیست." } })
    return
  }
  const result = await pool.query(
    "UPDATE posts SET slug=$1, data=$2::jsonb, updated_at=NOW() WHERE id=$3",
    [post.slug, JSON.stringify(post), id],
  )
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "POST_NOT_FOUND", message: "مطلب پیدا نشد." } })
    return
  }
  response.json(post)
})

apiRouter.delete("/admin/posts/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  if (!id) return
  const result = await pool.query("DELETE FROM posts WHERE id=$1", [id])
  if (!result.rowCount) {
    response.status(404).json({ error: { code: "POST_NOT_FOUND", message: "مطلب پیدا نشد." } })
    return
  }
  response.status(204).end()
})

apiRouter.put("/admin/settings/:key", async (request, response) => {
  if (request.params.key !== "seo" && request.params.key !== "about") {
    response.status(404).json({ error: { code: "SETTING_NOT_FOUND", message: "تنظیمات پیدا نشد." } })
    return
  }
  const value = parsed(jsonObjectSchema, request.body, response)
  if (!value) return
  await pool.query(
    `INSERT INTO site_settings (setting_key, value) VALUES ($1,$2::jsonb)
     ON CONFLICT (setting_key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [request.params.key, JSON.stringify(value)],
  )
  response.json(value)
})

apiRouter.get("/admin/orders", async (_request, response) => {
  const result = await pool.query(
    `SELECT o.*,
       COALESCE(jsonb_agg(oi.data ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::jsonb) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id=o.id
     WHERE o.deleted_at IS NULL
     GROUP BY o.id ORDER BY o.created_at DESC`,
  )
  response.json(result.rows.map(mapAdminOrder))
})

apiRouter.get("/admin/orders/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  if (!id) return
  const order = await fetchOrder(pool, id, true)
  if (!order) {
    response.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "سفارش پیدا نشد." } })
    return
  }
  response.json(order)
})

apiRouter.patch("/admin/orders/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  const input = parsed(orderStatusSchema, request.body, response)
  if (!id || !input) return

  try {
    const updated = await withTransaction(async (client) => {
      const current = await client.query("SELECT status FROM orders WHERE id=$1 AND deleted_at IS NULL FOR UPDATE", [id])
      if (!current.rows[0]) return null
      const oldStatus = current.rows[0].status as typeof orderStatusValues[number]

      if (oldStatus !== input.status && (oldStatus === "cancelled" || input.status === "cancelled")) {
        const items = await client.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id=$1 AND product_id IS NOT NULL",
          [id],
        )
        for (const item of items.rows) {
          const productResult = await client.query("SELECT stock, data FROM products WHERE id=$1 FOR UPDATE", [item.product_id])
          if (!productResult.rows[0]) continue
          const row = productResult.rows[0]
          if (row.stock === null) continue
          const delta = oldStatus === "cancelled" ? -Number(item.quantity) : Number(item.quantity)
          if (delta < 0 && Number(row.stock) < Math.abs(delta)) {
            const error = new Error("INSUFFICIENT_STOCK")
            error.name = "INSUFFICIENT_STOCK"
            throw error
          }
          const stock = Math.max(0, Number(row.stock) + delta)
          const status = stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock"
          const data = { ...(row.data as Record<string, unknown>), stock, status }
          await client.query(
            "UPDATE products SET stock=$1,status=$2,data=$3::jsonb,updated_at=NOW() WHERE id=$4",
            [stock, status, JSON.stringify(data), item.product_id],
          )
        }
      }
      await client.query("UPDATE orders SET status=$1 WHERE id=$2", [input.status, id])
      return await fetchOrder(client as unknown as typeof pool, id, true)
    })
    if (!updated) {
      response.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "سفارش پیدا نشد." } })
      return
    }
    response.json(updated)
  } catch (error) {
    if (error instanceof Error && error.name === "INSUFFICIENT_STOCK") {
      response.status(409).json({ error: { code: error.name, message: "موجودی کافی برای فعال‌کردن دوباره سفارش وجود ندارد." } })
      return
    }
    throw error
  }
})

apiRouter.delete("/admin/orders/:id", async (request, response) => {
  const id = parsed(idSchema, request.params.id, response)
  if (!id) return
  const deleted = await withTransaction(async (client) => {
    const orderResult = await client.query(
      "SELECT status FROM orders WHERE id=$1 AND deleted_at IS NULL FOR UPDATE",
      [id],
    )
    if (!orderResult.rows[0]) return false

    if (orderResult.rows[0].status !== "cancelled") {
      const items = await client.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id=$1 AND product_id IS NOT NULL",
        [id],
      )
      for (const item of items.rows) {
        const productResult = await client.query(
          "SELECT stock, data FROM products WHERE id=$1 FOR UPDATE",
          [item.product_id],
        )
        if (!productResult.rows[0] || productResult.rows[0].stock === null) continue
        const row = productResult.rows[0]
        const stock = Number(row.stock) + Number(item.quantity)
        const status = stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock"
        const data = { ...(row.data as Record<string, unknown>), stock, status }
        await client.query(
          "UPDATE products SET stock=$1,status=$2,data=$3::jsonb,updated_at=NOW() WHERE id=$4",
          [stock, status, JSON.stringify(data), item.product_id],
        )
      }
    }
    await client.query("UPDATE orders SET status='cancelled', deleted_at=NOW() WHERE id=$1", [id])
    return true
  })
  if (!deleted) {
    response.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "سفارش پیدا نشد." } })
    return
  }
  response.status(204).end()
})

apiRouter.get("/admin/customers", async (_request, response) => {
  const result = await pool.query(
    `SELECT phone, MAX(full_name) AS name, COUNT(*)::int AS order_count,
       SUM(total_price) FILTER (WHERE status <> 'cancelled')::bigint AS total_spent,
       MAX(created_at) AS last_order_at
     FROM orders WHERE deleted_at IS NULL GROUP BY phone ORDER BY last_order_at DESC`,
  )
  response.json(result.rows.map((row) => ({
    phone: row.phone,
    name: row.name,
    orderCount: row.order_count,
    totalSpent: Number(row.total_spent),
    lastOrderAt: new Date(String(row.last_order_at)).getTime(),
  })))
})

apiRouter.get("/admin/telegram", async (_request, response) => {
  const botUsername = await publicBotUsername()
  const result = await pool.query(
    `SELECT chat_id, username, first_name, is_admin, started_at, last_seen_at
     FROM telegram_chats ORDER BY is_admin DESC, last_seen_at DESC LIMIT 100`,
  )

  response.json({
    enabled: Boolean(botUsername),
    botUsername,
    // کد اتصال ادمین؛ از SESSION_SECRET مشتق می‌شود و فقط در پنل نمایش داده می‌شود.
    adminCode: telegramAdminCode(),
    webhookMode: useTelegramWebhook,
    chats: result.rows.map((row) => ({
      chatId: String(row.chat_id),
      username: row.username,
      firstName: row.first_name,
      isAdmin: row.is_admin,
      startedAt: new Date(String(row.started_at)).getTime(),
      lastSeenAt: new Date(String(row.last_seen_at)).getTime(),
    })),
  })
})

apiRouter.delete("/admin/telegram/chats/:chatId", async (request, response) => {
  const chatId = Number(request.params.chatId)
  if (!Number.isSafeInteger(chatId)) {
    response.status(400).json({ error: { code: "INVALID_CHAT_ID", message: "شناسهٔ چت معتبر نیست." } })
    return
  }
  await pool.query("DELETE FROM telegram_chats WHERE chat_id = $1", [chatId])
  response.status(204).end()
})
