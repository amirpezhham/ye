import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"

import "@fontsource/vazirmatn/400.css"
import "@fontsource/vazirmatn/500.css"
import "@fontsource/vazirmatn/700.css"
import "@fontsource/vazirmatn/900.css"

import { CartProvider } from "@/context/CartContext"
import { FavoritesProvider } from "@/context/FavoritesContext"
import { OrderProvider } from "@/context/OrderContext"
import { ProductsProvider } from "@/context/ProductsContext"
import { CategoriesProvider } from "@/context/CategoriesContext"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductsProvider>
      <CategoriesProvider>
        <CartProvider>
          <FavoritesProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </FavoritesProvider>
        </CartProvider>
      </CategoriesProvider>
    </ProductsProvider>
  </StrictMode>,
)