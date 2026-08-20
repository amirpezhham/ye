import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Home } from "@/pages/Home"
import { CategoryPage } from "@/pages/CategoryPage"
import { ProductDetails } from "@/pages/ProductDetails"
import { CartPage } from "@/pages/CartPage"

import { AdminDashboard } from "@/admin/pages/AdminDashboard"
import { AdminProducts } from "@/admin/pages/AdminProducts"
import { AdminAddProduct } from "@/admin/pages/AdminAddProduct"

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
          path="/product/:slug"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
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
      </Routes>
    </BrowserRouter>
  )
}