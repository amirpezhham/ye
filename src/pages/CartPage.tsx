import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react"
import { motion } from "motion/react"

import { useCart } from "@/context/CartContext"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price)
}

export function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    totalItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart()

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#0D0F0D] px-6 py-20 text-white"
      >
        <div className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-[#151814]">
            <ShoppingBag className="size-8 text-[#D9E600]" />
          </div>

          <p className="mt-6 text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            YOUR CART
          </p>

          <h1 className="mt-3 text-3xl font-black">
            سبد خرید شما خالی است
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3.5 text-sm font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            ادامه خرید
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-12 text-white lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            SHOPPING CART
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            سبد خرید
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {totalItems.toLocaleString("fa-IR")} کالا در سبد خرید شما
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Products */}
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#151814] p-4 sm:flex-row sm:items-center"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.slug}`}
                  className="block shrink-0 overflow-hidden rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-28 object-cover transition-transform duration-500 hover:scale-105 sm:size-32"
                  />
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#A8B86B]">
                    {item.category}
                  </p>

                  <Link
                    to={`/product/${item.slug}`}
                    className="mt-2 block text-lg font-black transition-colors hover:text-[#D9E600]"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/40">
                    {item.description}
                  </p>

                  <div className="mt-4 text-lg font-black">
                    {formatPrice(item.price)}
                    <span className="mr-1 text-xs font-normal text-white/40">
                      تومان
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="flex size-9 items-center justify-center rounded-lg text-white/35 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`حذف ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <div className="flex h-11 items-center rounded-xl border border-white/10 bg-[#0D0F0D]">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      className="flex size-10 items-center justify-center text-white/50 transition hover:text-white"
                      aria-label="کاهش تعداد"
                    >
                      <Minus className="size-4" />
                    </button>

                    <span className="min-w-8 text-center text-sm font-bold">
                      {item.quantity.toLocaleString("fa-IR")}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      className="flex size-10 items-center justify-center text-white/50 transition hover:text-white"
                      aria-label="افزایش تعداد"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#151814] p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-black">
              خلاصه سفارش
            </h2>

            <div className="mt-6 space-y-4 border-b border-white/8 pb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  تعداد کالا
                </span>

                <span>
                  {totalItems.toLocaleString("fa-IR")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  قیمت محصولات
                </span>

                <span>
                  {formatPrice(totalPrice)} تومان
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  ارسال
                </span>

                <span className="text-[#A8B86B]">
                  محاسبه در مرحله بعد
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-bold">
                مبلغ کل
              </span>

              <div className="text-left">
                <div className="text-2xl font-black">
                  {formatPrice(totalPrice)}
                </div>

                <div className="text-xs text-white/40">
                  تومان
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (items.length > 0) {
                  navigate("/checkout")
                }
              }}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
            >
              ادامه و ثبت سفارش
            </button>

            <Link
              to="/"
              className="mt-3 flex h-12 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              ادامه خرید
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}