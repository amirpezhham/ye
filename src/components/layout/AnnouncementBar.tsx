import { Coffee, Truck } from "lucide-react"

export function AnnouncementBar() {
  return (
    <div className="border-b border-white/10 bg-green-dark text-sm">
      <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-4 px-4 text-white/90">
        <div className="hidden items-center gap-2 sm:flex">
          <Truck className="size-4 text-primary" />
          <span>ارسال سریع سفارش‌ها به سراسر تبریز</span>
        </div>

        <div className="flex items-center gap-2">
          <Coffee className="size-4 text-primary" />
          <span>فضای کافه و بالکن ۶ نفره در فروشگاه</span>
        </div>

        <div className="hidden sm:block text-primary">
          یه دود ۲ دود
        </div>
      </div>
    </div>
  )
}