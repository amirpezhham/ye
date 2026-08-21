import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Product } from "@/components/products/product-data"
import {
  addProduct as persistAddProduct,
  deleteProduct as persistDeleteProduct,
  getProducts,
} from "@/admin/components/product-storage"


interface ProductsContextType {
  products: Product[]

  getProductBySlug: (slug: string) => Product | undefined

  getByCategorySlug: (categorySlug: string) => Product[]

  addProduct: (product: Product) => void

  removeProduct: (productId: string) => void
}


const ProductsContext =
  createContext<ProductsContextType | undefined>(undefined)


export function ProductsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [products, setProducts] = useState<Product[]>(() =>
    getProducts(),
  )


  const addProduct = useCallback((product: Product) => {
    persistAddProduct(product)

    setProducts(getProducts())
  }, [])


  const removeProduct = useCallback((productId: string) => {
    persistDeleteProduct(productId)

    setProducts(getProducts())
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
      getProductBySlug,
      getByCategorySlug,
      addProduct,
      removeProduct,
    }),
    [
      products,
      getProductBySlug,
      getByCategorySlug,
      addProduct,
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
