import { Link } from "react-router-dom"
import { ArrowRight, Package, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useMemo, useState } from "react"

import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/admin/components/order-storage"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-[#D9E600]/10 text-[#D9E600]",
  reviewing: "bg-blue-500/10 text-blue-300",
  ready: "bg-amber-500/10 text-amber-300",
  shipped: "bg-purple-500/10 text-purple-300",
  delivered: "bg-green-500/10 text-green-300",
  cancelled: "bg-red-500/10 text-red-300",
}

export function AdminOrders() {
  const [orders, setOrders] = useState(() => getOrders())
  const [pendingDelete, setPendingDelete] = useState<Order | null>(
    null,
  )
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>(
    "all",
  )
  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter
      const matchesSearch =
        !normalizedSearch ||
        [order.id, order.fullName, order.phone]
          .some((value) =>
            value.toLocaleLowerCase().includes(normalizedSearch),
          )

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

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
            ORDERS
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            مدیریت سفارش‌ها
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {orders.length.toLocaleString("fa-IR-u-nu-arabext")} سفارش ثبت شده
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#151814] p-4 sm:grid-cols-[1fr_auto]">
            <label>
              <span className="sr-only">جستجوی سفارش‌ها</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجوی شماره سفارش، نام یا تلفن..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/30 focus:border-[#D9E600]/50"
              />
            </label>
            <label>
              <span className="sr-only">فیلتر وضعیت سفارش</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | OrderStatus)
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-3 text-sm outline-none sm:w-48"
              >
                <option value="all">همه وضعیت‌ها</option>
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(
                  (status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          {orders.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-10 text-center text-white/40">
              <Package className="mx-auto size-10 text-white/20" />

              <p className="mt-3">هنوز سفارشی ثبت نشده است.</p>
            </div>
          )}

          {orders.length > 0 && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-10 text-center text-white/45">
              سفارشی با این فیلتر پیدا نشد.
            </div>
          )}

          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-2xl border border-white/10 bg-[#151814] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#D9E600]">
                      {order.id}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-white/70">
                    {order.fullName}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {order.totalItems.toLocaleString("fa-IR-u-nu-arabext")} محصول
                    {" • "}
                    {formatPrice(order.totalPrice)} تومان
                  </p>
                </Link>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      (() => {
                        const status = event.target.value as OrderStatus
                        updateOrderStatus(order.id, status)
                        setOrders(getOrders())
                      })()
                    }
                    className="h-10 rounded-xl border border-white/10 bg-[#0D0F0D] px-3 text-sm outline-none"
                  >
                    {(Object.keys(
                      ORDER_STATUS_LABELS,
                    ) as OrderStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(order)}
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-red-500/30 hover:text-red-400"
                    aria-label="حذف سفارش"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف سفارش؟"
        message={
          pendingDelete
            ? `آیا مطمئن هستید که می‌خواهید سفارش «${pendingDelete.id}» را حذف کنید؟`
            : ""
        }
        confirmLabel="حذف سفارش"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteOrder(pendingDelete.id)
            setOrders(getOrders())
          }

          setPendingDelete(null)
        }}
      />
    </main>
  )
}
