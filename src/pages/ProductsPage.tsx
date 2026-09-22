import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import {
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductGrid } from "@/components/products/ProductGrid"
import type { Product } from "@/components/products/product-data"
import { useProducts } from "@/context/ProductsContext"
import { getCategories } from "@/admin/components/category-storage"

const trustItems = [
  { icon: Truck, label: "ارسال سریع در تبریز", hint: "در کمترین زمان" },
  { icon: ShieldCheck, label: "پرداخت امن", hint: "بدون نگرانی" },
  { icon: BadgeCheck, label: "اصالت کالا", hint: "تضمین کیفیت" },
  { icon: MessageCircle, label: "پشتیبانی تلگرام", hint: "پاسخگویی ۲۴/۷" },
]

function StoreSection({
  title,
  subtitle,
  products,
}: {
  title: string
  subtitle?: string
  products: Product[]
}) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>

          {subtitle && (
            <p className="mt-2 text-sm text-white/50">{subtitle}</p>
          )}
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  )
}

export function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { products } = useProducts()
  const categories = [
    { label: "همه محصولات", value: "all" },
    ...getCategories().map((category) => ({
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

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products],
  )

  const newProducts = useMemo(
    () => products.filter((product) => product.badge === "new"),
    [products],
  )

  const saleProducts = useMemo(
    () =>
      products.filter(
        (product) => product.badge === "sale" || product.oldPrice != null,
      ),
    [products],
  )

  const categoryTiles = getCategories()

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      {/* Hero */}
      <section className="border-b border-white/10 bg-[#11140F]">
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
            همه محصولات یه دود ۲ دود در یک جا؛ از قلیان و ویپ تا تنباکو،
            قهوه و اکسسوری.
          </motion.p>
        </div>
      </section>

      {/* Category tiles */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black sm:text-3xl">دسته‌بندی‌ها</h2>

            <p className="mt-2 text-sm text-white/50">
              مستقیم برو به دسته مورد علاقه‌ات
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoryTiles.map((category) => (
              <Link
                key={category.slug}
                to={`/products/${category.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[#151814]"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-lg font-black">{category.name}</div>

                  <div className="mt-1 line-clamp-1 text-xs text-white/70">
                    {category.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <StoreSection
        title="ویژه‌های یه دود"
        subtitle="انتخاب‌های منتخب و محبوب مجموعه"
        products={featuredProducts}
      />

      {/* New arrivals */}
      <StoreSection
        title="تازه‌واردها"
        subtitle="تازه به فروشگاه اضافه شد"
        products={newProducts}
      />

      {/* Sale */}
      <StoreSection
        title="تخفیف‌های ویژه"
        subtitle="فرصت‌های خرید بهتر"
        products={saleProducts}
      />

      {/* Promo banner */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#D9E600]/30 bg-gradient-to-l from-[#D9E600]/15 to-[#151814] p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black sm:text-2xl">
                ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان
              </h3>

              <p className="mt-2 text-sm text-white/60">
                خرید راحت‌تر، تحویل سریع‌تر.
              </p>
            </div>

            <Link
              to="/products"
              className="shrink-0 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D] transition hover:opacity-90"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151814] p-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#D9E600]/10 text-[#D9E600]">
                  <Icon className="size-5" />
                </div>

                <div>
                  <div className="text-sm font-bold">{item.label}</div>

                  <div className="mt-0.5 text-xs text-white/45">
                    {item.hint}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* All products with filters */}
      <section className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black sm:text-3xl">همه محصولات</h2>

            <p className="mt-2 text-sm text-white/50">
              با فیلتر بر اساس دسته‌بندی جستجو کن
            </p>
          </div>

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
