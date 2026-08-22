import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"


const CART_STORAGE_KEY = "ye-dood-cart"

function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}


export interface CartItem extends Product {
  quantity: number
}


interface CartContextType {
  items: CartItem[]

  addToCart: (
    product: Product,
    quantity?: number,
  ) => void

  removeFromCart: (productId: string) => void

  increaseQuantity: (productId: string) => void

  decreaseQuantity: (productId: string) => void

  clearCart: () => void

  totalItems: number

  totalPrice: number
}


const CartContext = createContext<CartContextType | undefined>(
  undefined,
)


export function CartProvider({
  children,
}: {
  children: ReactNode
}) {

  const [items, setItems] = useState<CartItem[]>(loadCart)


  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items),
      )
    } catch {
      /* نادیده گرفتن خطای ذخیره‌سازی */
    }
  }, [items])



  function addToCart(
    product: Product,
    quantity = 1,
  ) {

    setItems((currentItems) => {

      const existingItem = currentItems.find(
        (item) => item.id === product.id,
      )


      if (existingItem) {

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item,
        )

      }


      return [
        ...currentItems,
        {
          ...product,
          quantity,
        },
      ]

    })

  }



  function removeFromCart(productId: string) {

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId,
      ),
    )

  }



  function increaseQuantity(productId: string) {

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    )

  }



  function decreaseQuantity(productId: string) {

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1,
              ),
            }
          : item,
      ),
    )

  }



  function clearCart() {

    setItems([])

  }



  const totalItems = useMemo(() => {

    return items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    )

  }, [items])



  const totalPrice = useMemo(() => {

    return items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0,
    )

  }, [items])



  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )

}



export function useCart() {

  const context = useContext(CartContext)


  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider",
    )

  }


  return context

}