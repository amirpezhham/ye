import { Outlet } from "react-router-dom"

import { AnnouncementBar } from "@/components/layout/AnnouncementBar"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export function StoreLayout() {
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
