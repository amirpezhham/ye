/**
 * درج داده‌های نمونهٔ پروژه در دیتابیس (محصولات، دسته‌بندی‌ها، مطالب).
 *
 * عمداً از مسیر «انتقال یک‌بارهٔ اطلاعات» پنل ادمین استفاده نمی‌کند تا آن
 * قابلیت برای انتقال واقعی داده‌های مرورگر دست‌نخورده بماند.
 *
 * استفاده: npm run db:seed
 */
import "dotenv/config"

import { Pool } from "pg"

import { products } from "../src/components/products/product-data.ts"
import { getCategories } from "../src/admin/components/category-storage.ts"
import { getPosts } from "../src/admin/components/post-storage.ts"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const categories = getCategories()
const posts = getPosts()

for (const category of categories) {
  await pool.query(
    `INSERT INTO categories (id,slug,data) VALUES ($1,$2,$3::jsonb) ON CONFLICT (id) DO NOTHING`,
    [category.id, category.slug, JSON.stringify(category)],
  )
}

for (const product of products) {
  await pool.query(
    `INSERT INTO products (id,slug,category_slug,price,stock,status,data)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT (id) DO NOTHING`,
    [
      product.id,
      product.slug,
      product.categorySlug,
      product.price,
      product.stock ?? null,
      product.status,
      JSON.stringify(product),
    ],
  )
}

for (const post of posts) {
  await pool.query(
    `INSERT INTO posts (id,slug,data,created_at) VALUES ($1,$2,$3::jsonb,$4) ON CONFLICT (id) DO NOTHING`,
    [post.id, post.slug, JSON.stringify(post), new Date(post.createdAt)],
  )
}

const total = await pool.query("SELECT COUNT(*)::int AS count FROM products")
console.log(
  `داده‌های نمونه درج شد — دسته‌بندی: ${categories.length} | محصول: ${products.length} | مطلب: ${posts.length} | مجموع محصولات: ${total.rows[0].count}`,
)
await pool.end()
