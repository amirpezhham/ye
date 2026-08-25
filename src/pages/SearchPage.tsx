import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, X } from "lucide-react"

import { ProductGrid } from "@/components/products/ProductGrid"
import { useProducts } from "@/context/ProductsContext"

function normalize(text: string) {
  return text
    .replace(/[۰-۹]/g, (digit) =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit).toString(),
    )
    .trim()
    .toLowerCase()
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const { products } = useProducts()

  const [input, setInput] = useState(query)

  const results = useMemo(() => {
    const term = normalize(query)

    if (!term) {
      return []
    }

    return products.filter((product) => {
      const haystack = normalize(
        `${product.name} ${product.brand ?? ""} ${
          product.category
        } ${product.categorySlug}`,
      )

      return haystack.includes(term)
    })
  }, [query, products])

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setSearchParams({ q: input })
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-12 text-white lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            SEARCH
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            جستجو
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151814] p-3"
        >
          <Search className="size-5 shrink-0 text-white/40" />

          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="نام محصول، برند یا دسته را بنویسید..."
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
          />

          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("")
                setSearchParams({})
              }}
              aria-label="پاک کردن"
              className="flex size-9 items-center justify-center rounded-lg text-white/40 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}

          <button
            type="submit"
            className="h-12 rounded-xl bg-[#D9E600] px-6 text-sm font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            جستجو
          </button>
        </form>

        {query && (
          <p className="mt-6 text-sm text-white/40">
            {results.length.toLocaleString("fa-IR-u-nu-arabext")} نتیجه برای «{query}»
          </p>
        )}

        <div className="mt-6">
          {query ? (
            results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#151814] p-12 text-center">
                <h2 className="text-2xl font-black">
                  موردی پیدا نشد
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
                  متأسفانه محصولی با این مشخصات پیدا نکردیم.
                </p>

                <Link
                  to="/shop"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3.5 text-sm font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
                >
                  مشاهده همه محصولات
                </Link>
              </div>
            )
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#151814] p-12 text-center text-white/40">
              عبارت مورد نظر خود را بالا بنویسید.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
