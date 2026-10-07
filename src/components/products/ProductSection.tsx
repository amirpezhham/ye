import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"

import { ProductFilters } from "./ProductFilters"
import { ProductGrid } from "./ProductGrid"
import { useProducts } from "@/context/ProductsContext"
import { useCategories } from "@/context/CategoriesContext"

export function ProductSection() {
  const [activeCategory, setActiveCategory] = useState("all")

  const { products, error: productsError, loading: productsLoading } = useProducts()
  const { categories: storedCategories } = useCategories()
  const categories = [
    {
      label: "همه محصولات",
      value: "all",
    },
    ...storedCategories.map((category) => ({
      label: category.name,
      value: category.slug,
    })),
  ]

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

          <Link
            to="/shop"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#D9E600]"
          >
            مشاهده همه محصولات

            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </Link>
        </motion.div>

        {/* Category filters */}
        {productsError && <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{productsError}</p>}
        {productsLoading && <p className="mb-4 text-sm text-white/45">در حال دریافت محصولات...</p>}
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