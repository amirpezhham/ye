import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { AnnouncementBar } from "@/components/layout/AnnouncementBar"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { setSeoMeta } from "@/lib/seo"
import { getSeoSettings } from "@/admin/components/seo-storage"

export function StoreLayout() {
  const location = useLocation()

  useEffect(() => {
    const seo = getSeoSettings()

    setSeoMeta({
      title: seo.siteTitle,
      description: seo.siteDescription,
      image: seo.ogImage,
      url: window.location.href,
    })
  }, [location.pathname])

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-[#0D0F0D]">
      <AnnouncementBar />

      <Header />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}
