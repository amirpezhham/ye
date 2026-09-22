import { describe, expect, it } from "vitest"

import { isCart, isProduct } from "@/lib/validation"

const product = {
  id: "product-1",
  name: "محصول",
  slug: "product",
  category: "دسته",
  categorySlug: "category",
  description: "توضیح",
  price: 1000,
  image: "/product.jpg",
  status: "in-stock" as const,
}

describe("runtime validation", () => {
  it("accepts a valid product and cart", () => {
    expect(isProduct(product)).toBe(true)
    expect(isCart([{ ...product, quantity: 2 }])).toBe(true)
  })

  it("rejects invalid cart quantities and prices", () => {
    expect(isCart([{ ...product, quantity: 0 }])).toBe(false)
    expect(isProduct({ ...product, price: -1 })).toBe(false)
  })
})
