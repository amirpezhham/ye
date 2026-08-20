import {
  Coffee,
  Headphones,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"

const services = [
  {
    icon: Sparkles,
    title: "انتخاب متفاوت",
    description: "محصولات منتخب اسموک‌شاپ",
  },
  {
    icon: ShieldCheck,
    title: "خرید مطمئن",
    description: "تجربه خرید امن و ساده",
  },
  {
    icon: Headphones,
    title: "پشتیبانی",
    description: "همراه شما در انتخاب",
  },
  {
    icon: Coffee,
    title: "قهوه تازه",
    description: "سرو قهوه داخل فروشگاه",
  },
]

export function ServiceBar() {
  return (
    <section className="border-y border-white/10 bg-[#171A16]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 rtl:divide-x-reverse lg:grid-cols-4">
        {services.map((service, index) => {
          const Icon = service.icon

          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              className="group flex items-center gap-4 px-5 py-6 transition-colors duration-300 hover:bg-[#20251D] sm:px-7"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#A8B86B]/20 bg-[#A8B86B]/10 text-[#D9E600] transition-all duration-300 group-hover:border-[#D9E600]/40 group-hover:bg-[#D9E600]/10">
                <Icon className="size-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white">
                  {service.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/50">
                  {service.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}