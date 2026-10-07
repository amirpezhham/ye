import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Database, Save } from "lucide-react"
import { apiPatch, apiPost } from "@/lib/api"
import { getProducts } from "@/admin/components/product-storage"
import { getCategories } from "@/admin/components/category-storage"
import { getPosts } from "@/admin/components/post-storage"
import { getOrders } from "@/admin/components/order-storage"
import { getSeoSettings } from "@/admin/components/seo-storage"
import { getAboutContent } from "@/admin/components/content-storage"

export function AdminSettings() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [migrationResult, setMigrationResult] = useState("")
  const [isMigrating, setIsMigrating] = useState(false)

  async function handleLocalDataMigration() {
    setMigrationResult("")
    setIsMigrating(true)
    try {
      const result = await apiPost<{
        imported: { products: number; categories: number; posts: number; orders: number }
      }>("/admin/migrate-local-data", {
        products: getProducts(),
        categories: getCategories(),
        posts: getPosts(),
        orders: getOrders(),
        seo: getSeoSettings(),
        about: getAboutContent(),
      })
      const counts = result.imported
      setMigrationResult(
        `انتقال انجام شد: ${counts.products} محصول، ${counts.categories} دسته‌بندی، ${counts.posts} مطلب و ${counts.orders} سفارش. صفحه را برای دریافت داده‌های جدید بازخوانی کنید.`,
      )
    } catch (error) {
      console.error("انتقال داده‌های مرورگر ناموفق بود.", error)
      setMigrationResult(error instanceof Error ? error.message : "انتقال داده‌ها انجام نشد.")
    } finally {
      setIsMigrating(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "لطفاً همه فیلدها را پر کنید.",
      })

      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "رمز عبور جدید و تکرار آن یکسان نیستند.",
      })

      return
    }

    try {
      await apiPatch<void>("/admin/password", {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      console.error("تغییر رمز عبور ناموفق بود.", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "تغییر رمز انجام نشد.",
      })
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    navigate("/admin/login", {
      replace: true,
      state: { message: "رمز عبور تغییر کرد. با رمز جدید وارد شوید." },
    })
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به پنل
        </Link>

        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
            SETTINGS
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            تنظیمات پنل
          </h1>

          <p className="mt-3 text-sm text-white/40">
            رمز پنل توسط سرور بررسی می‌شود و در مرورگر ذخیره نمی‌شود.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Database className="size-5 text-[#D9E600]" />
              انتقال اطلاعات این مرورگر
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/50">
              این انتقال فقط یک‌بار برای کل پایگاه‌داده انجام می‌شود؛ پیش از اجرا مطمئن شوید مرورگری که اطلاعات کامل‌تری دارد باز است. محصولات، دسته‌بندی‌ها، مطالب، سفارش‌ها و تنظیمات ذخیره‌شده در همان مرورگر به سرور منتقل می‌شوند. فایل‌های تصویری نیز همراه داده‌ها ارسال می‌شوند.
            </p>
            <button
              type="button"
              onClick={() => void handleLocalDataMigration()}
              disabled={isMigrating}
              className="mt-4 rounded-xl border border-[#D9E600]/30 px-4 py-3 text-sm font-bold text-[#D9E600] disabled:opacity-50"
            >
              {isMigrating ? "در حال انتقال..." : "انتقال یک‌باره اطلاعات"}
            </button>
            {migrationResult && (
              <p role="status" className="mt-4 rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-6 text-white/70">
                {migrationResult}
              </p>
            )}
          </section>

          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">تغییر رمز عبور</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  رمز عبور فعلی
                </span>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  رمز عبور جدید
                </span>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  تکرار رمز عبور جدید
                </span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-[#D9E600]/30 bg-[#D9E600]/10 text-[#D9E600]"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Save className="size-5" />
            ذخیره تغییرات
          </button>
        </form>
      </div>
    </main>
  )
}
