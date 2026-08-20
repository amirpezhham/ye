export type ProductStatus =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"

export type ProductBadge =
  | "new"
  | "popular"
  | "sale"
  | "featured"

export interface Product {
  id: string
  name: string
  slug: string
  category: string
  categorySlug: string

  description: string

  price: number
  oldPrice?: number

  image: string
  images?: string[]

  status: ProductStatus
  badge?: ProductBadge

  brand?: string
  sku?: string

  stock?: number

  rating?: number
  reviewCount?: number

  featured?: boolean
}

/**
 * محصولات نمونه
 *
 * این اطلاعات فعلاً برای طراحی و تست رابط کاربری هستند.
 * بعداً از طریق پنل مدیریت و دیتابیس مدیریت خواهند شد.
 */
export const products: Product[] = [
  {
    id: "cigarette-001",
    name: "سیگار منتخب",
    slug: "selected-cigarette",
    category: "سیگار",
    categorySlug: "cigarettes",

    description: "انتخابی متفاوت برای سلیقه‌های خاص",

    price: 185000,

    image: "/images/products/cigarette-01.jpg",

    status: "in-stock",
    badge: "popular",

    brand: "Premium",
    sku: "CIG-001",

    stock: 24,

    rating: 4.8,
    reviewCount: 18,

    featured: true,
  },

  {
    id: "tobacco-001",
    name: "تنباکوی دست‌چین",
    slug: "selected-tobacco",
    category: "تنباکو",
    categorySlug: "tobacco",

    description: "تنباکوی خوش‌عطر با ترکیبی خاص",

    price: 245000,
    oldPrice: 275000,

    image: "/images/products/tobacco-01.jpg",

    status: "in-stock",
    badge: "sale",

    brand: "Ye Dood",
    sku: "TOB-001",

    stock: 12,

    rating: 4.9,
    reviewCount: 27,

    featured: true,
  },

  {
    id: "hookah-001",
    name: "قلیان مدل کلاسیک",
    slug: "classic-hookah",
    category: "قلیان",
    categorySlug: "hookah",

    description: "طراحی کلاسیک با ساختاری چشم‌نواز",

    price: 1850000,

    image: "/images/products/hookah-01.jpg",

    status: "low-stock",
    badge: "featured",

    brand: "Ye Dood",
    sku: "HOK-001",

    stock: 4,

    rating: 4.7,
    reviewCount: 11,

    featured: true,
  },

  {
    id: "vape-001",
    name: "ویپ حرفه‌ای",
    slug: "professional-vape",
    category: "ویپ",
    categorySlug: "vape",

    description: "طراحی مدرن برای تجربه‌ای متفاوت",

    price: 3200000,

    image: "/images/products/vape-01.jpg",

    status: "in-stock",
    badge: "new",

    brand: "Premium",
    sku: "VAP-001",

    stock: 8,

    rating: 4.6,
    reviewCount: 9,

    featured: true,
  },

  {
    id: "charcoal-001",
    name: "ذغال طبیعی",
    slug: "natural-charcoal",
    category: "ذغال",
    categorySlug: "charcoal",

    description: "ذغال باکیفیت مناسب استفاده طولانی",

    price: 165000,

    image: "/images/products/charcoal-01.jpg",

    status: "in-stock",

    brand: "Ye Dood",
    sku: "CHA-001",

    stock: 36,

    rating: 4.5,
    reviewCount: 14,
  },

  {
    id: "lighter-001",
    name: "فندک خاص",
    slug: "premium-lighter",
    category: "فندک",
    categorySlug: "lighters",

    description: "فندکی با طراحی خاص و بدنه مقاوم",

    price: 780000,

    image: "/images/products/lighter-01.jpg",

    status: "in-stock",
    badge: "new",

    brand: "Premium",
    sku: "LIG-001",

    stock: 15,

    rating: 4.8,
    reviewCount: 7,
  },

  {
    id: "accessory-001",
    name: "ست اکسسوری",
    slug: "smoke-accessory-set",
    category: "اکسسوری",
    categorySlug: "accessories",

    description: "مجموعه‌ای از ابزارهای کاربردی اسموک‌شاپ",

    price: 590000,

    image: "/images/products/accessory-01.jpg",

    status: "in-stock",

    brand: "Ye Dood",
    sku: "ACC-001",

    stock: 10,

    rating: 4.7,
    reviewCount: 13,
  },

  {
    id: "coffee-001",
    name: "قهوه ویژه یه دود",
    slug: "ye-dood-special-coffee",
    category: "قهوه",
    categorySlug: "coffee",

    description: "قهوه‌ای خاص برای تجربه‌ای متفاوت",

    price: 320000,

    image: "/images/products/coffee-01.jpg",

    status: "in-stock",
    badge: "featured",

    brand: "Ye Dood",
    sku: "COF-001",

    stock: 20,

    rating: 4.9,
    reviewCount: 31,

    featured: true,
  },
]