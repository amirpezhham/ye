import { Link } from "react-router-dom"
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

export function BlogPage() {
  const posts = getPosts()

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0D0F0D] px-6 py-12 text-white lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8B86B]">
            BLOG
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            وبلاگ یه دود ۲ دود
          </h1>

          <p className="mt-3 text-sm text-white/40">
            جدیدترین نوشته‌ها و تجربه‌های مجموعه.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#151814]"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block aspect-[16/10] overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="p-5">
                  <p className="text-xs text-white/40">
                    {formatDate(post.createdAt)}
                  </p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-2 block text-lg font-black transition hover:text-[#D9E600]"
                  >
                    {post.title}
                  </Link>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#151814] p-12 text-center text-white/40">
            هنوز پستی منتشر نشده است.
          </div>
        )}
      </div>
    </main>
  )
}
