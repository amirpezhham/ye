import { Link } from "react-router-dom"
import { ArrowRight, Edit3, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  getPosts,
  deletePost,
} from "@/admin/components/post-storage"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export function AdminPosts() {
  const [posts, setPosts] = useState(() => getPosts())
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function handleDelete(postId: string) {
    deletePost(postId)
    setPosts(getPosts())
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-[#D9E600]"
        >
          <ArrowRight className="size-4" />
          بازگشت به پنل
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#A8B86B]">
              POSTS
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              مدیریت پست‌ها
            </h1>

            <p className="mt-3 text-sm text-white/40">
              پست‌های وبلاگ را مدیریت کنید.
            </p>
          </div>

          <Link
            to="/admin/posts/new"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D9E600] px-5 font-black text-[#0D0F0D] transition hover:bg-[#E4EF00]"
          >
            <Plus className="size-5" />
            افزودن پست
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {posts.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#151814] p-8 text-center text-white/40">
              هنوز پستی ندارید.
            </div>
          )}

          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151814] p-4"
            >
              <img
                src={post.image}
                alt={post.title}
                className="size-16 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-black">
                  {post.title}
                </h2>

                <p className="mt-1 line-clamp-1 text-xs text-white/40">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/posts/${post.id}/edit`}
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-[#D9E600]/30 hover:text-[#D9E600]"
                  aria-label={`ویرایش ${post.title}`}
                >
                  <Edit3 className="size-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setPendingDelete(post.id)}
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-red-500/30 hover:text-red-400"
                  aria-label={`حذف ${post.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف پست؟"
        message="این پست از وبلاگ حذف می‌شود. آیا مطمئن هستید؟"
        confirmLabel="حذف پست"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            handleDelete(pendingDelete)
          }
          setPendingDelete(null)
        }}
      />
    </main>
  )
}
