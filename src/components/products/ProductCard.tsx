import { Heart, ShoppingBag, Star } from "lucide-react"
import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { useCart } from "@/context/CartContext"
import { useFavorites } from "@/context/FavoritesContext"
import type { Product } from "./product-data"

interface ProductCardProps {
  product: Product
}

const badgeLabels: Record<NonNullable<Product["badge"]>, string> = {
  new: "جدید",
  popular: "پرفروش",
  sale: "تخفیف",
  featured: "ویژه",
}

const statusLabels: Record<Product["status"], string> = {
  "in-stock": "موجود",
  "low-stock": "موجودی محدود",
  "out-of-stock": "ناموجود",
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price)
}

export function ProductCard({
  product,
}: ProductCardProps) {

  const { addToCart } = useCart()
  const { has, toggle } = useFavorites()

  const isFavorite = has(product.id)
  const isOutOfStock = product.status === "out-of-stock"

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#151814]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#0D0F0D]">

        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`مشاهده ${product.name}`}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </Link>


        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />


        {product.badge && (
          <div className="absolute right-4 top-4 z-20 rounded-full border border-[#D9E600]/25 bg-black/55 px-3 py-1.5 text-xs font-bold text-[#D9E600] backdrop-blur-md">
            {badgeLabels[product.badge]}
          </div>
        )}


        <motion.button
          type="button"
          aria-label={
            isFavorite
              ? `حذف ${product.name} از علاقه‌مندی‌ها`
              : `افزودن ${product.name} به علاقه‌مندی‌ها`
          }
          whileTap={{ scale: 0.9 }}
          onClick={() => toggle(product)}
          className={`absolute left-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isFavorite
              ? "border-[#D9E600]/40 bg-[#D9E600]/10 text-[#D9E600]"
              : "border-white/10 bg-black/45 text-white/75 hover:border-[#D9E600]/40 hover:bg-[#D9E600]/10 hover:text-[#D9E600]"
          }`}
        >
          <Heart className={`size-[18px] ${isFavorite ? "fill-current" : ""}`} />
        </motion.button>


        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/75 backdrop-blur-md">

          <span
            className={`size-1.5 rounded-full ${
              product.status === "in-stock"
                ? "bg-[#A8B86B]"
                : product.status === "low-stock"
                  ? "bg-[#D9E600]"
                  : "bg-white/30"
            }`}
          />

          {statusLabels[product.status]}
        </div>

      </div>


      <div className="p-5">

        <div className="flex items-center justify-between gap-3">

          <span className="text-xs font-medium text-[#A8B86B]">
            {product.category}
          </span>


          {product.rating !== undefined && (
            <div className="flex items-center gap-1 text-xs text-white/55">
              <Star className="size-3.5 fill-[#D9E600] text-[#D9E600]" />

              <span>
                {product.rating.toLocaleString("fa-IR")}
              </span>
            </div>
          )}

        </div>


        <Link to={`/product/${product.slug}`}>

          <h3 className="mt-3 line-clamp-1 text-lg font-black text-white hover:text-[#D9E600]">
            {product.name}
          </h3>

        </Link>


        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-white/45">
          {product.description}
        </p>


        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/8 pt-4">

          <div>

            <div className="flex items-baseline gap-1">

              <span className="text-xl font-black text-white">
                {formatPrice(product.price)}
              </span>

              <span className="text-xs text-white/40">
                تومان
              </span>

            </div>

          </div>


          <motion.button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (!isOutOfStock) {
                addToCart(product)
              }
            }}
            className="flex size-11 items-center justify-center rounded-xl border border-[#D9E600]/20 bg-[#D9E600]/5 text-[#D9E600]"
          >
            <ShoppingBag className="size-[18px]" />
          </motion.button>


        </div>

      </div>


      <motion.div
        className="absolute bottom-0 right-0 h-0.5 bg-[#D9E600]"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.4 }}
      />

    </motion.article>
  )
}