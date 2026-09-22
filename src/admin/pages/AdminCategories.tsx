import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Edit3,
  ImagePlus,
  Layers,
  Plus,
  Save,
  Trash2,
} from "lucide-react"

import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
} from "@/admin/components/category-storage"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { validateImageFile } from "@/lib/storage"
import { getProducts } from "@/admin/components/product-storage"

export function AdminCategories() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>(() =>
    getCategories(),
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(
    null,
  )

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(
    "/images/products/placeholder.svg",
  )
  const [error, setError] = useState("")
  const [listError, setListError] = useState("")

  function refresh() {
    setCategories(getCategories())
  }

  function resetForm() {
    setName("")
    setDescription("")
    setImage("/images/products/placeholder.svg")
    setError("")
  }

  function openAdd() {
    setEditing(null)
    resetForm()
    setListError("")
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setName(category.name)
    setDescription(category.description)
    setImage(category.image)
    setError("")
    setListError("")
    setFormOpen(true)
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

    reader.onload = () => setImage(String(reader.result))

    reader.readAsDataURL(file)
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!name.trim()) {
      setError("لطفاً نام دستهبندی را وارد کنید.")

      return
    }

    const slug =
      editing?.slug ??
      name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")

    if (
      categories.some(
        (category) =>
          category.slug === slug &&
          category.id !== editing?.id,
      )
    ) {
      setError("دستهبندی با این نام از قبل وجود دارد.")

      return
    }

    if (editing) {
      updateCategory({
        ...editing,
        name: name.trim(),
        description: description.trim(),
        image,
      })
    } else {
      addCategory({
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug,
        description: description.trim(),
        image,
      })
    }

    refresh()
    setFormOpen(false)
    resetForm()
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

        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
              CATEGORIES
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              مدیریت دستهبندیها
            </h1>

            <p className="mt-3 text-sm text-white/40">
              دستهبندیهای فروشگاه را مدیریت کنید.
            </p>
          </div>

          {listError && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {listError}
            </div>
          )}

          <button
            type="button"
            onClick={openAdd}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-5 font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Plus className="size-5" />
            افزودن دستهبندی
          </button>
        </div>

        {/* Add/Edit form */}
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-white/10 bg-[#151814] p-6"
          >
            <h2 className="text-lg font-black">
              {editing
                ? `ویرایش «${editing.name}»`
                : "افزودن دستهبندی جدید"}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  نام دستهبندی
                </span>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="مثلاً سیگار"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                />
              </label>

              <div className="flex items-end">
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
                  انتخاب تصویر
                </button>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  توضیح (اختیاری)
                </span>

                <input
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="توضیح کوتاهی برای کارت دستهبندی"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                />
              </label>
            </div>

            {image && (
              <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#0D0F0D]">
                <img
                  src={image}
                  alt="پیشنمایش"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="h-12 flex-1 rounded-xl border border-white/10 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
              >
                انصراف
              </button>

              <button
                type="submit"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
              >
                <Save className="size-4" />
                ذخیره
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#151814]">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-[#D9E600]" />

              <span className="font-bold">
                {categories.length.toLocaleString("fa-IR-u-nu-arabext")} دستهبندی
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="size-16 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-black">
                    {category.name}
                  </h2>

                  <p className="mt-1 line-clamp-1 text-xs text-white/40">
                    {category.description || "بدون توضیح"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                    aria-label={`ویرایش ${category.name}`}
                  >
                    <Edit3 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(category)}
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-red-500/30 hover:text-red-400"
                    aria-label={`حذف ${category.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف دستهبندی؟"
        message={
          pendingDelete
            ? `آیا مطمئن هستید که می‌خواهید دستهبندی «${pendingDelete.name}» را حذف کنید؟`
            : ""
        }
        confirmLabel="حذف دستهبندی"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const hasProducts = getProducts().some(
              (product) => product.categorySlug === pendingDelete.slug,
            )

            if (hasProducts) {
              setListError(
                "این دسته‌بندی محصول دارد و حذف نمی‌شود. ابتدا محصولات آن را جابه‌جا یا حذف کنید.",
              )
              setPendingDelete(null)
              return
            }

            deleteCategory(pendingDelete.id)
            refresh()
          }

          setPendingDelete(null)
        }}
      />
    </main>
  )
}
