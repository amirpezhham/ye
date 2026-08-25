import { Link } from "react-router-dom"
import {
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react"

const siteLinks = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/shop" },
  { label: "دستهبندیها", href: "/products" },
  { label: "درباره ما", href: "/about" },
  { label: "فضای ما", href: "/lounge" },
  { label: "وبلاگ", href: "/blog" },
]

const socials = [
  { icon: Globe, label: "اینستاگرام", href: "#" },
  { icon: MessageCircle, label: "تلگرام", href: "#" },
  { icon: Send, label: "سروش", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0F110F] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-4 lg:px-8">
        {/* Column 1: Logo + intro */}
        <div>
          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src="/images/logo.jpg"
              alt="یه دود ۲ دود"
              className="h-11 w-auto rounded-lg object-contain"
            />
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/45">
            تجربه‌ای متفاوت از خرید محصولات اسموک‌شاپ، قهوه و فضای
            آرام یه دود ۲ دود.
          </p>
        </div>

        {/* Column 2: Links */}
        <div>
          <h3 className="text-sm font-black text-white/80">
            لینک‌های سایت
          </h3>

          <ul className="mt-5 space-y-3">
            {siteLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm text-white/50 transition hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 className="text-sm font-black text-white/80">
            اطلاعات تماس
          </h3>

          <ul className="mt-5 space-y-4 text-sm text-white/50">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>تبریز — آدرس مجموعه یه دود ۲ دود</span>
            </li>

            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-primary" />
              <span dir="ltr">۰۴۱-۱۲۳۴۵۶۷۸</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-primary" />
              <span dir="ltr">info@yedood.com</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Social */}
        <div>
          <h3 className="text-sm font-black text-white/80">
            شبکه‌های اجتماعی
          </h3>

          <div className="mt-5 flex gap-3">
            {socials.map((social) => {
              const Icon = social.icon

              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-[#151814] text-white/60 transition hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-5" />
                </a>
              )
            })}
          </div>

          <p className="mt-5 text-xs leading-6 text-white/35">
            ما را در شبکه‌های اجتماعی دنبال کنید.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            © یه دود ۲ دود — تمامی حقوق محفوظ است.
          </span>

          <span>
            سازنده وب سایت Amir.P 1112
          </span>
        </div>
      </div>
    </footer>
  )
}
