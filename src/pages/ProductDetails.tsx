import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"

import { ProductGrid } from "@/components/products/ProductGrid"
import type { Product } from "@/components/products/product-data"
import { useCart } from "@/context/CartContext"
import { useFavorites } from "@/context/FavoritesContext"
import { useProducts } from "@/context/ProductsContext"
import { setSeoMeta } from "@/lib/seo"
import { getSeoSettings } from "@/admin/components/seo-storage"
function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

const badgeLabels: Record<
  NonNullable<Product["badge"]>,
  string
> = {
  new: "جدید",
  popular: "پرفروش",
  sale: "تخفیف",
  featured: "ویژه",
}

export function ProductDetails(){
  const { slug } = useParams()
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { has, toggle } = useFavorites()
  const { products, getProductBySlug } = useProducts()
  const product = getProductBySlug(slug ?? "")

  const isFavorite = product ? has(product.id) : false

  useEffect(() => {
    if (!product) {
      return
    }

    const seo = getSeoSettings()

    setSeoMeta({
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      image: product.image || seo.ogImage,
    })
  }, [product])
  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          item.categorySlug === product.categorySlug,
      )
      .slice(0, 4)
  }, [product, products])

  if (!product) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white"
      >
        <div className="text-center">
          <p className="text-sm text-[#A8B86B]">PRODUCT NOT FOUND</p>

          <h1 className="mt-3 text-3xl font-black">
            محصول پیدا نشد
          </h1>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3 text-sm font-bold text-[#0D0F0D]"
          >
            بازگشت به فروشگاه
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  const isOutOfStock = product.status === "out-of-stock"

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Link
            to="/"
            className="transition-colors hover:text-[#D9E600]"
          >
            خانه
          </Link>

          <span>/</span>

          <Link
            to={`/products/${product.categorySlug}`}
            className="transition-colors hover:text-[#D9E600]"
          >
            {product.category}
          </Link>

          <span>/</span>

          <span className="text-white/60">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product */}
      <section className="px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#151814]"
          >
            <div className="relative aspect-square overflow-hidden">
              <motion.img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.035 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

              {product.badge && (
                <div className="absolute right-5 top-5 rounded-full border border-[#D9E600]/25 bg-black/60 px-4 py-2 text-xs font-bold text-[#D9E600] backdrop-blur-md">
                  {badgeLabels[product.badge]}
                </div>
              )}
            </div>
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              {product.category.toUpperCase()}
            </span>

            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-3 text-sm text-white/40">
                برند:{" "}
                <span className="text-white/70">
                  {product.brand}
                </span>
              </p>
            )}

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="size-5 fill-[#D9E600] text-[#D9E600]" />

                  <span className="font-bold">
                    {product.rating.toLocaleString("fa-IR-u-nu-arabext")}
                  </span>
                </div>

                {product.reviewCount !== undefined && (
                  <span className="text-sm text-white/35">
                    ({product.reviewCount.toLocaleString("fa-IR-u-nu-arabext")} نظر)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="mt-7 max-w-xl text-sm leading-8 text-white/55 sm:text-base">
              {product.description}
            </p>

            {/* Stock */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  product.status === "in-stock"
                    ? "bg-[#A8B86B]"
                    : product.status === "low-stock"
                      ? "bg-[#D9E600]"
                      : "bg-white/30"
                }`}
              />

              <span className="text-sm text-white/60">
                {product.status === "in-stock"
                  ? "موجود در انبار"
                  : product.status === "low-stock"
                    ? `موجودی محدود — ${product.stock ?? 0} عدد باقی مانده`
                    : "در حال حاضر ناموجود"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-8 border-y border-white/8 py-6">
              {product.oldPrice && (
                <div className="mb-2 text-sm text-white/30 line-through">
                  {formatPrice(product.oldPrice)} تومان
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">
                  {formatPrice(product.price)}
                </span>

                <span className="text-sm text-white/40">
                  تومان
                </span>
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <div className="flex h-14 items-center justify-between rounded-xl border border-white/10 bg-[#151814] px-3 sm:w-36">
                <motion.button
                  type="button"
                  disabled={isOutOfStock}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setQuantity((value) => Math.max(1, value - 1))
                  }
                  className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  <Minus className="size-4" />
                </motion.button>

                <span className="font-bold">
                  {quantity.toLocaleString("fa-IR-u-nu-arabext")}
                </span>

                <motion.button
                  type="button"
                  disabled={isOutOfStock}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stock ?? 99, value + 1),
                    )
                  }
                  className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  <Plus className="size-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                disabled={isOutOfStock}
                whileHover={!isOutOfStock ? { y: -2 } : undefined}
                whileTap={!isOutOfStock ? { scale: 0.98 } : undefined}
                onClick={() => {
                  if (!isOutOfStock) {
                    addToCart(product, quantity)
                  }
                }}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-6 font-black text-[#0D0F0D] transition-all hover:bg-[#E4EF00] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                <ShoppingBag className="size-5" />

                {isOutOfStock
                  ? "ناموجود"
                  : "افزودن به سبد خرید"}
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => product && toggle(product)}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isFavorite
                    ? "border-[#D9E600]/40 bg-[#D9E600]/10 text-[#D9E600]"
                    : "border-white/10 bg-[#151814] text-white/60 hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                }`}
              >
                <Heart
                  className={`size-5 ${
                    isFavorite ? "fill-current" : ""
                  }`}
                />
              </motion.button>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-[#11140F] p-4">
                <Truck className="size-5 text-[#D9E600]" />

                <p className="mt-3 text-xs font-bold">
                  ارسال سریع
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  ارسال مطمئن سفارش
                </p>
              </div>

              <div className="rounded-xl border border-white/8 bg-[#11140F] p-4">
                <ShieldCheck className="size-5 text-[#D9E600]" />

                <p className="mt-3 text-xs font-bold">
                  خرید مطمئن
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  تجربه خرید امن
                </p>
              </div>

              <div className="rounded-xl border border-white/8 bg-[#11140F] p-4">
                <Sparkles className="size-5 text-[#D9E600]" />

                <p className="mt-3 text-xs font-bold">
                  انتخاب خاص
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  محصولات منتخب
                </p>
              </div>
            </div>

            {product.sku && (
              <p className="mt-6 text-xs text-white/25">
                کد محصول: {product.sku}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section
          dir="rtl"
          className="border-t border-white/5 bg-[#0F110F] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
                YOU MAY ALSO LIKE
              </span>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                محصولات مرتبط
              </h2>
            </div>

            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </main>
  )
}