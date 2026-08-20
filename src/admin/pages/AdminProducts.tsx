import {
  Edit3,
  Package,
  Plus,
  Trash2,
} from "lucide-react"

import { products } from "@/components/products/product-data"

export function AdminProducts() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
              PRODUCTS
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              مدیریت محصولات
            </h1>

            <p className="mt-3 text-sm text-white/40">
              محصولات فروشگاه را ساده مدیریت کنید.
            </p>
          </div>

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-5 font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Plus className="size-5" />
            افزودن محصول
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#151814]">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-[#D9E600]" />

              <span className="font-bold">
                {products.length.toLocaleString("fa-IR")} محصول
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/8">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-20 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-black">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-xs text-white/40">
                    {product.category}
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#D9E600]">
                    {new Intl.NumberFormat("fa-IR").format(product.price)}
                    {" "}
                    تومان
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                    aria-label={`ویرایش ${product.name}`}
                  >
                    <Edit3 className="size-4" />
                  </button>

                  <button
                    type="button"
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-red-500/30 hover:text-red-400"
                    aria-label={`حذف ${product.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}