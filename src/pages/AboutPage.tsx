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
import {
  getAboutContent,
  type AboutPillar,
} from "@/admin/components/content-storage"

const pillarIcons = [GlassWater, Coffee, Sparkles, Heart, Sun]

function pillarIcon(index: number) {
  return pillarIcons[index % pillarIcons.length]
}

export function AboutPage() {
  const { products } = useProducts()
  const content = getAboutContent()

  const featured = products.slice(0, 3)

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#11140F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,230,0,0.06),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]"
          >
            ABOUT US
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            {content.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg"
          >
            {content.heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              WHAT WE ARE
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              سه ستون برند ما
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {content.pillars.map((pillar: AboutPillar, index) => {
              const Icon = pillarIcon(index)

              return (
                <motion.article
                  key={pillar.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="rounded-2xl border border-white/10 bg-[#151814] p-7"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl border border-[#D9E600]/20 bg-[#D9E600]/10 text-[#D9E600]">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/45">
                    {pillar.description}
                  </p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Brand story + image */}
      <section className="border-t border-white/10 bg-[#0F110F] px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              OUR STORY
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              {content.storyTitle}
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-8 text-white/55 sm:text-base">
              {content.storyText}
            </p>

            <Link
              to="/lounge"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#D9E600]"
            >
              مشاهده فضای مجموعه
              <ArrowLeft className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {featured.length > 0 ? (
              featured.map((product) => (
                <div
                  key={product.id}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 aspect-video rounded-2xl border border-white/10 bg-[#151814]" />
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition hover:bg-lime"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    </main>
  )
}
