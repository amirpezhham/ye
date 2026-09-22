import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, ImagePlus, Save } from "lucide-react"

import {
  getSeoSettings,
  saveSeoSettings,
  type SeoSettings,
} from "@/admin/components/seo-storage"
import { validateImageFile } from "@/lib/storage"

export function AdminSeo() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<SeoSettings>(
    getSeoSettings(),
  )
  const [error, setError] = useState("")

  function update(field: keyof SeoSettings, value: string) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const imageError = validateImageFile(file)

    if (imageError) {
      setError(imageError)
      return
    }

    const reader = new FileReader()

    reader.onload = () => update("ogImage", String(reader.result))

    reader.readAsDataURL(file)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveSeoSettings(settings)
    navigate("/admin")
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
            SEO
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            تنظیمات SEO سایت
          </h1>
          <p className="mt-3 text-sm text-white/40">
            عنوان و توضیحی را بنویسید که در گوگل و شبکه‌های اجتماعی دیده می‌شود.
          </p>

          <p className="mt-3 text-sm text-white/40">
            عنوان و توضیحاتی که در نتایج جستجو و شبکه‌های
            اجتماعی نمایش داده می‌شوند.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">تنظیمات کلی سایت</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  عنوان سایت
                </span>

                <input
                  value={settings.siteTitle}
                  onChange={(event) =>
                    update("siteTitle", event.target.value)
                  }
                  placeholder="یه دود ۲ دود"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  توضیحات سایت
                </span>

                <textarea
                  value={settings.siteDescription}
                  onChange={(event) =>
                    update("siteDescription", event.target.value)
                  }
                  rows={3}
                  placeholder="توضیح کوتاه درباره فروشگاه"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">تصویر OG</h2>

            <p className="mt-2 text-xs text-white/40">
              تصویری که هنگام اشتراک‌گذاری سایت در شبکه‌های
              اجتماعی نمایش داده می‌شود.
            </p>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="size-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0D0F0D]">
                <img
                  src={settings.ogImage}
                  alt="پیشنمایش"
                  className="size-full object-cover"
                />
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0D0F0D] px-5 text-sm font-bold text-white/70 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                >
                  <ImagePlus className="size-4" />
                  انتخاب تصویر از دستگاه
                </button>

                <p className="mt-2 text-xs text-white/30">
                  فرمت‌های JPG/PNG.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">صفحه اصلی</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  عنوان صفحه اصلی
                </span>

                <input
                  value={settings.homeTitle}
                  onChange={(event) =>
                    update("homeTitle", event.target.value)
                  }
                  placeholder="عنوان اختصاصی برای صفحه اصلی"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  توضیحات صفحه اصلی
                </span>

                <textarea
                  value={settings.homeDescription}
                  onChange={(event) =>
                    update("homeDescription", event.target.value)
                  }
                  rows={3}
                  placeholder="توضیح اختصاصی برای صفحه اصلی"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Save className="size-5" />
            ذخیره تنظیمات
          </button>
        </form>
      </div>
    </main>
  )
}
