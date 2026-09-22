import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Plus, Save, Trash2 } from "lucide-react"

import {
  getAboutContent,
  saveAboutContent,
  type AboutContent,
} from "@/admin/components/content-storage"

export function AdminAbout() {
  const navigate = useNavigate()
  const [content, setContent] = useState<AboutContent>(
    getAboutContent(),
  )
  const [error, setError] = useState("")

  function update(
    field: keyof AboutContent,
    value: string | AboutContent["pillars"],
  ) {
    setContent((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function addPillar() {
    setContent((previous) => ({
      ...previous,
      pillars: [
        ...previous.pillars,
        {
          id: `pillar-${Date.now()}`,
          title: "",
          description: "",
        },
      ],
    }))
  }

  function removePillar(id: string) {
    setContent((previous) => ({
      ...previous,
      pillars: previous.pillars.filter(
        (item) => item.id !== id,
      ),
    }))
  }

  function updatePillar(
    id: string,
    field: "title" | "description",
    value: string,
  ) {
    setContent((previous) => ({
      ...previous,
      pillars: previous.pillars.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }))
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !content.heroTitle.trim() ||
      !content.heroDescription.trim() ||
      !content.storyTitle.trim() ||
      !content.storyText.trim() ||
      content.pillars.some(
        (pillar) => !pillar.title.trim() || !pillar.description.trim(),
      )
    ) {
      setError("لطفاً همه عنوان‌ها و توضیحات را کامل کنید.")
      return
    }

    saveAboutContent(content)
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
            EDIT CONTENT
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            ویرایش صفحه درباره ما
          </h1>

          <p className="mt-3 text-sm text-white/40">
            متن‌های صفحه درباره ما را ویرایش کنید.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Hero */}
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">بخش بالای صفحه</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  تیتر اصلی
                </span>

                <input
                  value={content.heroTitle}
                  onChange={(event) =>
                    update("heroTitle", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  توضیح اصلی
                </span>

                <textarea
                  value={content.heroDescription}
                  onChange={(event) =>
                    update(
                      "heroDescription",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          {/* Story */}
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">داستان برند</h2>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  تیتر داستان
                </span>

                <input
                  value={content.storyTitle}
                  onChange={(event) =>
                    update("storyTitle", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  متن داستان
                </span>

                <textarea
                  value={content.storyText}
                  onChange={(event) =>
                    update("storyText", event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          {/* Pillars */}
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                ستون‌های برند
              </h2>

              <button
                type="button"
                onClick={addPillar}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#D9E600]/30 px-4 text-sm font-bold text-[#D9E600] transition hover:bg-[#D9E600]/10"
              >
                <Plus className="size-4" />
                افزودن ستون
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {content.pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="rounded-xl border border-white/8 bg-[#0D0F0D] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      ستون
                    </span>

                    <button
                      type="button"
                      onClick={() => removePillar(pillar.id)}
                      aria-label="حذف ستون"
                      className="flex size-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <input
                    value={pillar.title}
                    onChange={(event) =>
                      updatePillar(
                        pillar.id,
                        "title",
                        event.target.value,
                      )
                    }
                    placeholder="عنوان ستون"
                    className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-[#151814] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                  />

                  <textarea
                    value={pillar.description}
                    onChange={(event) =>
                      updatePillar(
                        pillar.id,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="توضیح ستون"
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-[#151814] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
                  />
                </div>
              ))}
            </div>
          </div>

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
