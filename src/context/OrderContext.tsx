import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type { CartItem } from "@/context/CartContext"
import {
  type Order,
  type OrderStatus,
} from "@/admin/components/order-storage"
import { apiGet, apiPatch, apiPost } from "@/lib/api"


export interface OrderDetails {
  fullName: string
  phone: string
  address: string
  note?: string
}


interface OrderContextType {
  orders: Order[]

  lastOrder: Order | null

  placeOrder: (
    details: OrderDetails,
    cartItems: CartItem[],
  ) => Promise<Order>

  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>

  refreshOrders: () => Promise<void>

  clearLastOrder: () => void
}


const OrderContext =
  createContext<OrderContextType | undefined>(undefined)


export function OrderProvider({
  children,
}: {
  children: ReactNode
}) {
  const [orders, setOrders] = useState<Order[]>([])

  const [lastOrder, setLastOrder] = useState<Order | null>(
    null,
  )
  const pendingIdempotencyKey = useRef<string | null>(null)

  const refreshOrders = useCallback(async () => {
    const savedOrders = await apiGet<Order[]>("/admin/orders")
    setOrders(savedOrders)
  }, [])

  const placeOrder = useCallback(
    async (
      details: OrderDetails,
      cartItems: CartItem[],
    ): Promise<Order> => {
      const idempotencyKey = pendingIdempotencyKey.current ?? crypto.randomUUID()
      pendingIdempotencyKey.current = idempotencyKey
      const order = await apiPost<Order>("/orders", {
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
        note: details.note,
        items: cartItems.map(({ id, quantity }) => ({
          productId: id,
          quantity,
        })),
      }, { "Idempotency-Key": idempotencyKey })
      pendingIdempotencyKey.current = null
      setLastOrder(order)
      setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)])
      return order
    },
    [],
  )


  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const updated = await apiPatch<Order>(`/admin/orders/${encodeURIComponent(orderId)}`, { status })
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order))
    },
    [],
  )


  const clearLastOrder = useCallback(() => {
    setLastOrder(null)
  }, [])


  const value = useMemo(
    () => ({
      orders,
      lastOrder,
      placeOrder,
      updateStatus,
      refreshOrders,
      clearLastOrder,
    }),
    [
      orders,
      lastOrder,
      placeOrder,
      updateStatus,
      refreshOrders,
      clearLastOrder,
    ],
  )


  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}


export function useOrder() {
  const context = useContext(OrderContext)


  if (!context) {
    throw new Error(
      "useOrder must be used inside OrderProvider",
    )
  }


  return context
}
