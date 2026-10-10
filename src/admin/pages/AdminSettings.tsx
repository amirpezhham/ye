import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Database, Save, Send } from "lucide-react"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"
import { getProducts } from "@/admin/components/product-storage"
import { getCategories } from "@/admin/components/category-storage"
import { getPosts } from "@/admin/components/post-storage"
import { getOrders } from "@/admin/components/order-storage"
import { getSeoSettings } from "@/admin/components/seo-storage"
import { getAboutContent } from "@/admin/components/content-storage"

interface TelegramChatInfo {
  chatId: string
  username: string | null
  firstName: string | null
  isAdmin: boolean
}

interface TelegramAdminInfo {
  enabled: boolean
  botUsername: string | null
  adminCode: string
  webhookMode: boolean
  chats: TelegramChatInfo[]
}

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
  const [telegram, setTelegram] = useState<TelegramAdminInfo | null>(null)
  const [telegramError, setTelegramError] = useState("")

  useEffect(() => {
    let active = true
    void apiGet<TelegramAdminInfo>("/admin/telegram")
      .then((info) => {
        if (active) setTelegram(info)
      })
      .catch((error: unknown) => {
        console.error("دریافت وضعیت ربات تلگرام ناموفق بود.", error)
        if (active) {
          setTelegramError(error instanceof Error ? error.message : "دریافت وضعیت ربات ناموفق بود.")
        }
      })
    return () => {
      active = false
    }
  }, [])

  async function removeTelegramChat(chatId: string) {
    try {
      await apiDelete(`/admin/telegram/chats/${encodeURIComponent(chatId)}`)
      setTelegram((current) =>
        current ? { ...current, chats: current.chats.filter((chat) => chat.chatId !== chatId) } : current,
      )
    } catch (error) {
      console.error("حذف چت تلگرام ناموفق بود.", error)
      setTelegramError(error instanceof Error ? error.message : "حذف چت ناموفق بود.")
    }
  }

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

          <section className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Send className="size-5 text-[#29A9EB]" />
              ربات تلگرام
            </h2>

            {telegramError && (
              <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {telegramError}
              </p>
            )}

            {!telegram ? (
              <p className="mt-3 text-sm text-white/40">در حال بارگذاری...</p>
            ) : !telegram.enabled ? (
              <p className="mt-3 text-sm leading-7 text-white/50">
                ربات غیرفعال است. برای فعال‌سازی، مقدار <code>TELEGRAM_BOT_TOKEN</code> را در فایل
                {" "}
                <code>.env</code> سرور تنظیم و سرویس را دوباره اجرا کنید.
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-white/50">
                  ربات: <span className="font-bold text-white">@{telegram.botUsername}</span>
                  {"  |  "}
                  حالت اتصال: {telegram.webhookMode ? "وبهوک" : "polling"}
                </p>

                <div className="mt-4 rounded-xl border border-white/10 bg-[#0D0F0D] p-4">
                  <p className="text-sm font-bold text-white/70">
                    دریافت اعلان سفارش‌ها در تلگرام
                  </p>

                  <p className="mt-2 text-sm leading-7 text-white/50">
                    ربات را در تلگرام باز کنید و این پیام را بفرستید:
                  </p>

                  <code
                    dir="ltr"
                    className="mt-2 block rounded-lg bg-black/40 px-3 py-2 text-left text-sm text-[#D9E600]"
                  >
                    /start admin_{telegram.adminCode}
                  </code>

                  <p className="mt-2 text-xs leading-6 text-white/40">
                    پس از ثبت، هر سفارش جدید به همان چت اعلام می‌شود. این کد از
                    {" "}
                    <code>SESSION_SECRET</code>
                    {" "}
                    مشتق می‌شود، بنابراین با تغییر آن کد هم عوض می‌گردد.
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-bold text-white/70">
                    چت‌های ادمین ({telegram.chats.filter((chat) => chat.isAdmin).length})
                  </p>

                  {telegram.chats.filter((chat) => chat.isAdmin).length === 0 ? (
                    <p className="mt-2 text-sm text-white/40">
                      هنوز چتی به عنوان ادمین ثبت نشده است.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {telegram.chats
                        .filter((chat) => chat.isAdmin)
                        .map((chat) => (
                          <li
                            key={chat.chatId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-2 text-sm"
                          >
                            <span className="truncate">
                              {chat.firstName ?? chat.username ?? chat.chatId}
                            </span>
                            <button
                              type="button"
                              onClick={() => void removeTelegramChat(chat.chatId)}
                              className="shrink-0 text-xs text-red-300 transition hover:text-red-200"
                            >
                              حذف
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </>
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
