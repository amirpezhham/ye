import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"


interface ProductsContextType {
  products: Product[]
  loading: boolean
  error: string

  getProductBySlug: (slug: string) => Product | undefined

  getByCategorySlug: (categorySlug: string) => Product[]

  addProduct: (product: Product) => Promise<void>

  updateProduct: (product: Product) => Promise<void>

  removeProduct: (productId: string) => Promise<void>
}


const ProductsContext =
  createContext<ProductsContextType | undefined>(undefined)


export function ProductsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refreshProducts = useCallback(async () => {
    const response = await apiGet<{ items: Product[] }>("/products")
    setProducts(response.items)
    setError("")
  }, [])

  useEffect(() => {
    void Promise.resolve()
      .then(refreshProducts)
      .catch((loadError: unknown) => {
        console.error("دریافت محصولات از سرور ناموفق بود.", loadError)
        setError(loadError instanceof Error ? loadError.message : "دریافت محصولات ناموفق بود.")
      })
      .finally(() => setLoading(false))
  }, [refreshProducts])

  const addProduct = useCallback(async (product: Product) => {
    const created = await apiPost<Product>("/admin/products", product)
    setProducts((current) => [created, ...current.filter((item) => item.id !== created.id)])
  }, [])

  const updateProduct = useCallback(async (product: Product) => {
    const updated = await apiPut<Product>(`/admin/products/${encodeURIComponent(product.id)}`, product)
    setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))
  }, [])

  const removeProduct = useCallback(async (productId: string) => {
    await apiDelete(`/admin/products/${encodeURIComponent(productId)}`)
    setProducts((current) => current.filter((product) => product.id !== productId))
  }, [])


  const getProductBySlug = useCallback(
    (slug: string) =>
      products.find((product) => product.slug === slug),
    [products],
  )


  const getByCategorySlug = useCallback(
    (categorySlug: string) =>
      products.filter(
        (product) => product.categorySlug === categorySlug,
      ),
    [products],
  )


  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      getProductBySlug,
      getByCategorySlug,
      addProduct,
      updateProduct,
      removeProduct,
    }),
    [
      products,
      loading,
      error,
      getProductBySlug,
      getByCategorySlug,
      addProduct,
      updateProduct,
      removeProduct,
    ],
  )


  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}


export function useProducts() {
  const context = useContext(ProductsContext)


  if (!context) {
    throw new Error(
      "useProducts must be used inside ProductsProvider",
    )
  }


  return context
}
