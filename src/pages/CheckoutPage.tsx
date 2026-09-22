import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Check,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react"

import { useCart } from "@/context/CartContext"
import { useOrder } from "@/context/OrderContext"
import {
  isIranianPhone,
  normalizeIranianPhone,
} from "@/lib/storage"
import { calculateCartSummary } from "@/lib/cart-summary"

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext").format(price)
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart } = useCart()
  const { placeOrder } = useOrder()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const summary = useMemo(() => calculateCartSummary(items), [items])
  const shippingFee = summary.shippingFee
  const finalTotal = summary.total

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#0D0F0D] px-6 py-20 text-white"
      >
        <div className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-[#151814]">
            <ShoppingBag className="size-8 text-[#D9E600]" />
          </div>

          <h1 className="mt-6 text-3xl font-black">
            سبد خرید خالی است
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
            برای ثبت سفارش ابتدا محصولی به سبد خرید اضافه کنید.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3.5 text-sm font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            مشاهده محصولات
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedName = fullName.trim()
    const normalizedPhone = normalizeIranianPhone(phone.trim())
    const normalizedAddress = address.trim()
    const normalizedNote = note.trim()

    if (!normalizedName || !normalizedPhone || !normalizedAddress) {
      setError("لطفاً نام، شماره تماس و آدرس را وارد کنید.")

      return
    }

    if (normalizedName.length < 2 || normalizedName.length > 80) {
      setError("نام باید بین ۲ تا ۸۰ کاراکتر باشد.")

      return
    }

    if (!isIranianPhone(normalizedPhone)) {
      setError("شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود.")

      return
    }

    if (normalizedAddress.length < 10 || normalizedAddress.length > 500) {
      setError("آدرس باید بین ۱۰ تا ۵۰۰ کاراکتر باشد.")

      return
    }

    if (normalizedNote.length > 500) {
      setError("توضیحات سفارش نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.")

      return
    }

    setIsSubmitting(true)

    const order = placeOrder(
      {
        fullName: normalizedName,
        phone: normalizedPhone,
        address: normalizedAddress,
        note: normalizedNote || undefined,
      },
      items,
    )

    clearCart()

    navigate(`/order-success/${order.id}`)
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-12 text-white lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            CHECKOUT
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            ثبت سفارش
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* Customer details */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <User className="size-5 text-[#D9E600]" />
                اطلاعات تحویل گیرنده
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    نام و نام خانوادگی
                  </span>

                  <input
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="مثلاً علی محمدی"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    شماره تماس
                  </span>

                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    inputMode="numeric"
                    aria-invalid={Boolean(error)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold">
                    آدرس کامل
                  </span>

                  <textarea
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="استان، شهر، خیابان، پلاک، واحد"
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold">
                    توضیحات (اختیاری)
                  </span>

                  <input
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    maxLength={500}
                    placeholder="نکته‌ای برای پیک یا شما؟"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#151814] p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-black">خلاصه سفارش</h2>

            <div className="mt-5 space-y-3 border-b border-white/8 pb-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {item.name}
                    </p>

                    <p className="text-xs text-white/40">
                      {item.quantity.toLocaleString("fa-IR-u-nu-arabext")} عدد
                    </p>
                  </div>

                  <span className="shrink-0 text-white/70">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  تعداد کالا
                </span>

                <span>
                  {totalItems.toLocaleString("fa-IR-u-nu-arabext")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/45">
                  هزینه ارسال
                </span>

                <span className="text-[#A8B86B]">
                  {shippingFee === 0
                    ? "رایگان"
                    : `${formatPrice(shippingFee)} تومان`}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-6">
              <span className="font-bold">مبلغ کل</span>

              <div className="text-left">
                <div className="text-2xl font-black">
                  {formatPrice(finalTotal)}
                </div>

                <div className="text-xs text-white/40">
                  تومان
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="size-5" />
              {isSubmitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
            </button>

            <Link
              to="/cart"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              <ArrowRight className="size-4" />
              بازگشت به سبد خرید
            </Link>

            <p className="mt-4 flex items-center gap-2 text-xs text-white/30">
              <Phone className="size-3.5" />
              پس از ثبت، با شما تماس می‌گیریم.
            </p>
          </aside>
        </form>
      </div>
    </main>
  )
}
