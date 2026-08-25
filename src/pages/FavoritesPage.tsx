import { Link } from "react-router-dom"
import { Heart, ShoppingBag } from "lucide-react"

import { ProductGrid } from "@/components/products/ProductGrid"
import { useFavorites } from "@/context/FavoritesContext"
import { useProducts } from "@/context/ProductsContext"

export function FavoritesPage() {
  const { ids } = useFavorites()
  const { products } = useProducts()

  const favoriteProducts = products.filter((product) =>
    ids.includes(product.id),
  )

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-12 text-white lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            MY FAVORITES
          </p>

          <h1 className="mt-3 flex items-center gap-3 text-4xl font-black sm:text-5xl">
            <Heart className="size-9 fill-[#D9E600] text-[#D9E600]" />
            علاقه‌مندی‌های من
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {favoriteProducts.length.toLocaleString("fa-IR-u-nu-arabext")} محصول در
            لیست علاقه‌مندی‌ها
          </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <ProductGrid products={favoriteProducts} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#151814] p-12 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-[#0D0F0D]">
              <Heart className="size-8 text-[#D9E600]" />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              لیست شما خالی است
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
              روی قلب محصولات کلیک کنید تا اینجا ذخیره شوند.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3.5 text-sm font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
            >
              <ShoppingBag className="size-4" />
              مشاهده محصولات
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
