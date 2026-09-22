import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

const Home = lazy(() => import("@/pages/Home").then((module) => ({ default: module.Home })))
const CategoryPage = lazy(() => import("@/pages/CategoryPage").then((module) => ({ default: module.CategoryPage })))
const ProductDetails = lazy(() => import("@/pages/ProductDetails").then((module) => ({ default: module.ProductDetails })))
const CartPage = lazy(() => import("@/pages/CartPage").then((module) => ({ default: module.CartPage })))
const ProductsPage = lazy(() => import("@/pages/ProductsPage").then((module) => ({ default: module.ProductsPage })))
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage").then((module) => ({ default: module.FavoritesPage })))
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then((module) => ({ default: module.CheckoutPage })))
const OrderSuccessPage = lazy(() => import("@/pages/OrderSuccessPage").then((module) => ({ default: module.OrderSuccessPage })))
const SearchPage = lazy(() => import("@/pages/SearchPage").then((module) => ({ default: module.SearchPage })))
const LoungePage = lazy(() => import("@/pages/LoungePage").then((module) => ({ default: module.LoungePage })))
const AboutPage = lazy(() => import("@/pages/AboutPage").then((module) => ({ default: module.AboutPage })))
const BlogPage = lazy(() => import("@/pages/BlogPage").then((module) => ({ default: module.BlogPage })))
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage").then((module) => ({ default: module.BlogPostPage })))

import { StoreLayout } from "@/components/layout/StoreLayout"
import { AdminLayout } from "@/admin/components/AdminLayout"

const AdminDashboard = lazy(() => import("@/admin/pages/AdminDashboard").then((module) => ({ default: module.AdminDashboard })))
const AdminProducts = lazy(() => import("@/admin/pages/AdminProducts").then((module) => ({ default: module.AdminProducts })))
const AdminAddProduct = lazy(() => import("@/admin/pages/AdminAddProduct").then((module) => ({ default: module.AdminAddProduct })))
const AdminEditProduct = lazy(() => import("@/admin/pages/AdminEditProduct").then((module) => ({ default: module.AdminEditProduct })))
const AdminAbout = lazy(() => import("@/admin/pages/AdminAbout").then((module) => ({ default: module.AdminAbout })))
const AdminPosts = lazy(() => import("@/admin/pages/AdminPosts").then((module) => ({ default: module.AdminPosts })))
const AdminPostEditor = lazy(() => import("@/admin/pages/AdminPostEditor").then((module) => ({ default: module.AdminPostEditor })))
const AdminOrders = lazy(() => import("@/admin/pages/AdminOrders").then((module) => ({ default: module.AdminOrders })))
const AdminOrderDetail = lazy(() => import("@/admin/pages/AdminOrderDetail").then((module) => ({ default: module.AdminOrderDetail })))
const AdminCustomers = lazy(() => import("@/admin/pages/AdminCustomers").then((module) => ({ default: module.AdminCustomers })))
const AdminCategories = lazy(() => import("@/admin/pages/AdminCategories").then((module) => ({ default: module.AdminCategories })))
const AdminSeo = lazy(() => import("@/admin/pages/AdminSeo").then((module) => ({ default: module.AdminSeo })))
const AdminLogin = lazy(() => import("@/admin/pages/AdminLogin").then((module) => ({ default: module.AdminLogin })))
const AdminSettings = lazy(() => import("@/admin/pages/AdminSettings").then((module) => ({ default: module.AdminSettings })))
import { AdminRouteGuard } from "@/admin/components/AdminRouteGuard"
import { NotFoundPage } from "@/pages/NotFoundPage"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0D0F0D] text-[#D9E600]">
            در حال بارگذاری...
          </div>
        }
      >
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          element={<AdminRouteGuard />}
        >
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

            <Route
              path="seo"
              element={<AdminSeo />}
            />

            <Route
              path="settings"
              element={<AdminSettings />}
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}