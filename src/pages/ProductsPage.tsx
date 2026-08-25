import { useMemo, useState } from "react"
import { motion } from "motion/react"

import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductGrid } from "@/components/products/ProductGrid"
import { useProducts } from "@/context/ProductsContext"
import { getCategories } from "@/admin/components/category-storage"

const categories = [
  { label: "همه محصولات", value: "all" },
  ...getCategories().map((category) => ({
    label: category.name,
    value: category.slug,
  })),
]

export function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { products } = useProducts()

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products
    }

    return products.filter(
      (product) => product.categorySlug === activeCategory,
    )
  }, [activeCategory, products])

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      <div className="border-b border-white/10 bg-[#11140F]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]"
          >
            ALL PRODUCTS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
          >
            فروشگاه
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base"
          >
            همه محصولات یه دود ۲ دود در یک جا؛ با امکان فیلتر بر اساس
            دستهبندی.
          </motion.p>
        </div>
      </div>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </main>
  )
}
