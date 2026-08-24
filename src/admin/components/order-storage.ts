import type { CartItem } from "@/context/CartContext"

export type OrderStatus =
  | "new"
  | "reviewing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جدید",
  reviewing: "در حال بررسی",
  ready: "آماده ارسال",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  cancelled: "لغو شد",
}

export interface Order {
  id: string
  fullName: string
  phone: string
  address: string
  note?: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  status: OrderStatus
  createdAt: number
}

const STORAGE_KEY = "ye-dood-orders"

export function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return []
  }

  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export function addOrder(order: Order) {
  saveOrders([order, ...getOrders()])
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  saveOrders(
    getOrders().map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
          }
        : order,
    ),
  )
}

export function deleteOrder(orderId: string) {
  saveOrders(
    getOrders().filter((order) => order.id !== orderId),
  )
}
