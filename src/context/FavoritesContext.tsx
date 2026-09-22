import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"
import { readStorage, writeStorage } from "@/lib/storage"


interface FavoritesContextType {
  ids: string[]

  has: (productId: string) => boolean

  toggle: (product: Product) => void

  clear: () => void
}


const FAVORITES_STORAGE_KEY = "ye-dood-favorites"

function loadFavorites(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  return readStorage(
    FAVORITES_STORAGE_KEY,
    [],
    (value): value is string[] =>
      Array.isArray(value) &&
      value.every((item) => typeof item === "string"),
  )
}


const FavoritesContext =
  createContext<FavoritesContextType | undefined>(undefined)


export function FavoritesProvider({
  children,
}: {
  children: ReactNode
}) {
  const [ids, setIds] = useState<string[]>(loadFavorites)


  useEffect(() => {
    writeStorage(FAVORITES_STORAGE_KEY, ids)
  }, [ids])


  const has = useMemo(
    () => (productId: string) => ids.includes(productId),
    [ids],
  )


  const toggle = useCallback((product: Product) => {
    setIds((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id],
    )
  }, [])


  const clear = useCallback(() => {
    setIds([])
  }, [])


  const value = useMemo(
    () => ({
      ids,
      has,
      toggle,
      clear,
    }),
    [ids, has, toggle, clear],
  )


  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}


export function useFavorites() {
  const context = useContext(FavoritesContext)


  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider",
    )
  }


  return context
}
