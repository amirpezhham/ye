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


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductsProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </FavoritesProvider>
      </CartProvider>
    </ProductsProvider>
  </StrictMode>,
)