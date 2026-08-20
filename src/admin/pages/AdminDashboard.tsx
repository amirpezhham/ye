import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react"

const stats = [
  {
    title: "محصولات",
    value: "۸",
    icon: Package,
  },
  {
    title: "سفارش‌ها",
    value: "۰",
    icon: ShoppingBag,
  },
  {
    title: "مشتری‌ها",
    value: "۰",
    icon: Users,
  },
  {
    title: "فروش",
    value: "۰ تومان",
    icon: BarChart3,
  },
]

export function AdminDashboard() {
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
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
            >
              افزودن محصول جدید
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
            >
              مدیریت محصولات
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-[#0D0F0D] px-5 py-4 text-right text-sm font-bold transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
            >
              مشاهده سفارش‌ها
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}