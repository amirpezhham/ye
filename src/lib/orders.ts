import { apiGet } from "@/lib/api"

/**
 * نمای عمومی سفارش برای صفحهٔ «سفارش ثبت شد».
 * فیلدهای حساس (نشانی و تلفن) عمداً در این پاسخ نیستند.
 */
export interface PublicOrder {
  id: string
  fullName: string
  totalItems: number
  totalPrice: number
  status: string
  createdAt: number
  telegramConfirmedAt?: number
}

export function getOrder(orderId: string): Promise<PublicOrder> {
  return apiGet<PublicOrder>(`/orders/${encodeURIComponent(orderId)}`)
}
