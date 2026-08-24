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
} from "@/admin/components/order-storage"


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
    totalPrice: number,
    totalItems: number,
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
      totalPrice: number,
      totalItems: number,
    ) => {
      const order: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
        note: details.note,
        items: cartItems,
        totalItems,
        totalPrice,
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
      const updated = getOrders().map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order,
      )

      const storage =
        window.localStorage

      storage.setItem(
        "ye-dood-orders",
        JSON.stringify(updated),
      )

      setOrders(updated)
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
