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

const defaultPosts: Post[] = [
  {
    id: "post-1",
    title: "تجربه قهوه در یه دود ۲ دود",
    slug: "coffee-experience",
    excerpt:
      "یک فنجان قهوه در فضای آرام Lounge چه حسی دارد؟ از انتخاب دانه تا لحظه نوشیدن.",
    body: "ما در یه دود ۲ دود باور داریم که یک مکث کوتاه می‌تواند روزتان را عوض کند. قهوه‌های منتخب ما با دقت انتخاب شده‌اند تا تجربه‌ای متفاوت از طعم و آرامش را برایتان رقم بزنند. فضای Lounge ما با بالکن و گوشه‌های نشستن، جایی است برای تنفس و لذت بردن از لحظه.",
    image: "/images/products/coffee-01.jpg",
    createdAt: Date.now(),
  },
]

export function getPosts(): Post[] {
  if (typeof window === "undefined") {
    return defaultPosts
  }

  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return defaultPosts
  }

  try {
    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : defaultPosts
  } catch {
    return defaultPosts
  }
}

export function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
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
