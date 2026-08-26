import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Save } from "lucide-react"

import {
  changePassword,
  getCredentials,
} from "@/admin/components/auth-storage"

export function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const username = getCredentials().username

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    const result = changePassword(currentPassword, newPassword)

    if (!result.ok) {
      setMessage({ type: "error", text: result.error ?? "خطا" })

      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setMessage({
      type: "success",
      text: "رمز عبور با موفقیت تغییر کرد.",
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
            نام کاربری و رمز عبور دسترسی به پنل مدیریت.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">تغییر رمز عبور</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  نام کاربری فعلی
                </span>

                <input
                  value={username}
                  disabled
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm text-white/40 outline-none"
                />
              </label>

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
