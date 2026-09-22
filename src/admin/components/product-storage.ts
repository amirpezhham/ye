import type { Product } from "@/components/products/product-data"
import { products as initialProducts } from "@/components/products/product-data"
import { readStorage, writeStorage } from "@/lib/storage"
import { isProduct } from "@/lib/validation"

const STORAGE_KEY = "ye-dood-products"

export function getProducts(): Product[] {
  if (typeof window === "undefined") {
    return initialProducts
  }

  return readStorage(
    STORAGE_KEY,
    initialProducts,
    (value): value is Product[] =>
      Array.isArray(value) && value.every(isProduct),
  )
}

export function saveProducts(products: Product[]) {
  writeStorage(STORAGE_KEY, products)
}

export function addProduct(product: Product) {
  const currentProducts = getProducts()

  saveProducts([
    ...currentProducts,
    product,
  ])
}

export function deleteProduct(productId: string) {
  const currentProducts = getProducts()

  saveProducts(
    currentProducts.filter(
      (product) => product.id !== productId,
    ),
  )
}

export function updateProduct(updatedProduct: Product) {
  const currentProducts = getProducts()

  saveProducts(
    currentProducts.map((product) =>
      product.id === updatedProduct.id
        ? updatedProduct
        : product,
    ),
  )
}