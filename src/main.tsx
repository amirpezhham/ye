import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"

import { CartProvider } from "@/context/CartContext"
import { OrderProvider } from "@/context/OrderContext"
import { ProductsProvider } from "@/context/ProductsContext"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductsProvider>
      <CartProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </CartProvider>
    </ProductsProvider>
  </StrictMode>,
)