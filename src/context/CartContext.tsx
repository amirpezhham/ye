import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"
import { writeStorage, readStorage } from "@/lib/storage"
import { isCart as isValidCart } from "@/lib/validation"
import { calculateCartSummary } from "@/lib/cart-summary"


const CART_STORAGE_KEY = "ye-dood-cart"

function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return []
  }

  const loaded = readStorage(CART_STORAGE_KEY, [], isValidCart)

  return loaded
    .filter((item) => item.status !== "out-of-stock")
    .map((item) => ({
      ...item,
      quantity: Math.min(
        Math.max(1, item.quantity),
        item.stock && item.stock > 0 ? item.stock : Number.MAX_SAFE_INTEGER,
      ),
    }))
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
    writeStorage(CART_STORAGE_KEY, items)
  }, [items])



  function addToCart(
    product: Product,
    quantity = 1,
  ) {
    const safeQuantity = Math.max(1, Math.floor(quantity))

    if (
      !Number.isFinite(quantity) ||
      product.price < 0 ||
      product.status === "out-of-stock"
    ) {
      return
    }

    setItems((currentItems) => {

      const existingItem = currentItems.find(
        (item) => item.id === product.id,
      )


      if (existingItem) {

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + safeQuantity,
                product.stock && product.stock > 0
                  ? product.stock
                  : Number.MAX_SAFE_INTEGER,
                ),
              }
            : item,
        )

      }


      return [
        ...currentItems,
        {
          ...product,
          quantity: safeQuantity,
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
              quantity: Math.min(
                item.quantity + 1,
                item.stock && item.stock > 0
                  ? item.stock
                  : Number.MAX_SAFE_INTEGER,
              ),
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



  const summary = useMemo(() => calculateCartSummary(items), [items])



  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems: summary.totalItems,
        totalPrice: summary.subtotal,
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