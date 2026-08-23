import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import type { Post } from "@/admin/components/post-storage"
import {
  getPosts,
  addPost,
  updatePost,
} from "@/admin/components/post-storage"
import { PostForm } from "@/admin/components/PostForm"

export function AdminPostEditor() {
  const navigate = useNavigate()
  const { postId } = useParams()

  const post = postId
    ? getPosts().find((item) => item.id === postId)
    : undefined

  const isEdit = Boolean(post)

  function handleSubmit(saved: Post) {
    if (isEdit) {
      updatePost(saved)
    } else {
      addPost(saved)
    }

    navigate("/admin/posts")
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/posts"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به پست‌ها
        </Link>

        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
            {isEdit ? "EDIT POST" : "NEW POST"}
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {isEdit ? "ویرایش پست" : "افزودن پست جدید"}
          </h1>
        </div>

        <PostForm
          initialPost={post}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? "ذخیره تغییرات" : "انتشار پست"}
        />
      </div>
    </main>
  )
}
