import { Link, useParams } from "react-router-dom"
import { ArrowRight, Phone, MapPin } from "lucide-react"

import {
  getOrders,
  updateOrderStatus,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/admin/components/order-storage"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

export function AdminOrderDetail() {
  const { orderId } = useParams()
  const order = getOrders().find((item) => item.id === orderId)

  if (!order) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black">سفارش پیدا نشد</h1>

          <Link
            to="/admin/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
          >
            بازگشت به سفارش‌ها
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به سفارش‌ها
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
              ORDER DETAILS
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              سفارش {order.id}
            </h1>

            <p className="mt-2 text-sm text-white/40">
              ثبت شده در{" "}
              {new Intl.DateTimeFormat("fa-IR-u-nu-arabext", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(order.createdAt))}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={order.status}
              onChange={(event) =>
                updateOrderStatus(
                  order.id,
                  event.target.value as OrderStatus,
                )
              }
              className="h-11 rounded-xl border border-white/10 bg-[#151814] px-4 text-sm outline-none"
            >
              {(Object.keys(
                ORDER_STATUS_LABELS,
              ) as OrderStatus[]).map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Products */}
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-5">
            <h2 className="mb-4 text-lg font-black">محصولات سفارش</h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-white/8 bg-[#0D0F0D] p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {item.quantity.toLocaleString("fa-IR-u-nu-arabext")} عدد ×
                      {" "}
                      {formatPrice(item.price)} تومان
                    </p>
                  </div>

                  <span className="shrink-0 font-bold text-[#D9E600]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer + summary */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-5">
              <h2 className="mb-4 text-lg font-black">
                اطلاعات مشتری
              </h2>

              <div className="space-y-3 text-sm">
                <p className="font-bold">{order.fullName}</p>

                <p className="flex items-center gap-2 text-white/60">
                  <Phone className="size-4 text-[#D9E600]" />
                  <span dir="ltr">{order.phone}</span>
                </p>

                <p className="flex items-start gap-2 text-white/60">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#D9E600]" />
                  {order.address}
                </p>

                {order.note && (
                  <p className="rounded-xl bg-[#0D0F0D] p-3 text-white/45">
                    {order.note}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151814] p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  تعداد کالا
                </span>

                <span>
                  {order.totalItems.toLocaleString("fa-IR-u-nu-arabext")}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                <span className="font-bold">مبلغ کل</span>

                <span className="text-xl font-black text-[#D9E600]">
                  {formatPrice(order.totalPrice)} تومان
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
