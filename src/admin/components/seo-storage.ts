export interface SeoSettings {
  siteTitle: string
  siteDescription: string
  ogImage: string
  homeTitle: string
  homeDescription: string
}

const STORAGE_KEY = "ye-dood-seo"

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

  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return defaultSeo
  }

  try {
    const parsed = JSON.parse(saved)

    return {
      ...defaultSeo,
      ...(typeof parsed === "object" && parsed ? parsed : {}),
    }
  } catch {
    return defaultSeo
  }
}

export function saveSeoSettings(settings: SeoSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
