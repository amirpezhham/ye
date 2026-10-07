import { z } from "zod"

export const productSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220),
  category: z.string().trim().min(1).max(120),
  categorySlug: z.string().trim().min(1).max(220),
  description: z.string().max(20_000),
  price: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  oldPrice: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  image: z.string().max(3_000_000),
  images: z.array(z.string().max(3_000_000)).max(20).optional(),
  status: z.enum(["in-stock", "low-stock", "out-of-stock"]),
  badge: z.enum(["new", "popular", "sale", "featured"]).optional(),
  brand: z.string().max(120).optional(),
  sku: z.string().max(120).optional(),
  stock: z.number().int().min(0).max(2_147_483_647).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
}).strict()

export const categorySchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(220),
  description: z.string().max(1000),
  image: z.string().max(3_000_000),
}).strict()

export const postSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220),
  excerpt: z.string().max(2000),
  body: z.string().max(100_000),
  image: z.string().max(3_000_000),
  createdAt: z.number().int().nonnegative(),
}).strict()

export const orderRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^09\d{9}$/),
  address: z.string().trim().min(10).max(500),
  note: z.string().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().min(1).max(120),
    quantity: z.number().int().min(1).max(99),
  }).strict()).min(1).max(100),
}).strict()

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
}).strict()

export const orderStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "ready", "shipped", "delivered", "cancelled"]),
}).strict()

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12).max(200),
}).strict()

export const jsonObjectSchema = z.record(z.string(), z.unknown())

const legacyOrderItemSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  image: z.string().max(3_000_000),
  price: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  quantity: z.number().int().min(1).max(99),
}).passthrough()

const legacyOrderSchema = z.object({
  id: z.string().min(1).max(120),
  fullName: z.string().min(2).max(80),
  phone: z.string().regex(/^09\d{9}$/),
  address: z.string().min(10).max(500),
  note: z.string().max(500).optional(),
  items: z.array(legacyOrderItemSchema).min(1).max(100),
  totalItems: z.number().int().min(1).max(9900),
  totalPrice: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  status: z.enum(["new", "reviewing", "ready", "shipped", "delivered", "cancelled"]),
  createdAt: z.number().int().nonnegative(),
}).passthrough()

export const localDataMigrationSchema = z.object({
  products: z.array(productSchema).max(5000),
  categories: z.array(categorySchema).max(500),
  posts: z.array(postSchema).max(5000),
  orders: z.array(legacyOrderSchema).max(20_000),
  seo: jsonObjectSchema,
  about: jsonObjectSchema,
}).strict()
