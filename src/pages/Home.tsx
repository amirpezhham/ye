import { useEffect } from "react"

import { HeroSlider } from "@/components/home/HeroSlider"
import { ServiceBar } from "@/components/home/ServiceBar"
import { CategoryShowcase } from "@/components/home/CategoryShowcase"
import { ProductSection } from "@/components/products/ProductSection"
import { setSeoMeta } from "@/lib/seo"
import { getSeoSettings } from "@/admin/components/seo-storage"

export function Home() {
  const seo = getSeoSettings()

  useEffect(() => {
    setSeoMeta({
      title: seo.homeTitle || seo.siteTitle,
      description: seo.homeDescription || seo.siteDescription,
      image: seo.ogImage,
    })
  }, [seo.homeTitle, seo.siteTitle, seo.homeDescription, seo.siteDescription, seo.ogImage])

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      <main>
        <HeroSlider />

        <ServiceBar />

        <CategoryShowcase />

        <ProductSection />
      </main>
    </div>
  )
}