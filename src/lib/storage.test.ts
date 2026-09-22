import { describe, expect, it } from "vitest"

import {
  isIranianPhone,
  normalizeIranianPhone,
  readStorage,
} from "@/lib/storage"

describe("storage helpers", () => {
  it("normalizes Persian phone digits", () => {
    expect(normalizeIranianPhone("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789")
    expect(isIranianPhone("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true)
  })

  it("rejects invalid phone numbers", () => {
    expect(isIranianPhone("091234")).toBe(false)
    expect(isIranianPhone("08123456789")).toBe(false)
  })

  it("returns the fallback outside a browser", () => {
    expect(readStorage("missing", ["fallback"], Array.isArray)).toEqual([
      "fallback",
    ])
  })
})
