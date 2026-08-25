import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Home } from "@/pages/Home"
import { CategoryPage } from "@/pages/CategoryPage"
import { ProductDetails } from "@/pages/ProductDetails"
import { CartPage } from "@/pages/CartPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { FavoritesPage } from "@/pages/FavoritesPage"
import { CheckoutPage } from "@/pages/CheckoutPage"
import { OrderSuccessPage } from "@/pages/OrderSuccessPage"
import { SearchPage } from "@/pages/SearchPage"
import { LoungePage } from "@/pages/LoungePage"
import { AboutPage } from "@/pages/AboutPage"
import { BlogPage } from "@/pages/BlogPage"
import { BlogPostPage } from "@/pages/BlogPostPage"

import { StoreLayout } from "@/components/layout/StoreLayout"
import { AdminLayout } from "@/admin/components/AdminLayout"

import { AdminDashboard } from "@/admin/pages/AdminDashboard"
import { AdminProducts } from "@/admin/pages/AdminProducts"
import { AdminAddProduct } from "@/admin/pages/AdminAddProduct"
import { AdminEditProduct } from "@/admin/pages/AdminEditProduct"
import { AdminAbout } from "@/admin/pages/AdminAbout"
import { AdminPosts } from "@/admin/pages/AdminPosts"
import { AdminPostEditor } from "@/admin/pages/AdminPostEditor"
import { AdminOrders } from "@/admin/pages/AdminOrders"
import { AdminOrderDetail } from "@/admin/pages/AdminOrderDetail"
import { AdminCustomers } from "@/admin/pages/AdminCustomers"
import { AdminCategories } from "@/admin/pages/AdminCategories"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<StoreLayout />}
        >
          <Route
            path="/"
            element={<Home />}
          />

                    <Route
            path="/shop"
            element={<ProductsPage />}
          />

          <Route
            path="/products"
            element={<CategoryPage />}
          />

          <Route
            path="/products/:categorySlug"
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
            path="/favorites"
            element={<FavoritesPage />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/lounge"
            element={<LoungePage />}
          />

          <Route
            path="/about"
            element={<AboutPage />}
          />

          <Route
            path="/blog"
            element={<BlogPage />}
          />

          <Route
            path="/blog/:slug"
            element={<BlogPostPage />}
          />

          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />

          <Route
            path="/order-success/:orderId"
            element={<OrderSuccessPage />}
          />
        </Route>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="products/new"
            element={<AdminAddProduct />}
          />

          <Route
            path="products/:productId/edit"
            element={<AdminEditProduct />}
          />

          <Route
            path="about"
            element={<AdminAbout />}
          />

          <Route
            path="posts"
            element={<AdminPosts />}
          />

          <Route
            path="posts/new"
            element={<AdminPostEditor />}
          />

          <Route
            path="posts/:postId/edit"
            element={<AdminPostEditor />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="orders/:orderId"
            element={<AdminOrderDetail />}
          />

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}