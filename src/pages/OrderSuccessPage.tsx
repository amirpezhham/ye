import { Link, useParams } from "react-router-dom"
import {
  CheckCircle2,
  Home,
  Package,
  ShoppingBag,
} from "lucide-react"
import { motion } from "motion/react"

import { useMemo } from "react"
import { getOrders } from "@/admin/components/order-storage"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

export function OrderSuccessPage() {
  const { orderId } = useParams()
  const order = useMemo(
    () =>
      orderId
        ? getOrders().find((item) => item.id === orderId) ?? null
        : null,
    [orderId],
  )

  return (
    <main
      dir="rtl"
      className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#0D0F0D] px-6 py-20 text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="mx-auto flex size-24 items-center justify-center rounded-full border border-[#D9E600]/30 bg-[#D9E600]/10"
        >
          <CheckCircle2 className="size-12 text-[#D9E600]" />
        </motion.div>

        <p className="mt-7 text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
          ORDER CONFIRMED
        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          سفارش شما ثبت شد
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
          سفارشتان با موفقیت دریافت شد. به زودی همکاران ما برای هماهنگی
          ارسال با شما تماس می‌گیرند.
        </p>

        {order && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#151814] p-6 text-right">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <span className="flex items-center gap-2 text-sm text-white/45">
                <Package className="size-4 text-[#D9E600]" />
                شماره سفارش
              </span>

              <span className="font-black text-[#D9E600]">
                {order.id}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/45">
                  تحویل گیرنده
                </span>

                <span className="font-bold">
                  {order.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/45">
                  تعداد کالا
                </span>

                <span>
                  {order.totalItems.toLocaleString("fa-IR-u-nu-arabext")} عدد
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/45">
                  مبلغ کل
                </span>

                <span className="font-black">
                  {formatPrice(order.totalPrice)} تومان
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/shop"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-6 font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <ShoppingBag className="size-4" />
            ادامه خرید
          </Link>

          <Link
            to="/"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-6 font-bold text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <Home className="size-4" />
            صفحه اصلی
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
