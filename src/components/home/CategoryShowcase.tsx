import {
  ArrowLeft,
  Cigarette,
  Flame,
  GlassWater,
  Sparkles,
  Wind,
  Coffee,
  Wrench,
} from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"

import { useCategories } from "@/context/CategoriesContext"

const iconPool = [
  Cigarette,
  Wind,
  GlassWater,
  Sparkles,
  Flame,
  Sparkles,
  Wrench,
  Coffee,
]

function categoryIcon(index: number) {
  return iconPool[index % iconPool.length]
}

function formatIndex(index: number) {
  return new Intl.NumberFormat("fa-IR-u-nu-arabext", {
    minimumIntegerDigits: 2,
  }).format(index + 1)
}

export function CategoryShowcase() {
  const { categories, error } = useCategories()

  return (
    <section id="categories" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
              EXPLORE OUR WORLD
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              دنیای یه دود ۲ دود
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              از محصولات اسموک‌شاپ تا اکسسوری‌های خاص؛ انتخابت را پیدا کن.
            </p>
          </div>

          <Link
            to="/products"
            className="group flex w-fit items-center gap-2 text-sm font-bold text-[#D9E600]"
          >
            مشاهده همه دسته‌بندی‌ها

            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </motion.div>


        {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((category, index) => {
            const Icon = categoryIcon(index)

            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.07,
                }}
                whileHover={{ y: -7 }}
                className="group relative h-[370px] overflow-hidden rounded-2xl border border-white/10 bg-[#11140F]"
              >

                {/* Image */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${category.image}")`,
                  }}
                  whileHover={{ scale: 1.07 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                {/* Base Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(95,143,53,0.20),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />


                {/* Number */}
                <div className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[11px] font-bold text-white/40 backdrop-blur-md">
                  {formatIndex(index)}
                </div>


                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-7">

                  {/* Icon */}
                  <motion.div
                    className="mb-4 flex size-11 items-center justify-center rounded-xl border border-[#D9E600]/20 bg-black/35 text-[#D9E600] backdrop-blur-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="size-5" />
                  </motion.div>


                  {/* Title */}
                  <h3 className="text-2xl font-black text-white">
                    {category.name}
                  </h3>


                  {/* Description */}
                  <p className="mt-2 text-sm text-white/60">
                    {category.description}
                  </p>


                  {/* Link */}
                  <Link
                    to={`/products/${category.slug}`}
                    className="mt-5 flex items-center gap-2 text-sm font-bold text-white transition-colors duration-300 group-hover:text-[#D9E600]"
                  >
                    مشاهده محصولات

                    <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>

                </div>


                {/* Bottom Accent */}
                <motion.div
                  className="absolute bottom-0 right-0 h-1 bg-[#D9E600]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />

              </motion.article>
            )
          })}

        </div>

      </div>
    </section>
  )
}