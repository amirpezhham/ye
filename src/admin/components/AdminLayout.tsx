import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"

import { logout } from "@/admin/components/auth-storage"
import {
  FileText,
  Globe,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react"

const navItems = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "محصولات", icon: Package },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: Tag },
  { to: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { to: "/admin/customers", label: "مشتری‌ها", icon: Users },
  { to: "/admin/posts", label: "وبلاگ", icon: FileText },
  { to: "/admin/about", label: "درباره ما", icon: Info },
  { to: "/admin/seo", label: "SEO", icon: Globe },
  { to: "/admin/settings", label: "تنظیمات", icon: KeyRound },
]

export function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#0D0F0D] text-white">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-white/10 bg-[#111311] px-5 py-6 lg:flex">
        <Link
          to="/admin"
          className="mb-8 flex items-center px-1"
          aria-label="یه دود ۲ دود"
        >
          <img
            src="/images/logo.jpg"
            alt="یه دود ۲ دود"
            className="h-10 w-auto rounded-lg object-contain"
          />
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#D9E600]/10 text-[#D9E600]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="size-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:border-red-500/30 hover:text-red-400"
        >
          <LogOut className="size-5" />
          خروج از پنل
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
        >
          <Store className="size-5" />
          مشاهده فروشگاه
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#111311] px-4 py-3 lg:hidden">
          <img
            src="/images/logo.jpg"
            alt="یه دود ۲ دود"
            className="h-9 w-auto rounded-lg object-contain"
          />

          <Link
            to="/"
            className="mr-auto flex items-center gap-2 text-xs text-white/60"
          >
            <Store className="size-4" />
            فروشگاه
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="خروج از پنل مدیریت"
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-white/60"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0D0F0D] px-4 py-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-[#D9E600]/10 text-[#D9E600]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="size-4" />
                {item.label}
              </NavLink>
            )
          })}
        </div>

        <Outlet />
      </div>
    </div>
  )
}
