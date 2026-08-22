import type { Product } from "@/components/products/product-data"
import { products as initialProducts } from "@/components/products/product-data"

const STORAGE_KEY = "ye-dood-products"

export function getProducts(): Product[] {
  if (typeof window === "undefined") {
    return initialProducts
  }

  const savedProducts = localStorage.getItem(STORAGE_KEY)

  if (!savedProducts) {
    return initialProducts
  }

  try {
    const parsedProducts = JSON.parse(savedProducts)

    if (!Array.isArray(parsedProducts)) {
      return initialProducts
    }

    return parsedProducts
  } catch {
    return initialProducts
  }
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(products),
  )
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