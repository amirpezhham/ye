import type { CartItem } from "@/context/CartContext"
import type { Order } from "@/admin/components/order-storage"
import type { Product } from "@/components/products/product-data"
import type { Post } from "@/admin/components/post-storage"
import type { Category } from "@/admin/components/category-storage"
import type { AboutContent } from "@/admin/components/content-storage"
import type { SeoSettings } from "@/admin/components/seo-storage"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.image === "string" &&
    (value.status === "in-stock" ||
      value.status === "low-stock" ||
      value.status === "out-of-stock")
  )
}

export function isCartItem(value: unknown): value is CartItem {
  return (
    isProduct(value) &&
    isRecord(value) &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0
  )
}

export function isCart(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every(isCartItem)
}

export function isOrder(value: unknown): value is Order {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.fullName === "string" &&
    typeof value.phone === "string" &&
    typeof value.address === "string" &&
    isCart(value.items) &&
    typeof value.totalItems === "number" &&
    Number.isInteger(value.totalItems) &&
    value.totalItems > 0 &&
    typeof value.totalPrice === "number" &&
    Number.isFinite(value.totalPrice) &&
    value.totalPrice >= 0 &&
    typeof value.createdAt === "number"
  )
}

export function isOrders(value: unknown): value is Order[] {
  return Array.isArray(value) && value.every(isOrder)
}

export function isPost(value: unknown): value is Post {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    typeof value.excerpt === "string" &&
    typeof value.body === "string" &&
    typeof value.image === "string" &&
    typeof value.createdAt === "number"
  )
}

export function isPosts(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost)
}

export function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.description === "string" &&
    typeof value.image === "string"
  )
}

export function isCategories(value: unknown): value is Category[] {
  return Array.isArray(value) && value.every(isCategory)
}

export function isAboutContent(value: unknown): value is AboutContent {
  return (
    isRecord(value) &&
    typeof value.heroTitle === "string" &&
    typeof value.heroDescription === "string" &&
    typeof value.storyTitle === "string" &&
    typeof value.storyText === "string" &&
    Array.isArray(value.pillars) &&
    value.pillars.every(
      (pillar) =>
        isRecord(pillar) &&
        typeof pillar.id === "string" &&
        typeof pillar.title === "string" &&
        typeof pillar.description === "string",
    )
  )
}

export function isSeoSettings(value: unknown): value is SeoSettings {
  return (
    isRecord(value) &&
    typeof value.siteTitle === "string" &&
    typeof value.siteDescription === "string" &&
    typeof value.ogImage === "string" &&
    typeof value.homeTitle === "string" &&
    typeof value.homeDescription === "string"
  )
}
