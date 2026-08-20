import { motion } from "motion/react"

import { ProductCard } from "./ProductCard"
import type { Product } from "./product-data"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#151814]"
      >
        <div className="text-center">
          <p className="text-base font-bold text-white">
            محصولی پیدا نشد
          </p>

          <p className="mt-2 text-sm text-white/40">
            در این دسته‌بندی محصولی برای نمایش وجود ندارد.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={(selectedProduct) => {
            console.log(
              "Add to cart:",
              selectedProduct.name,
            )
          }}
          onToggleFavorite={(selectedProduct) => {
            console.log(
              "Toggle favorite:",
              selectedProduct.name,
            )
          }}
        />
      ))}
    </motion.div>
  )
}