import { motion } from "motion/react"

export interface ProductFilterCategory {
  label: string
  value: string
}

interface ProductFiltersProps {
  categories: ProductFilterCategory[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function ProductFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <div
      dir="rtl"
      className="mb-8 overflow-x-auto pb-2 scrollbar-none"
    >
      <div className="flex min-w-max items-center gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.value

          return (
            <motion.button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              whileTap={{ scale: 0.96 }}
              className={`relative overflow-hidden rounded-xl border px-5 py-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "border-[#D9E600] bg-[#D9E600] text-[#0D0F0D]"
                  : "border-white/10 bg-[#151814] text-white/60 hover:border-[#A8B86B]/40 hover:bg-[#1C211B] hover:text-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-product-filter"
                  className="absolute inset-0 bg-[#D9E600]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative z-10">
                {category.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}