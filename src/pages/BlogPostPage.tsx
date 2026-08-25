import { Link, useParams } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"

import { getPosts } from "@/admin/components/post-storage"

function formatDate(timestamp: number) {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-nu-arabext", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(timestamp))
  } catch {
    return ""
  }
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = getPosts().find((item) => item.slug === slug)

  if (!post) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-white"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black">پست پیدا نشد</h1>

          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
          >
            بازگشت به وبلاگ
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] text-white"
    >
      <article>
        <div className="relative h-[320px] overflow-hidden bg-[#151814] sm:h-[420px]">
          <img
            src={post.image}
            alt={post.title}
            className="size-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F0D] via-[#0D0F0D]/40 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl px-6 py-12 lg:px-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D9E600]"
          >
            <ArrowRight className="size-4" />
            بازگشت به وبلاگ
          </Link>

          <h1 className="mt-6 text-3xl font-black sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {formatDate(post.createdAt)}
          </p>

          <div className="mt-8 whitespace-pre-line text-base leading-9 text-white/65 sm:text-lg">
            {post.body}
          </div>
        </motion.div>
      </article>
    </main>
  )
}
