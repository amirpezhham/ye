import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const slides = [
  {
    id: "۰۱",
    title: "یه دود ۲ دود",
    description:
      "تجربه‌ای متفاوت از خرید محصولات اسموک‌شاپ، قهوه و فضای آرام یه دود ۲ دود.",
    image: "/images/hero/hero-01.jpg",
  },
  {
    id: "۰۳",
    title: "دنیای محصولات اسموک شاپ",
    description:
      "انواع تنباکو، ویپ، قلیان، ذغال و اکسسوری‌های حرفه‌ای با انتخابی متفاوت.",
    image: "/images/hero/hero-03.jpg",
  },
  {
    id: "۰۲",
    title: "قهوه‌ای برای یک مکث متفاوت",
    description:
      "قهوه‌های منتخب برای یک توقف کوتاه و تجربه‌ای متفاوت در فضای یه دود ۲ دود.",
    image: "/images/hero/hero-02.jpg",
  },
  {
    id: "۰۴",
    title: "اکسسوری‌های خاص",
    description:
      "جزئیات حرفه‌ای برای کسانی که به انتخاب و کیفیت اهمیت می‌دهند.",
    image: "/images/hero/hero-04.jpg",
  },
]

const AUTOPLAY_DELAY = 4800

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()

  const nextSlide = () => {
    setCurrent((previous) => (previous + 1) % slides.length)
  }

  const previousSlide = () => {
    setCurrent(
      (previous) => (previous - 1 + slides.length) % slides.length,
    )
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length)
    }, AUTOPLAY_DELAY)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const slide = slides[current]

  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-[#0D0F0D] sm:min-h-[600px] lg:min-h-[680px]">
      {/* =========================================================
          BACKGROUND IMAGE
      ========================================================= */}

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0 -z-20 overflow-hidden"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src={slide.image}
            alt=""
            aria-hidden="true"
            fetchPriority={current === 0 ? "high" : "auto"}
            className="absolute inset-0 h-full w-full object-cover object-center"
            initial={{
              scale: shouldReduceMotion ? 1 : 1.015,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* =========================================================
          LIGHT OVERLAY
          فقط برای خوانایی متن؛ بدون هاله زرد
      ========================================================= */}

      <div className="absolute inset-0 -z-10 bg-black/25" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-l from-black/55 via-black/15 to-black/30" />

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20 sm:min-h-[600px] lg:min-h-[680px] lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="max-w-2xl"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -8,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Category */}

            <motion.div
              className="mb-5 flex items-center gap-3"
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.05,
                duration: 0.35,
              }}
            >
              <span className="h-px w-10 bg-primary" />

              <span className="text-xs font-medium tracking-[0.25em] text-white/80">
                SMOKE SHOP • COFFEE • LOUNGE
              </span>
            </motion.div>

            {/* Title */}

            <motion.h1
              className="text-4xl font-black leading-[1.2] tracking-tight text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl"
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {slide.title}
            </motion.h1>

            {/* Description */}

            <motion.p
              className="mt-5 max-w-lg text-sm leading-7 text-white/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-base"
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.13,
                duration: 0.4,
              }}
            >
              {slide.description}
            </motion.p>

            {/* Buttons */}

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.18,
                duration: 0.4,
              }}
            >
              <motion.button
                type="button"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.03,
                      }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.98,
                      }
                }
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-[0_8px_30px_rgba(210,220,0,0.10)] transition-colors duration-300 hover:bg-lime"
                onClick={() => navigate("/products")}
              >
                <ShoppingBag className="size-4" />

                مشاهده محصولات
              </motion.button>

              <motion.button
                type="button"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.03,
                      }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.98,
                      }
                }
                className="h-12 rounded-xl border border-white/25 bg-black/20 px-6 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-black"
                onClick={() => navigate("/products")}
              >
                دسته‌بندی‌ها
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================
          PREVIOUS
      ========================================================= */}

      <motion.button
        type="button"
        onClick={previousSlide}
        aria-label="اسلاید قبلی"
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.06,
              }
        }
        whileTap={
          shouldReduceMotion
            ? undefined
            : {
                scale: 0.94,
              }
        }
        className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm transition-all duration-300 hover:border-primary hover:text-primary sm:left-5"
      >
        <ChevronLeft className="size-5" />
      </motion.button>

      {/* =========================================================
          NEXT
      ========================================================= */}

      <motion.button
        type="button"
        onClick={nextSlide}
        aria-label="اسلاید بعدی"
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.06,
              }
        }
        whileTap={
          shouldReduceMotion
            ? undefined
            : {
                scale: 0.94,
              }
        }
        className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm transition-all duration-300 hover:border-primary hover:text-primary sm:right-5"
      >
        <ChevronRight className="size-5" />
      </motion.button>

      {/* =========================================================
          INDICATORS
      ========================================================= */}

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`رفتن به اسلاید ${item.id}`}
            animate={{
              width: current === index ? 30 : 8,
              opacity: current === index ? 1 : 0.45,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </section>
  )
}