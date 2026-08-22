import { Link, useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import type { Product } from "@/components/products/product-data"
import { ProductForm } from "@/admin/components/ProductForm"
import { useProducts } from "@/context/ProductsContext"

export function AdminAddProduct() {
  const navigate = useNavigate()
  const { addProduct } = useProducts()

  function handleSubmit(product: Product) {
    addProduct(product)
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

        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="ذخیره محصول"
        />
      </div>
    </main>
  )
}
