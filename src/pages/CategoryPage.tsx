import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion } from "motion/react"

import { ProductGrid } from "@/components/products/ProductGrid"
import { products } from "@/components/products/product-data"


const categoryNames: Record<string, string> = {
  cigarettes: "سیگار",
  tobacco: "تنباکو",
  hookah: "قلیان",
  vape: "ویپ",
  charcoal: "ذغال",
  lighters: "فندک",
  accessories: "اکسسوری",
  coffee: "قهوه",
}


export function CategoryPage() {

  const { categorySlug } = useParams()


  const filteredProducts = products.filter(
    (product) =>
      product.categorySlug === categorySlug,
  )


  const categoryTitle =
    categoryNames[categorySlug ?? ""] ?? "محصولات"



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
            {filteredProducts.length.toLocaleString("fa-IR")}
            {" "}
            محصول موجود در این دسته‌بندی
          </p>


        </motion.div>



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