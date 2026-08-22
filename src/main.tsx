import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"

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