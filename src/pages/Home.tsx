import { AnnouncementBar } from "@/components/layout/AnnouncementBar"
import { Header } from "@/components/layout/Header"
import { HeroSlider } from "@/components/home/HeroSlider"
import { ServiceBar } from "@/components/home/ServiceBar"
import { CategoryShowcase } from "@/components/home/CategoryShowcase"
import { ProductSection } from "@/components/products/ProductSection"

export function Home() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      <AnnouncementBar />

      <Header />

      <main>
        <HeroSlider />

        <ServiceBar />

        <CategoryShowcase />

        <ProductSection />
      </main>
    </div>
  )
}