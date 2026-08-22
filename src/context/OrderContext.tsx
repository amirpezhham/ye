import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { CartItem } from "@/context/CartContext"


export interface OrderDetails {
  fullName: string
  phone: string
  address: string
  note?: string
}


export interface Order extends OrderDetails {
  id: string
  items: CartItem[]
  totalPrice: number
  totalItems: number
  createdAt: number
}


interface OrderContextType {
  lastOrder: Order | null

  placeOrder: (
    details: OrderDetails,
    cartItems: CartItem[],
    totalPrice: number,
    totalItems: number,
  ) => Order

  clearLastOrder: () => void
}


const OrderContext =
  createContext<OrderContextType | undefined>(undefined)


export function OrderProvider({
  children,
}: {
  children: ReactNode
}) {
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
        ...details,
        id: `ORD-${Date.now().toString().slice(-6)}`,
        items: cartItems,
        totalPrice,
        totalItems,
        createdAt: Date.now(),
      }

      setLastOrder(order)

      return order
    },
    [],
  )


  const clearLastOrder = useCallback(() => {
    setLastOrder(null)
  }, [])


  const value = useMemo(
    () => ({
      lastOrder,
      placeOrder,
      clearLastOrder,
    }),
    [lastOrder, placeOrder, clearLastOrder],
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
