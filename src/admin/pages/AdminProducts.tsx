import {
  Edit3,
  Package,
  Plus,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { useProducts } from "@/context/ProductsContext"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export function AdminProducts() {
  const { products, removeProduct } = useProducts()
  const [pendingDelete, setPendingDelete] = useState<string | null>(
    null,
  )
  const [search, setSearch] = useState("")

  const productToDelete = products.find(
    (item) => item.id === pendingDelete,
  )
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    if (!normalizedSearch) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.category, product.brand, product.sku]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase().includes(normalizedSearch),
        ),
    )
  }, [products, search])

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

          <Link
            to="/admin/products/new"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-5 font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Plus className="size-5" />
            افزودن محصول
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#151814]">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex-1">
                <span className="sr-only">جستجوی محصولات</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی نام، دسته، برند یا کد محصول..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#0D0F0D] px-4 text-sm outline-none transition placeholder:text-white/30 focus:border-[#D9E600]/50"
                />
              </label>

              <div className="flex shrink-0 items-center gap-2">
              <Package className="size-5 text-[#D9E600]" />

              <span className="font-bold">
                {filteredProducts.length.toLocaleString("fa-IR-u-nu-arabext")} محصول
              </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/8">
            {products.length === 0 && (
              <div className="p-10 text-center text-white/45">
                <Package className="mx-auto size-10 text-white/20" />
                <p className="mt-3">هنوز محصولی ثبت نشده است.</p>
                <Link
                  to="/admin/products/new"
                  className="mt-4 inline-flex rounded-xl bg-[#D9E600] px-4 py-2 text-sm font-black text-[#0D0F0D]"
                >
                  افزودن اولین محصول
                </Link>
              </div>
            )}
            {products.length > 0 && filteredProducts.length === 0 && (
              <div className="p-10 text-center text-white/45">
                محصولی با این عبارت پیدا نشد.
              </div>
            )}
            {filteredProducts.map((product) => (
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
                    {new Intl.NumberFormat("fa-IR-u-nu-arabext").format(product.price)}
                    {" "}
                    تومان
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                    aria-label={`ویرایش ${product.name}`}
                  >
                    <Edit3 className="size-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(product.id)}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف محصول؟"
        message={
          productToDelete
            ? `آیا مطمئن هستید که می‌خواهید «${productToDelete.name}» را حذف کنید؟`
            : ""
        }
        confirmLabel="حذف محصول"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            removeProduct(pendingDelete)
          }

          setPendingDelete(null)
        }}
      />
    </main>
  )
}