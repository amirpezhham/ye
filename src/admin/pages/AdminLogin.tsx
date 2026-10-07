import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Lock, UserRound } from "lucide-react"

import {
  apiGet,
  apiPost,
} from "@/lib/api"

export function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void apiGet("/admin/session")
      .then(() => navigate("/admin", { replace: true }))
      .catch((sessionError: unknown) => {
        if (!(sessionError instanceof Error && "status" in sessionError && sessionError.status === 401)) {
          console.error("بررسی نشست ورود ناموفق بود.", sessionError)
          setError("ارتباط با سرور برقرار نشد.")
        }
      })
      .finally(() => setCheckingSession(false))
  }, [navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید.")

      return
    }

    setIsSubmitting(true)
    try {
      await apiPost("/admin/login", { username, password })
      navigate("/admin", { replace: true })
    } catch (loginError) {
      console.error("ورود مدیر ناموفق بود.", loginError)
      setError(loginError instanceof Error ? loginError.message : "ورود ناموفق بود.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingSession) {
    return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0D0F0D] text-[#D9E600]">در حال بررسی نشست...</main>
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
        </div>

        {typeof location.state?.message === "string" && (
          <p className="mb-4 rounded-xl border border-[#D9E600]/30 bg-[#D9E600]/10 px-4 py-3 text-sm text-[#D9E600]">
            {location.state.message}
          </p>
        )}

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
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            {isSubmitting ? "در حال ورود..." : "ورود به پنل"}
          </button>
        </form>

      </div>
    </main>
  )
}
