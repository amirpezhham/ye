import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import type { Product } from "@/components/products/product-data"
import { ProductForm } from "@/admin/components/ProductForm"
import { useProducts } from "@/context/ProductsContext"

export function AdminEditProduct() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { products, addProduct, removeProduct } =
    useProducts()

  const product = products.find((item) => item.id === productId)

  if (!product) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black">محصول پیدا نشد</h1>

          <Link
            to="/admin/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
          >
            بازگشت به لیست
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  function handleSubmit(updated: Product) {
    removeProduct(product!.id)
    addProduct(updated)
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
            EDIT PRODUCT
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            ویرایش محصول
          </h1>

          <p className="mt-3 text-sm text-white/40">
            اطلاعات محصول را ویرایش و ذخیره کنید.
          </p>
        </div>

        <ProductForm
          initialProduct={product}
          onSubmit={handleSubmit}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </main>
  )
}
