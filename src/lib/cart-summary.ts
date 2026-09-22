import type { CartItem } from "@/context/CartContext"

export interface CartSummary {
  totalItems: number
  subtotal: number
  shippingFee: number
  total: number
}

export function calculateCartSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce(
    (total, item) =>
      total + Math.max(0, item.price) * Math.max(1, item.quantity),
    0,
  )
  const totalItems = items.reduce(
    (total, item) => total + Math.max(1, item.quantity),
    0,
  )
  const shippingFee =
    items.length > 0 && subtotal < 2_000_000 ? 30_000 : 0

  return {
    totalItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
  }
}
