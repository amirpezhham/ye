export interface AboutPillar {
  id: string
  title: string
  description: string
}

export interface AboutContent {
  heroTitle: string
  heroDescription: string
  storyTitle: string
  storyText: string
  pillars: AboutPillar[]
}

const STORAGE_KEY = "ye-dood-about"
import { readStorage, writeStorage } from "@/lib/storage"
import { isAboutContent } from "@/lib/validation"

const defaultContent: AboutContent = {
  heroTitle: "یه دود ۲ دود چیست؟",
  heroDescription:
    "یه دود ۲ دود ترکیبی از یک اسموک‌شاپ حرفه‌ای، کافه‌ای دلنشین و فضای Lounge است؛ جایی که کیفیت، جزئیات و تجربه در کنار هم معنا می‌گیرند.",
  storyTitle: "داستان برند",
  storyText:
    "ما باور داریم خرید فقط انتخاب کالا نیست؛ تجربه‌ای از لحظه‌هاست. از محصولات اسموک‌شاپ گرفته تا یک فنجان قهوه در فضای آرام Lounge، همه چیز برای این است که لحظه‌هایتان متفاوت باشد.",
  pillars: [
    {
      id: "pillar-1",
      title: "اسموک‌شاپ",
      description:
        "انتخابی متفاوت از سیگار، تنباکو، قلیان، ویپ و اکسسوری‌های حرفه‌ای.",
    },
    {
      id: "pillar-2",
      title: "قهوه",
      description:
        "قهوه‌های منتخب و دم‌نوش‌های گرم برای یک مکث متفاوت.",
    },
    {
      id: "pillar-3",
      title: "فضای Lounge",
      description:
        "محیطی آرام با بالکن و گوشه‌های نشستن برای تجربه‌ای که فقط مال خودتان است.",
    },
  ],
}

export function getAboutContent(): AboutContent {
  if (typeof window === "undefined") {
    return defaultContent
  }

  return readStorage(STORAGE_KEY, defaultContent, isAboutContent)
}

export function saveAboutContent(content: AboutContent) {
  writeStorage(STORAGE_KEY, content)
}
