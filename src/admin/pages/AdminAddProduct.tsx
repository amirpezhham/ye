import { useState } from "react"
import { ArrowRight, ImagePlus, Save } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import type { Product } from "@/components/products/product-data"
import { addProduct } from "@/admin/components/product-storage"

export function AdminAddProduct() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!name.trim() || !price || !category) {
      return
    }

    const categoryNames: Record<string, string> = {
      cigarettes: "سیگار",
      tobacco: "تنباکو",
      hookah: "قلیان",
      vape: "ویپ",
      charcoal: "ذغال",
      lighters: "فندک",
      accessories: "اکسسوری",
      coffee: "قهوه",
    }

    const slug = `${category}-${Date.now()}`

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: name.trim(),
      slug,
      category: categoryNames[category] ?? category,
      categorySlug: category,
      description: description.trim(),
      price: Number(price),
      image: "/images/products/placeholder.jpg",
      status: "in-stock",
      stock: 1,
    }

    addProduct(newProduct)

    navigate("/admin/products")
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به محصولات
        </Link>

        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
            NEW PRODUCT
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            افزودن محصول جدید
          </h1>

          <p className="mt-3 text-sm text-white/40">
            اطلاعات محصول را وارد کنید و آن را به فروشگاه اضافه کنید.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">
              اطلاعات اصلی
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  نام محصول
                </span>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="مثلاً سیگار مارلبرو"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  قیمت
                </span>

                <input
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="مثلاً ۲۵۰۰۰۰"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  دسته‌بندی
                </span>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition focus:border-[#D9E600]/50"
                >
                  <option value="">
                    انتخاب دسته‌بندی
                  </option>
                  <option value="cigarettes">
                    سیگار
                  </option>
                  <option value="tobacco">
                    تنباکو
                  </option>
                  <option value="hookah">
                    قلیان
                  </option>
                  <option value="vape">
                    ویپ
                  </option>
                  <option value="charcoal">
                    ذغال
                  </option>
                  <option value="lighters">
                    فندک
                  </option>
                  <option value="accessories">
                    اکسسوری
                  </option>
                  <option value="coffee">
                    قهوه
                  </option>
                </select>
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
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0F0D] px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/20 focus:border-[#D9E600]/50"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151814] p-6">
            <h2 className="text-lg font-black">
              تصویر محصول
            </h2>

            <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0D0F0D]">
              <ImagePlus className="size-8 text-[#A8B86B]" />

              <p className="mt-3 text-sm font-bold">
                تصویر محصول
              </p>

              <p className="mt-1 text-xs text-white/30">
                آپلود تصویر را در مرحله بعد فعال می‌کنیم.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D9E600] font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Save className="size-5" />
            ذخیره محصول
          </button>
        </form>
      </div>
    </main>
  )
}