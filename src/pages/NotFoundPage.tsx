import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <main
      dir="rtl"
      className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#0D0F0D] px-6 text-center text-white"
    >
      <div>
        <p className="text-7xl font-black text-[#D9E600]">۴۰۴</p>
        <h1 className="mt-4 text-3xl font-black">صفحه پیدا نشد</h1>
        <p className="mt-3 text-white/50">
          آدرسی که وارد کرده‌اید وجود ندارد یا حذف شده است.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  )
}
