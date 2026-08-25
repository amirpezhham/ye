import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { useCart } from "@/context/CartContext"
import { useFavorites } from "@/context/FavoritesContext"


const navigation = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/products" },
  { label: "دسته‌بندی‌ها", href: "/products" },
  { label: "فضای ما", href: "/lounge" },
  { label: "درباره ما", href: "/about" },
]


export function Header() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { totalItems } = useCart()
  const { ids: favoriteIds } = useFavorites()

  const cartCount = totalItems
  const favoriteCount = favoriteIds.length


  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111311]/90 backdrop-blur-xl">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">


        {/* Logo */}

        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="یه دود ۲ دود"
        >

          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_25px_rgba(244,208,0,0.12)] transition-transform duration-300 group-hover:scale-105">

            <span className="text-xl font-black">
              ۲
            </span>

          </div>


          <div className="hidden leading-none sm:block">

            <div className="text-lg font-black tracking-tight">

              یه دود
              <span className="text-primary">
                ۲
              </span>
              دود

            </div>


            <div className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground">

              SMOKE • COFFEE • LOUNGE

            </div>


          </div>

        </Link>



        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-1 lg:flex">

          {navigation.map((item)=>(
            <Link
              key={item.label}
              to={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-primary"
            >

              {item.label}

            </Link>
          ))}

        </nav>



        {/* Actions */}

        <div className="flex items-center gap-1">


          <Link
            to="/search"
            aria-label="جستجو"
            className="hidden size-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-primary sm:flex"
          >

            <Search className="size-[19px]" />

          </Link>



          <Link
            to="/favorites"
            aria-label="علاقه‌مندی‌ها"
            className="relative hidden size-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-primary sm:flex"
          >

            <Heart className="size-[19px]" />

            {favoriteCount > 0 && (

              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">

                {favoriteCount}

              </span>

            )}

          </Link>



          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-primary sm:flex"
          >

            <UserRound className="size-[19px]" />

          </button>




          {/* Cart */}

          <Link
            to="/cart"
            aria-label="سبد خرید"
            className="relative flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-primary hover:text-primary-foreground"
          >

            <ShoppingBag className="size-[19px]" />


            {cartCount > 0 && (

              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">

                {cartCount}

              </span>

            )}


          </Link>




          {/* Mobile Menu */}

          <button
            type="button"
            aria-label="منو"
            onClick={()=>setMobileMenuOpen(value=>!value)}
            className="ml-1 flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/5 hover:text-primary lg:hidden"
          >

            {
              mobileMenuOpen
              ?
              <X className="size-5"/>
              :
              <Menu className="size-5"/>
            }


          </button>


        </div>


      </div>




      {/* Mobile Navigation */}

      {
        mobileMenuOpen && (

          <div className="border-t border-white/10 bg-[#151815] px-4 py-4 lg:hidden">

            <nav className="mx-auto flex max-w-7xl flex-col gap-1">

              {
                navigation.map((item)=>(
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={()=>setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-right text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-primary"
                  >

                    {item.label}

                  </Link>
                ))
              }

            </nav>

          </div>

        )
      }


    </header>
  )
}