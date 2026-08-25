import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion } from "motion/react"

import { ProductGrid } from "@/components/products/ProductGrid"
import { useProducts } from "@/context/ProductsContext"
import { getCategories } from "@/admin/components/category-storage"


const sortOptions = [
  { label: "پیش‌فرض", value: "default" },
  { label: "محبوب‌ترین", value: "popular" },
  { label: "ارزان‌ترین", value: "price-asc" },
  { label: "گران‌ترین", value: "price-desc" },
  { label: "جدیدترین", value: "newest" },
]


export function CategoryPage() {

  const { categorySlug } = useParams()

  const [sort, setSort] = useState("default")


  const { getByCategorySlug } = useProducts()

  const categoryProducts = getByCategorySlug(categorySlug ?? "")

  const categoryTitle =
    getCategories().find(
      (category) => category.slug === categorySlug,
    )?.name ?? "محصولات"

  const filteredProducts = useMemo(() => {
    const list = [...categoryProducts]

    switch (sort) {
      case "popular":
        return list.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        )

      case "price-asc":
        return list.sort((a, b) => a.price - b.price)

      case "price-desc":
        return list.sort((a, b) => b.price - a.price)

      case "newest":
        return list.sort((a, b) => {
          const aNew = a.badge === "new" ? 1 : 0
          const bNew = b.badge === "new" ? 1 : 0

          if (aNew !== bNew) {
            return bNew - aNew
          }

          return (b.rating ?? 0) - (a.rating ?? 0)
        })

      default:
        return list
    }
  }, [categoryProducts, sort])



  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-20 text-white"
    >

      <div className="mx-auto max-w-7xl">


        {/* Breadcrumb */}

        <div className="mb-8 flex items-center gap-2 text-xs text-white/40">

          <Link
            to="/"
            className="transition hover:text-[#D9E600]"
          >
            خانه
          </Link>

          <span>/</span>

          <span className="text-white/60">
            {categoryTitle}
          </span>

        </div>



        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-10"
        >

          <span className="text-xs tracking-[0.25em] text-[#A8B86B]">
            CATEGORY
          </span>


          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            {categoryTitle}
          </h1>


          <p className="mt-4 text-sm text-white/50 sm:text-base">
            {filteredProducts.length.toLocaleString("fa-IR-u-nu-arabext")}
            {" "}
            محصول موجود در این دسته‌بندی
          </p>


        </motion.div>



        {/* Sort */}

        {filteredProducts.length > 0 && (
          <div className="mb-8 flex justify-end">
            <label className="relative">
              <span className="sr-only">
                مرتب‌سازی
              </span>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-[#151814] px-10 py-3 text-sm text-white/80 outline-none transition hover:border-[#D9E600]/40 focus:border-[#D9E600]"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#151814] text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                ▼
              </span>
            </label>
          </div>
        )}



        {/* Products */}

        {
          filteredProducts.length > 0 ? (

            <ProductGrid
              products={filteredProducts}
            >

            </ProductGrid>

          ) : (

            <div className="rounded-3xl border border-white/10 bg-[#151814] p-10 text-center">

              <h2 className="text-2xl font-black">
                محصولی پیدا نشد
              </h2>


              <p className="mt-3 text-white/50">
                این دسته‌بندی هنوز محصولی ندارد.
              </p>


              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
              >
                بازگشت به فروشگاه

                <ArrowLeft className="size-4" />

              </Link>


            </div>

          )
        }


      </div>

    </main>
  )
}