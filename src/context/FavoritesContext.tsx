import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"


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

  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
    try {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(ids),
      )
    } catch {
      /* نادیده گرفتن خطای ذخیره‌سازی */
    }
  }, [ids])


  const has = useMemo(
    () => (productId: string) => ids.includes(productId),
    [ids],
  )


  function toggle(product: Product) {
    setIds((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id],
    )
  }


  function clear() {
    setIds([])
  }


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
