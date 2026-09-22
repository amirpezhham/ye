import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { CartItem } from "@/context/CartContext"
import {
  addOrder as persistAddOrder,
  getOrders,
  type Order,
  type OrderStatus,
  updateOrderStatus as persistUpdateOrderStatus,
} from "@/admin/components/order-storage"
import { calculateCartSummary } from "@/lib/cart-summary"


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
  ) => Order

  updateStatus: (orderId: string, status: OrderStatus) => void

  clearLastOrder: () => void
}


const OrderContext =
  createContext<OrderContextType | undefined>(undefined)


export function OrderProvider({
  children,
}: {
  children: ReactNode
}) {
  const [orders, setOrders] = useState<Order[]>(() =>
    getOrders(),
  )

  const [lastOrder, setLastOrder] = useState<Order | null>(
    null,
  )


  const placeOrder = useCallback(
    (
      details: OrderDetails,
      cartItems: CartItem[],
    ) => {
      const summary = calculateCartSummary(cartItems)
      const order: Order = {
        id: `ORD-${crypto.randomUUID()}`,
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
        note: details.note,
        items: cartItems,
        totalItems: summary.totalItems,
        totalPrice: summary.total,
        status: "new",
        createdAt: Date.now(),
      }

      persistAddOrder(order)
      setOrders(getOrders())
      setLastOrder(order)

      return order
    },
    [],
  )


  const updateStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      persistUpdateOrderStatus(orderId, status)
      setOrders(getOrders())
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
      clearLastOrder,
    }),
    [
      orders,
      lastOrder,
      placeOrder,
      updateStatus,
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
