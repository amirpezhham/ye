export interface SeoSettings {
  siteTitle: string
  siteDescription: string
  ogImage: string
  homeTitle: string
  homeDescription: string
}

const STORAGE_KEY = "ye-dood-seo"
import { readStorage, writeStorage } from "@/lib/storage"
import { isSeoSettings } from "@/lib/validation"

const defaultSeo: SeoSettings = {
  siteTitle: "یه دود ۲ دود",
  siteDescription:
    "فروشگاه آنلاین تخصصی سیگار، تنباکو، قلیان، ویپ، ذغال، فندک، اکسسوری و قهوه با ارسال سریع.",
  ogImage: "/images/logo.jpg",
  homeTitle: "یه دود ۲ دود | فروشگاه تخصصی قلیان، ویپ و لوازم دود",
  homeDescription:
    "یه دود ۲ دود؛ تخصصی‌ترین فروشگاه آنلاین قلیان، ویپ، تنباکو و لوازم جانبی با ارسال سریع و کیفیت تضمین‌شده.",
}

export function getSeoSettings(): SeoSettings {
  if (typeof window === "undefined") {
    return defaultSeo
  }

  return readStorage(STORAGE_KEY, defaultSeo, isSeoSettings)
}

export function saveSeoSettings(settings: SeoSettings) {
  writeStorage(STORAGE_KEY, settings)
}
