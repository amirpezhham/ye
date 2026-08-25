import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

import { useProducts } from "@/context/ProductsContext"
import { getOrders } from "@/admin/components/order-storage"

export function AdminDashboard() {
  const { products } = useProducts()
  const orders = getOrders()

  const totalSales = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalPrice, 0)

  const customerCount = new Set(
    orders.map((order) => order.phone),
  ).size

  const stats = [
    {
      title: "محصولات",
      value: new Intl.NumberFormat("fa-IR-u-nu-arabext").format(products.length),
      icon: Package,
    },
    {
      title: "سفارش‌ها",
      value: new Intl.NumberFormat("fa-IR-u-nu-arabext").format(orders.length),
      icon: ShoppingBag,
    },
    {
      title: "مشتری‌ها",
      value: new Intl.NumberFormat("fa-IR-u-nu-arabext").format(customerCount),
      icon: Users,
    },
    {
      title: "فروش",
      value: `${new Intl.NumberFormat("fa-IR-u-nu-arabext").format(
        totalSales,
      )} تومان`,
      icon: BarChart3,
    },
  ]

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
            ADMIN PANEL
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            داشبورد مدیریت
          </h1>

          <p className="mt-3 text-sm text-white/40">
            همه چیز را ساده و سریع مدیریت کنید.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-[#151814] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/45">
                    {stat.title}
                  </span>

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#D9E600]/10 text-[#D9E600]">
                    <Icon className="size-5" />
                  </div>
                </div>

                <div className="mt-5 text-2xl font-black">
                  {stat.value}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#151814] p-6">
          <h2 className="text-xl font-black">
            مدیریت سریع
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/products/new"
              className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
            >
              افزودن محصول جدید
            </Link>

            <Link
              to="/admin/products"
              className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
            >
              مدیریت محصولات
            </Link>

             <Link
               to="/admin/about"
               className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
             >
               ویرایش درباره ما
             </Link>

             <Link
               to="/admin/posts"
               className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
             >
               مدیریت پست‌ها
             </Link>

             <Link
               to="/admin/orders"
               className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
             >
               مشاهده سفارش‌ها
             </Link>

             <Link
               to="/admin/categories"
               className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
             >
               مدیریت دسته‌بندی‌ها
             </Link>

             <Link
               to="/admin/customers"
               className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
             >
               مدیریت مشتری‌ها
             </Link>
           </div>
        </div>
      </div>
    </main>
  )
}