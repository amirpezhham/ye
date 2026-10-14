import { describe, expect, it } from "vitest"

import {
  absoluteImageUrl,
  buildSiteContent,
  buildWooCommerceCsv,
  buildWxr,
  csvCell,
  csvRow,
  xmlEscape,
} from "@/lib/wordpress-export"

const product = {
  id: "cigarette-001",
  sku: "CIG-001",
  name: 'سیگار "منتخب"',
  slug: "selected-cigarette",
  category: "سیگار",
  description: "انتخابی متفاوت",
  price: 185000,
  image: "/images/products/cigarette-01.jpg",
  status: "in-stock",
  stock: 24,
  featured: true,
}

describe("wordpress export helpers", () => {
  it("escapes CSV cells per RFC 4180", () => {
    expect(csvCell('a "quoted" value')).toBe('"a ""quoted"" value"')
    expect(csvRow(["a", 1, undefined])).toBe('"a","1",""')
  })

  it("escapes XML special characters", () => {
    expect(xmlEscape('Tom & <Jerry> "x"')).toBe(
      "Tom &amp; &lt;Jerry&gt; &quot;x&quot;",
    )
  })

  it("turns relative image paths into absolute URLs", () => {
    expect(absoluteImageUrl("/images/a.jpg", "https://yedood2dood.ir/")).toBe(
      "https://yedood2dood.ir/images/a.jpg",
    )
    expect(absoluteImageUrl("images/a.jpg", "https://yedood2dood.ir")).toBe(
      "https://yedood2dood.ir/images/a.jpg",
    )
    expect(absoluteImageUrl("https://cdn.test/a.jpg", "https://yedood2dood.ir")).toBe(
      "https://cdn.test/a.jpg",
    )
    // بدون baseUrl مسیر نسبی دست‌نخورده می‌ماند
    expect(absoluteImageUrl("/images/a.jpg", "")).toBe("/images/a.jpg")
    expect(absoluteImageUrl(undefined, "https://yedood2dood.ir")).toBe("")
  })

  it("builds a WooCommerce CSV with BOM and the expected columns", () => {
    const csv = buildWooCommerceCsv([product], "https://yedood2dood.ir")
    expect(csv.startsWith("\uFEFF")).toBe(true)
    const [header, row] = csv.replace("\uFEFF", "").trim().split("\r\n")
    expect(header).toContain("Regular price")
    expect(header).toContain("Images")
    // تعداد ستون‌های هدر و ردیف باید برابر باشد تا نگاشت ووکامرس خطا ندهد
    expect(row.split(",").length).toBe(header.split(",").length)
    expect(row).toContain("https://yedood2dood.ir/images/products/cigarette-01.jpg")
  })

  it("marks out-of-stock products in the CSV", () => {
    const csv = buildWooCommerceCsv(
      [{ ...product, status: "out-of-stock", featured: false }],
      "",
    )
    const row = csv.replace("\uFEFF", "").trim().split("\r\n")[1]
    expect(csvRow(["", ""])).toBe('"",""')
    expect(row).toContain('"0"')
  })

  it("builds a valid WXR document with the site title from settings", () => {
    const wxr = buildWxr(
      [
        {
          id: "post-1",
          slug: "sample",
          title: "عنوان & تست",
          body: "<p>متن</p>",
          createdAt: 1_760_000_000_000,
        },
      ],
      { seo: { siteTitle: "یه دود ۲ دود", siteDescription: "توضیح" } },
      "https://yedood2dood.ir",
      new Date("2026-08-15T00:00:00Z"),
    )
    expect(wxr).toContain("<wp:wxr_version>1.2</wp:wxr_version>")
    expect(wxr).toContain("<language>fa-IR</language>")
    expect(wxr).toContain("<title>عنوان &amp; تست</title>")
    expect(wxr).toContain("<wp:post_name><![CDATA[sample]]></wp:post_name>")
    expect(wxr).toContain("<link>https://yedood2dood.ir/blog/sample</link>")
  })

  it("serialises the full site content as parseable JSON", () => {
    const raw = buildSiteContent({
      generatedAt: "2026-10-14T00:00:00.000Z",
      baseUrl: "https://yedood2dood.ir",
      categories: [{ id: "c1", slug: "coffee" }],
      products: [product],
      posts: [],
      settings: { seo: { siteTitle: "یه دود ۲ دود" } },
    })
    const parsed = JSON.parse(raw) as Record<string, unknown>
    expect(parsed.baseUrl).toBe("https://yedood2dood.ir")
    expect(parsed.products).toEqual([product])
    expect(parsed.generatedAt).toBe("2026-10-14T00:00:00.000Z")
  })
})
