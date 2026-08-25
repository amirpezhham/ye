import { Link } from "react-router-dom"
import { ArrowRight, Package, Phone, Users } from "lucide-react"
import { motion } from "motion/react"

import { getOrders, ORDER_STATUS_LABELS } from "@/admin/components/order-storage"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

interface CustomerSummary {
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  orders: ReturnType<typeof getOrders>
}

export function AdminCustomers() {
  const orders = getOrders()

  const customerMap = new Map<string, CustomerSummary>()

  for (const order of orders) {
    const existing = customerMap.get(order.phone)

    if (existing) {
      existing.orderCount += 1

      if (order.status !== "cancelled") {
        existing.totalSpent += order.totalPrice
      }

      existing.orders.push(order)
    } else {
      customerMap.set(order.phone, {
        name: order.fullName,
        phone: order.phone,
        orderCount: 1,
        totalSpent: order.status === "cancelled" ? 0 : order.totalPrice,
        orders: [order],
      })
    }
  }

  const customers = [...customerMap.values()].sort(
    (a, b) => b.totalSpent - a.totalSpent,
  )

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به پنل
        </Link>

        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
            CUSTOMERS
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            مشتری‌ها
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {customers.length.toLocaleString("fa-IR-u-nu-arabext")} مشتری از{" "}
            {orders.length.toLocaleString("fa-IR-u-nu-arabext")} سفارش
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {customers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-10 text-center text-white/40">
              <Users className="mx-auto size-10 text-white/20" />

              <p className="mt-3">
                هنوز مشتری ثبت نشده است.
              </p>
            </div>
          )}

          {customers.map((customer, index) => (
            <motion.div
              key={customer.phone}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-2xl border border-white/10 bg-[#151814] p-5"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Avatar + info */}
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#D9E600]/10 text-lg font-black text-[#D9E600]">
                    {customer.name.trim().charAt(0) || "؟"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-black">
                      {customer.name}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                      <Phone className="size-3.5 text-[#D9E600]" />
                      <span dir="ltr">{customer.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex shrink-0 items-center gap-3">
                  <div className="rounded-xl border border-white/8 bg-[#0D0F0D] px-4 py-3 text-center">
                    <p className="text-xs text-white/40">
                      سفارش‌ها
                    </p>

                    <p className="mt-1 font-black">
                      {customer.orderCount.toLocaleString("fa-IR-u-nu-arabext")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-[#0D0F0D] px-4 py-3 text-center">
                    <p className="text-xs text-white/40">
                      مبلغ خرید
                    </p>

                    <p className="mt-1 font-black text-[#D9E600]">
                      {formatPrice(customer.totalSpent)}
                      <span className="mr-1 text-[10px] font-normal text-white/40">
                        تومان
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders detail */}
              <div className="mt-4 space-y-2 border-t border-white/8 pt-4">
                <p className="text-xs font-bold text-white/40">
                  سفارش‌های این مشتری
                </p>

                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 rounded-xl bg-[#0D0F0D] px-4 py-3 text-sm transition hover:bg-[#1a1e18]"
                  >
                    <Package className="size-4 shrink-0 text-[#D9E600]" />

                    <span className="font-bold text-white/80">
                      {order.id}
                    </span>

                    <span className="text-white/35">
                      {order.totalItems.toLocaleString("fa-IR-u-nu-arabext")} کالا
                    </span>

                    <span className="mr-auto text-[#D9E600]">
                      {formatPrice(order.totalPrice)} تومان
                    </span>

                    <span className="text-xs text-white/35">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
