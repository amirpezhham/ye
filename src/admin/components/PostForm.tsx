import { useRef, useState } from "react"
import { ImagePlus, Save } from "lucide-react"

import type { Post } from "@/admin/components/post-storage"
import { validateImageFile } from "@/lib/storage"

interface PostFormProps {
  initialPost?: Post
  onSubmit: (post: Post) => void
  submitLabel: string
}

export function PostForm({
  initialPost,
  onSubmit,
  submitLabel,
}: PostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialPost?.title ?? "")
  const [excerpt, setExcerpt] = useState(
    initialPost?.excerpt ?? "",
  )
  const [body, setBody] = useState(initialPost?.body ?? "")
  const [image, setImage] = useState(
    initialPost?.image ?? "/images/products/placeholder.svg",
  )
  const [error, setError] = useState("")

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

    reader.onload = () => setImage(String(reader.result))

    reader.readAsDataURL(file)
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!title.trim() || !body.trim()) {
      setError("لطفاً عنوان و متن پست را وارد کنید.")

      return
    }

    if (title.trim().length > 150) {
      setError("عنوان پست نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.")
      return
    }

    if (excerpt.trim().length > 300 || body.trim().length > 20_000) {
      setError("طول خلاصه یا متن پست بیش از حد مجاز است.")
      return
    }

    const post: Post = {
      id: initialPost?.id ?? `post-${Date.now()}`,
      title: title.trim(),
      slug:
        initialPost?.slug ??
        `post-${Date.now()}`,
      excerpt:
        excerpt.trim() ||
        body.trim().slice(0, 80),
      body: body.trim(),
      image,
      createdAt: initialPost?.createdAt ?? Date.now(),
    }

    onSubmit(post)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
        <h2 className="text-lg font-black">اطلاعات پست</h2>

        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              عنوان پست
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="مثلاً معرفی فضای Lounge"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              خلاصه (اختیاری)
            </span>

            <input
              value={excerpt}
              onChange={(event) =>
                setExcerpt(event.target.value)
              }
              placeholder="یک خط معرفی پست"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              متن پست
            </span>

            <textarea
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              rows={8}
              placeholder="متن پست را بنویسید..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#D9E600]/50"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
        <h2 className="text-lg font-black">تصویر پست</h2>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="size-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0D0F0D]">
            <img
              src={image}
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

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
      >
        <Save className="size-5" />
        {submitLabel}
      </button>
    </form>
  )
}
