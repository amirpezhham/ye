export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
}

const STORAGE_KEY = "ye-dood-categories"
import { readStorage, writeStorage } from "@/lib/storage"
import { isCategories } from "@/lib/validation"

const defaultCategories: Category[] = [
  {
    id: "cat-cig",
    name: "سیگار",
    slug: "cigarettes",
    description: "انتخابی متفاوت برای هر سلیقه",
    image: "/images/categories/cigarettes.jpg",
  },
  {
    id: "cat-tob",
    name: "تنباکو",
    slug: "tobacco",
    description: "تنباکوهای منتخب و خاص",
    image: "/images/categories/tobacco.jpg",
  },
  {
    id: "cat-hok",
    name: "قلیان",
    slug: "hookah",
    description: "قلیان و متعلقات آن",
    image: "/images/categories/hookah.jpg",
  },
  {
    id: "cat-vap",
    name: "ویپ",
    slug: "vape",
    description: "دنیای ویپ و محصولات مرتبط",
    image: "/images/categories/vape.jpg",
  },
  {
    id: "cat-cha",
    name: "ذغال",
    slug: "charcoal",
    description: "ذغال و محصولات مرتبط",
    image: "/images/categories/Charcoal.jpg",
  },
  {
    id: "cat-lig",
    name: "فندک",
    slug: "lighters",
    description: "فندکهای خاص و کاربردی",
    image: "/images/categories/Lighters.jpg",
  },
  {
    id: "cat-acc",
    name: "اکسسوری",
    slug: "accessories",
    description: "لوازم جانبی و ابزارهای خاص",
    image: "/images/categories/Accessories.jpg",
  },
  {
    id: "cat-cof",
    name: "قهوه",
    slug: "coffee",
    description: "قهوه و تجربهای متفاوت در یه دود ۲ دود",
    image: "/images/categories/Coffee.jpg",
  },
]

export function getCategories(): Category[] {
  if (typeof window === "undefined") {
    return defaultCategories
  }

  return readStorage(STORAGE_KEY, defaultCategories, isCategories)
}

export function saveCategories(categories: Category[]) {
  writeStorage(STORAGE_KEY, categories)
}

export function addCategory(category: Category) {
  saveCategories([...getCategories(), category])
}

export function updateCategory(updated: Category) {
  saveCategories(
    getCategories().map((category) =>
      category.id === updated.id ? updated : category,
    ),
  )
}

export function deleteCategory(categoryId: string) {
  saveCategories(
    getCategories().filter((category) => category.id !== categoryId),
  )
}
