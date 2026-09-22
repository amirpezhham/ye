import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Lock, UserRound } from "lucide-react"

import {
  isAuthenticated,
  login,
} from "@/admin/components/auth-storage"

export function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید.")

      return
    }

    if (login(username, password)) {
      navigate("/admin", { replace: true })

      return
    }

    setError("نام کاربری یا رمز عبور اشتباه است.")
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/images/logo.jpg"
            alt="یه دود ۲ دود"
            className="mx-auto h-14 w-auto rounded-xl object-contain"
          />

          <h1 className="mt-5 text-2xl font-black">ورود به پنل مدیریت</h1>

          <p className="mt-2 text-sm text-white/40">
            برای دسترسی به بخش مدیریت وارد شوید.
          </p>
          <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-6 text-amber-200">
            هشدار: این نسخه فقط frontend است و احراز هویت آن برای استفاده در محیط واقعی امن نیست.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-[#151814] p-6"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              نام کاربری
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0D0F0D] px-3 focus-within:border-[#D9E600]/50">
              <UserRound className="size-4 text-white/40" />

              <input
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="نام کاربری"
                autoComplete="username"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              رمز عبور
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0D0F0D] px-3 focus-within:border-[#D9E600]/50">
              <Lock className="size-4 text-white/40" />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="رمز عبور"
                autoComplete="current-password"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            ورود به پنل
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/25">
          نام کاربری و رمز پیش‌فرض: admin / admin123
        </p>
      </div>
    </main>
  )
}
