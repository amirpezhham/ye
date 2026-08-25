import { useMemo, useState } from "react"
import { motion } from "motion/react"

import { ProductFilters } from "./ProductFilters"
import { ProductGrid } from "./ProductGrid"
import { useProducts } from "@/context/ProductsContext"
import { getCategories } from "@/admin/components/category-storage"

const categories = [
  {
    label: "همه محصولات",
    value: "all",
  },
  ...getCategories().map((category) => ({
    label: category.name,
    value: category.slug,
  })),
]

export function ProductSection() {
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
    <section
      id="products"
      dir="rtl"
      className="bg-[#0D0F0D] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              OUR SELECTION
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              محصولات منتخب
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              انتخابی از محصولات محبوب و خاص یه دود ۲ دود؛ برای کسانی که به
              کیفیت و جزئیات اهمیت می‌دهند.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#D9E600]"
          >
            مشاهده همه محصولات

            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </motion.button>
        </motion.div>

        {/* Category filters */}
        <ProductFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Product results */}
        <ProductGrid products={filteredProducts} />
      </div>
    </section>
  )
}