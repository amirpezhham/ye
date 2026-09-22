import { useRef, useState } from "react"
import { ImagePlus, Save } from "lucide-react"

import type { Product } from "@/components/products/product-data"
import { getCategories } from "@/admin/components/category-storage"
import { validateImageFile } from "@/lib/storage"

interface ProductFormProps {
  initialProduct?: Product
  onSubmit: (product: Product) => void
  submitLabel: string
}

export function ProductForm({
  initialProduct,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categoryOptions = getCategories().map((category) => ({
    value: category.slug,
    label: category.name,
  }))

  const [name, setName] = useState(initialProduct?.name ?? "")
  const [price, setPrice] = useState(
    initialProduct?.price ? String(initialProduct.price) : "",
  )
  const [oldPrice, setOldPrice] = useState(
    initialProduct?.oldPrice
      ? String(initialProduct.oldPrice)
      : "",
  )
  const [category, setCategory] = useState(
    initialProduct?.categorySlug ?? "",
  )
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  )
  const [seoTitle, setSeoTitle] = useState(
    initialProduct?.seoTitle ?? "",
  )
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seoDescription ?? "",
  )
  const [stock, setStock] = useState(
    initialProduct?.stock ? String(initialProduct.stock) : "1",
  )
  const [image, setImage] = useState(
    initialProduct?.image ?? "/images/products/placeholder.svg",
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

    reader.onload = () => {
      setImage(String(reader.result))
    }

    reader.readAsDataURL(file)
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!name.trim() || !price || !category) {
      setError("لطفاً نام، قیمت و دستهبندی را وارد کنید.")

      return
    }

    const finalPrice = Number(price)
    const finalOldPrice = oldPrice ? Number(oldPrice) : undefined
    const finalStock = stock ? Number(stock) : 1

    if (!Number.isInteger(finalPrice) || finalPrice <= 0) {
      setError("قیمت باید یک عدد صحیح بیشتر از صفر باشد.")

      return
    }

    if (
      finalOldPrice !== undefined &&
      (!Number.isInteger(finalOldPrice) || finalOldPrice <= finalPrice)
    ) {
      setError("قیمت قبلی باید عددی صحیح و بیشتر از قیمت فعلی باشد.")

      return
    }

    if (!Number.isInteger(finalStock) || finalStock < 0) {
      setError("موجودی باید یک عدد صحیح صفر یا بیشتر باشد.")

      return
    }

    if (name.trim().length < 2 || name.trim().length > 150) {
      setError("نام محصول باید بین ۲ تا ۱۵۰ کاراکتر باشد.")

      return
    }

    if (description.trim().length > 2000) {
      setError("توضیحات محصول نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد.")

      return
    }

    const product: Product = {
      id: initialProduct?.id ?? `product-${Date.now()}`,
      name: name.trim(),
      slug:
        initialProduct?.slug ?? `${category}-${Date.now()}`,
      category: getCategories().find(
        (item) => item.slug === category,
      )?.name ?? category,
      categorySlug: category,
      description: description.trim(),
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      price: finalPrice,
      oldPrice: finalOldPrice,
      image,
      status: finalStock <= 0 ? "out-of-stock" : "in-stock",
      stock: finalStock,
      brand: initialProduct?.brand,
      sku: initialProduct?.sku,
      rating: initialProduct?.rating,
      reviewCount: initialProduct?.reviewCount,
      badge: initialProduct?.badge,
      featured: initialProduct?.featured,
    }

    onSubmit(product)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
        <h2 className="text-lg font-black">اطلاعات اصلی</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              نام محصول
            </span>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثلاً سیگار مارلبرو"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              دستهبندی
            </span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
            >
              <option value="">انتخاب دستهبندی</option>

              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              قیمت (تومان)
            </span>

            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="numeric"
              placeholder="مثلاً ۲۵۰۰۰۰"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              قیمت قبلی (اختیاری)
            </span>

            <input
              value={oldPrice}
              onChange={(event) =>
                setOldPrice(event.target.value)
              }
              inputMode="numeric"
              placeholder="برای نمایش تخفیف"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              موجودی انبار
            </span>

            <input
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              inputMode="numeric"
              placeholder="تعداد"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-bold">
              توضیحات محصول
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="توضیح کوتاهی درباره محصول بنویسید..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
        <h2 className="text-lg font-black">
          بهینه‌سازی موتور جستجو (SEO)
        </h2>

        <p className="mt-2 text-xs text-white/40">
          در صورت خالی بودن، عنوان و توضیحات محصول استفاده
          می‌شوند.
        </p>

        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              SEO Title
            </span>

            <input
              value={seoTitle}
              onChange={(event) =>
                setSeoTitle(event.target.value)
              }
              placeholder="عنوان برای موتورهای جستجو"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              SEO Description
            </span>

            <textarea
              value={seoDescription}
              onChange={(event) =>
                setSeoDescription(event.target.value)
              }
              placeholder="توضیحات برای موتورهای جستجو"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
        <h2 className="text-lg font-black">تصویر محصول</h2>

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
              فرمت‌های JPG/PNG. تصویر مستقیماً در مرورگر ذخیره
              می‌شود.
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
