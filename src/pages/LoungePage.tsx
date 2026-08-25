import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Coffee,
  GlassWater,
  Heart,
  Sparkles,
  Sun,
} from "lucide-react"
import { motion } from "motion/react"

import { useProducts } from "@/context/ProductsContext"

const loungeFeatures = [
  {
    icon: Coffee,
    title: "قهوه تازه",
    description:
      "قهوه‌های منتخب و دم‌نوش‌های گرم برای یک مکث متفاوت.",
  },
  {
    icon: Sun,
    title: "بالکن اختصاصی",
    description:
      "فضای باز و دلنشین با چیدمان راحت برای نشستن و گپ زدن.",
  },
  {
    icon: Heart,
    title: "فضای نشستن",
    description:
      "گوشه‌های آرام و صمیمی برای لذت بردن از لحظه‌ها.",
  },
  {
    icon: Sparkles,
    title: "تجربه مجموعه",
    description:
      "ترکیب اسموک‌شاپ و کافه در یک تجربه یکتا.",
  },
]

export function LoungePage() {
  const { products } = useProducts()

  const coffeeProducts = products.filter(
    (product) =>
      product.categorySlug === "coffee" ||
      product.categorySlug === "hookah",
  )

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      {/* Hero */}
      <section
        id="lounge"
        className="relative overflow-hidden border-b border-white/10 bg-[#11140F]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,230,0,0.06),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]"
          >
            SMOKE SHOP • COFFEE LOUNGE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            فضای مجموعه یه دود ۲ دود
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg"
          >
            ما فقط یک فروشگاه نیستیم. یه دود ۲ دود ترکیبی از
            اسموک‌شاپ، کافه و فضای نشستن است؛ جایی برای یک مکث
            متفاوت با قهوه، بالکن و تجربه‌ای که فقط مال خودتان است.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition hover:bg-lime"
            >
              <GlassWater className="size-4" />
              مشاهده محصولات
            </Link>

            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 font-medium text-white transition hover:border-primary hover:text-primary"
            >
              بیشتر بدانید
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-6 py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              THE SPACE
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              چه چیزی منتظر شماست
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loungeFeatures.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="rounded-2xl border border-white/10 bg-[#151814] p-6"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl border border-[#D9E600]/20 bg-[#D9E600]/10 text-[#D9E600]">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/45">
                    {feature.description}
                  </p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Coffee highlight */}
      {coffeeProducts.length > 0 && (
        <section className="border-t border-white/10 bg-[#0F110F] px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
                TASTE IT
              </span>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                طعم فضای ما
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coffeeProducts.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151814] p-4 transition hover:border-[#D9E600]/30"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="truncate font-black">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#D9E600]">
                      {new Intl.NumberFormat("fa-IR-u-nu-arabext").format(
                        product.price,
                      )}{" "}
                      تومان
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <div className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D9E600]"
          >
            بازگشت به صفحه اصلی
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
