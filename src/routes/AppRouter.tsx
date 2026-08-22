import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Home } from "@/pages/Home"
import { CategoryPage } from "@/pages/CategoryPage"
import { ProductDetails } from "@/pages/ProductDetails"
import { CartPage } from "@/pages/CartPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { FavoritesPage } from "@/pages/FavoritesPage"
import { CheckoutPage } from "@/pages/CheckoutPage"
import { OrderSuccessPage } from "@/pages/OrderSuccessPage"

import { AdminDashboard } from "@/admin/pages/AdminDashboard"
import { AdminProducts } from "@/admin/pages/AdminProducts"
import { AdminAddProduct } from "@/admin/pages/AdminAddProduct"
import { AdminEditProduct } from "@/admin/pages/AdminEditProduct"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/category/:categorySlug"
          element={<CategoryPage />}
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/product/:slug"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
        />

        <Route
          path="/favorites"
          element={<FavoritesPage />}
        />

        <Route
          path="/checkout"
          element={<CheckoutPage />}
        />

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccessPage />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/products/new"
          element={<AdminAddProduct />}
        />

        <Route
          path="/admin/products/:productId/edit"
          element={<AdminEditProduct />}
        />
      </Routes>
    </BrowserRouter>
  )
}