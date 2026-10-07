import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { Category } from "@/admin/components/category-storage"
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"

interface CategoriesContextValue {
  categories: Category[]
  loading: boolean
  error: string
  addCategory: (category: Category) => Promise<void>
  updateCategory: (category: Category) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    const result = await apiGet<Category[]>("/categories")
    setCategories(result)
    setError("")
  }, [])

  useEffect(() => {
    void Promise.resolve()
      .then(refresh)
      .catch((loadError: unknown) => {
        console.error("دریافت دسته‌بندی‌ها از سرور ناموفق بود.", loadError)
        setError(loadError instanceof Error ? loadError.message : "دریافت دسته‌بندی‌ها ناموفق بود.")
      })
      .finally(() => setLoading(false))
  }, [refresh])

  const addCategory = useCallback(async (category: Category) => {
    const created = await apiPost<Category>("/admin/categories", category)
    setCategories((current) => [...current, created])
  }, [])

  const updateCategory = useCallback(async (category: Category) => {
    const updated = await apiPut<Category>(`/admin/categories/${encodeURIComponent(category.id)}`, category)
    setCategories((current) => current.map((item) => item.id === updated.id ? updated : item))
  }, [])

  const deleteCategory = useCallback(async (categoryId: string) => {
    await apiDelete(`/admin/categories/${encodeURIComponent(categoryId)}`)
    setCategories((current) => current.filter((item) => item.id !== categoryId))
  }, [])

  const value = useMemo(
    () => ({ categories, loading, error, addCategory, updateCategory, deleteCategory }),
    [categories, loading, error, addCategory, updateCategory, deleteCategory],
  )
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) throw new Error("useCategories must be used inside CategoriesProvider")
  return context
}
