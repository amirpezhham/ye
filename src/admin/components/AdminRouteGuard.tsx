import { Navigate, Outlet } from "react-router-dom"

import { isAuthenticated } from "@/admin/components/auth-storage"

export function AdminRouteGuard() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
