import {
  BarChart3,
  BookOpen,
  HelpCircle,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

import { useProducts } from "@/context/ProductsContext"
import { useOrder } from "@/context/OrderContext"

export function AdminDashboard() {
  const { products } = useProducts()
  const { orders, refreshOrders } = useOrder()
  const [orderError, setOrderError] = useState("")

  useEffect(() => {
    void refreshOrders().catch((error: unknown) => {
      console.error("دریافت آمار سفارش‌ها ناموفق بود.", error)
      setOrderError(error instanceof Error ? error.message : "دریافت آمار سفارش‌ها ناموفق بود.")
    })
  }, [refreshOrders])

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
                {orderError && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{orderError}</p>}
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

           <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
             <section className="rounded-2xl border border-[#D9E600]/20 bg-[#D9E600]/5 p-6">
               <div className="flex items-center gap-3">
                 <HelpCircle className="size-5 text-[#D9E600]" />
                 <h2 className="text-lg font-black">راهنمای خیلی سریع</h2>
               </div>
               <ol className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                 <li><b className="text-white">۱.</b> برای فروش کالا، از «محصولات» گزینه افزودن محصول را بزنید.</li>
                 <li><b className="text-white">۲.</b> برای نوشتن مطلب، وارد «وبلاگ» و سپس افزودن پست شوید.</li>
                 <li><b className="text-white">۳.</b> سفارش‌های جدید را از بخش «سفارش‌ها» بررسی و وضعیتشان را تغییر دهید.</li>
               </ol>
             </section>

             <section className="rounded-2xl border border-white/10 bg-[#151814] p-6">
               <div className="flex items-center gap-3">
                 <BookOpen className="size-5 text-[#D9E600]" />
                 <h2 className="text-lg font-black">قبل از ذخیره این‌ها را چک کنید</h2>
               </div>
               <ul className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                 <li>قیمت را به تومان و بدون جداکننده وارد کنید.</li>
                 <li>تصاویر بهتر است کمتر از ۲ مگابایت باشند.</li>
                 <li>اطلاعات این نسخه آزمایشی در همین مرورگر ذخیره می‌شود.</li>
               </ul>
             </section>
           </div>
        </div>
      </div>
    </main>
  )
}