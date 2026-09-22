export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  image: string
  createdAt: number
}

const STORAGE_KEY = "ye-dood-posts"
import { readStorage, writeStorage } from "@/lib/storage"
import { isPosts } from "@/lib/validation"

const defaultPosts: Post[] = [
  {
    id: "post-1",
    title: "تجربه قهوه در یه دود ۲ دود",
    slug: "coffee-experience",
    excerpt:
      "یک فنجان قهوه در فضای آرام Lounge چه حسی دارد؟ از انتخاب دانه تا لحظه نوشیدن.",
    body: "ما در یه دود ۲ دود باور داریم که یک مکث کوتاه می‌تواند روزتان را عوض کند. قهوه‌های منتخب ما با دقت انتخاب شده‌اند تا تجربه‌ای متفاوت از طعم و آرامش را برایتان رقم بزنند. فضای Lounge ما با بالکن و گوشه‌های نشستن، جایی است برای تنفس و لذت بردن از لحظه.",
    image: "/images/products/coffee-01.jpg",
    createdAt: new Date("2026-08-15T11:30:00").getTime(),
  },
]

export function getPosts(): Post[] {
  if (typeof window === "undefined") {
    return defaultPosts
  }

  return readStorage(STORAGE_KEY, defaultPosts, isPosts)
}

export function savePosts(posts: Post[]) {
  writeStorage(STORAGE_KEY, posts)
}

export function addPost(post: Post) {
  savePosts([post, ...getPosts()])
}

export function updatePost(updated: Post) {
  savePosts(
    getPosts().map((post) =>
      post.id === updated.id ? updated : post,
    ),
  )
}

export function deletePost(postId: string) {
  savePosts(
    getPosts().filter((post) => post.id !== postId),
  )
}
