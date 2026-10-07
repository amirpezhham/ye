import { useEffect, useState } from "react"
import { Link, Navigate, Outlet } from "react-router-dom"

import { apiGet } from "@/lib/api"

export function AdminRouteGuard() {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated" | "error">("checking")

  useEffect(() => {
    apiGet<{ username: string }>("/admin/session")
      .then(() => setStatus("authenticated"))
      .catch((error: unknown) => {
        console.error("بررسی نشست مدیر ناموفق بود.", error)
        if (error instanceof Error && "status" in error && error.status === 401) {
          setStatus("unauthenticated")
        } else {
          setStatus("error")
        }
      })
  }, [])

  if (status === "checking") {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0D0F0D] text-[#D9E600]">
        در حال بررسی دسترسی...
      </main>
    )
  }

  if (status === "error") {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-black">ارتباط با سرور برقرار نشد</h1>
          <p className="mt-3 text-sm leading-7 text-white/50">
            سرور API را اجرا کنید و سپس صفحه را دوباره بارگذاری کنید.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-[#D9E600] px-5 py-3 font-bold text-[#0D0F0D]">
            تلاش دوباره
          </button>
          <Link to="/admin/login" className="mr-3 text-sm text-white/60">ورود</Link>
        </div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
