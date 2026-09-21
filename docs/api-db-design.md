# سند طراحی — قرارداد API و مدل دیتابیس (ye Dood 2 dood)

> وضعیت: **طراحی / پیش‌نویس**. هنوز پیاده‌سازی نشده.
> هدف: وقتی هاست و دامین گرفته شد، این سند نقشه‌راه جایگزینی لایه `localStorage` با Backend/Database باشد.
> نکته کلیدی: تمام فیلدها از اینترفیس‌های فعلی فرانت‌اند استخراج شده‌اند تا مهاجرت بدون تغییر ساختار مدل‌ها انجام شود.

---

## ۱. معماری هدف

```
Frontend (React)  ──HTTP/JSON──▶  API (REST)  ──▶  Backend (Node/Express یا ...)
                                                  │
                                                  ├──▶  Database (Postgres / SQLite / ...)
                                                  └──▶  Storage (S3 / Cloudinary)  ──▶  URL

Admin  ──انتخاب عکس──▶  POST /api/upload  ──▶  Storage  ──▶  URL  ──▶  ذخیره در products.image
```

- فرانت‌اند تغییر کمی می‌بیند؛ فقط بدنهٔ توابع استوریج (مثلاً `getProducts`) از `localStorage` به `fetch('/api/...')` عوض می‌شود.
- تصاویر: به‌جای dataURL، **آدرس URL** ذخیره می‌شود.

---

## ۲. مدل دیتابیس (جداول)

انواع پیشنهادی: `string` = متن کوتاه، `text` = متن بلند، `int` = عدد صحیح، `numeric` = اعشاری، `bool` = بولی، `jsonb` = آرایه/آبجکت، `timestamp` = زمان.

### ۲.۱ `categories`
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | شناسه یکتا |
| name | string | نام فارسی (سیگار، قلیان، ...) |
| slug | string (unique) | آدرس: `/products/:slug` |
| description | text | توضیح کوتاه |
| image | string | URL تصویر (از Storage) |
| created_at / updated_at | timestamp | |

### ۲.۲ `products`
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| name | string | |
| slug | string (unique) | آدرس محصول `/product/:slug` |
| category_id | string (FK → categories.id) | دسته‌بندی |
| category_slug | string | برای سازگاری مسیر فعلی |
| description | text | |
| price | int | قیمت (تومان) |
| old_price | int (nullable) | قیمت قبلی/تخفیف |
| image | string | URL تصویر اصلی |
| images | jsonb (nullable) | گالری تصاویر (آرایه URL) |
| status | enum | `in-stock` / `low-stock` / `out-of-stock` |
| badge | enum (nullable) | `new` / `popular` / `sale` / `featured` |
| brand | string (nullable) | |
| sku | string (nullable) | کد محصول |
| stock | int | موجودی انبار |
| rating | numeric (nullable) | امتیاز |
| review_count | int (nullable) | تعداد نظر |
| featured | bool | نمایش در پیشنهاد ویژه |
| seo_title | string (nullable) | عنوان سئو |
| seo_description | string (nullable) | توضیح سئو |
| created_at / updated_at | timestamp | |

### ۲.۳ `orders`
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| full_name | string | نام مشتری |
| phone | string | |
| address | text | |
| note | text (nullable) | |
| total_items | int | تعداد کل کالا |
| total_price | int | مبلغ کل (تومان) |
| status | enum | `new` / `reviewing` / `ready` / `shipped` / `delivered` / `cancelled` |
| customer_id | string (FK → customers.id, nullable) | اختیاری |
| created_at | timestamp | |

### ۲.۴ `order_items` (جدول واسط — مهم)
هر آیتم سفارش **snap-shot** می‌شود تا اگر محصول بعداً تغییر قیمت/حذف شد، سفارش تاریخچهٔ خودش را حفظ کند.
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| order_id | string (FK → orders.id) | |
| product_id | string (FK → products.id, nullable) | |
| quantity | int | |
| unit_price | int | قیمت لحظهٔ سفارش |
| name | string | نام لحظهٔ سفارش |
| image | string | URL تصویر لحظهٔ سفارش |

### ۲.۵ `customers`
در نسخه فعلی مشتری‌ها از روی سفارش‌ها (بر اساس شماره تلفن) استخراج می‌شوند. برای نسخه واقعی پیشنهاد: جدول مجزا + اتصال `orders.customer_id`.
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| name | string | |
| phone | string (unique) | |
| created_at | timestamp | |

### ۲.۶ `posts` (بلاگ)
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| title | string | |
| slug | string (unique) | `/blog/:slug` |
| excerpt | text | خلاصه |
| body | text | متن کامل |
| image | string | URL تصویر |
| created_at | timestamp | |

### ۲.۷ `settings` (تنظیمات سایت)
یک جدول key-value با مقدار JSON:
| ستون | نوع | توضیح |
|---|---|---|
| key | string (unique) | مثلاً `seo` / `about` |
| value | jsonb | محتوای گروه |

- گروه `seo`: `siteTitle`, `siteDescription`, `ogImage` (URL), `homeTitle`, `homeDescription`.
- گروه `about`: `heroTitle`, `heroDescription`, `storyTitle`, `storyText`, `pillars` (آرایه `{id,title,description}`).

### ۲.۸ `admins` (احراز هویت)
| ستون | نوع | توضیح |
|---|---|---|
| id | string (PK) | |
| username | string (unique) | |
| password_hash | string | هش رمز (هرگز رمز خام) |
| created_at | timestamp | |

---

## ۳. استراتژی تصاویر (Storage)

جریان آپلود واقعی:
1. ادمین در فرم محصول/پست/SEO عکس را انتخاب می‌کند.
2. فرانت‌اند عکس را با `POST /api/upload` (فرمت `multipart/form-data`) می‌فرستد.
3. بک‌اند عکس را در Storage (مثل S3/Cloudinary) ذخیره می‌کند و یک **URL عمومی** برمی‌گرداند: `{ "url": "https://cdn.example.com/products/abc.jpg" }`.
4. آن URL در ستون `image` (یا `images`) محصول/پست ذخیره می‌شود.
5. فرانت‌اند دیگر نیازی ندارد فایل را دستی در پروژه بگذارد.

> فیلد `image` در همه مدل‌ها از نوع `string` است و هم URL ریموت را قبول می‌کند هم (در حالت تست) dataURL — پس تغییری در نوع داده لازم نیست.

---

## ۴. قرارداد API (API Contract)

**Base URL:** `https://api.yedood.com/api` (در حالت تست محلی: `http://localhost:PORT/api`)
**فرمت:** JSON. **احراز هویت ادمین:** Bearer Token (JWT) در هدر `Authorization`.

### ۴.۱ پاسخ خطا (یکسان)
```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "محصول یافت نشد" } }
```
وضعیت‌های رایج: `400` (ورودی نامعتبر)، `401` (احراز هویت)، `403` (دسترسی)، `404`، `500`.

### ۴.۲ عمومی (فروشگاه — بدون توکن)
| متد | مسیر | توضیح | پاسخ |
|---|---|---|---|
| GET | `/products?category=&search=&page=` | لیست محصولات | `{ items: Product[], total }` |
| GET | `/products/:slug` | یک محصول | `Product` |
| GET | `/categories` | لیست دسته‌بندی‌ها | `Category[]` |
| POST | `/orders` | ثبت سفارش (تسویه) | `{ id }` |
| GET | `/posts` | لیست پست‌های بلاگ | `Post[]` |
| GET | `/posts/:slug` | یک پست | `Post` |
| GET | `/settings/seo` | تنظیمات سئو | `SeoSettings` |
| GET | `/settings/about` | محتوای درباره ما | `AboutContent` |

### ۴.۳ ادمین (نیاز به توکن)
| متد | مسیر | توضیح |
|---|---|---|
| POST | `/admin/login` | ورود `{username,password}` → `{token}` |
| POST | `/admin/logout` | خروج |
| GET/POST | `/admin/products` | لیست / ایجاد محصول |
| GET/PUT/DELETE | `/admin/products/:id` | خواندن/ویرایش/حذف محصول |
| GET/POST | `/admin/categories` | دسته‌بندی‌ها |
| GET/PUT/DELETE | `/admin/categories/:id` | دسته‌بندی |
| GET | `/admin/orders` | لیست سفارش‌ها |
| GET/PATCH | `/admin/orders/:id` (status) | سفارش / تغییر وضعیت |
| GET | `/admin/customers` | لیست مشتری‌ها |
| GET/POST | `/admin/posts` | پست‌ها |
| GET/PUT/DELETE | `/admin/posts/:id` | پست |
| GET/PUT | `/admin/settings/seo` | تنظیمات سئو |
| GET/PUT | `/admin/settings/about` | درباره ما |
| POST | `/upload` | آپلود عکس (multipart) → `{url}` |

### ۴.۴ نمونه درخواست ثبت سفارش
```http
POST /api/orders
Content-Type: application/json

{
  "fullName": "علی محمدی",
  "phone": "09123456789",
  "address": "تهران، ...",
  "note": "",
  "items": [ { "productId": "p-1", "quantity": 2 } ]
}
```
```json
// 201 Created
{ "id": "ord-2026-0001" }
```

---

## ۵. نگاشت به کد فعلی (برای جایگزینی)

وقتی بک‌اند آماده شد، فقط این فایل‌ها را لمس می‌کنید — بقیه سایت دست‌نخورده می‌ماند:

| فایل فعلی (localStorage) | جایگزین در بک‌اند |
|---|---|
| `src/admin/components/product-storage.ts` | `/api/products` + `/api/admin/products` |
| `src/admin/components/category-storage.ts` | `/api/categories` + `/api/admin/categories` |
| `src/admin/components/order-storage.ts` | `POST /api/orders` + `/api/admin/orders` |
| `src/admin/components/post-storage.ts` | `/api/posts` + `/api/admin/posts` |
| `src/admin/components/seo-storage.ts` | `/api/settings/seo` |
| `src/admin/components/content-storage.ts` | `/api/settings/about` |
| `src/admin/components/auth-storage.ts` | `/api/admin/login` + جدول `admins` |

الگوی جایگزینی (مثال برای محصولات):
```ts
// قبل (mock)
export function getProducts() {
  return JSON.parse(localStorage.getItem("ye-dood-products") ?? "[]")
}

// بعد (واقعی)
export async function getProducts() {
  const res = await fetch("/api/products")
  if (!res.ok) throw new Error("load failed")
  return (await res.json()).items
}
```
اسم توابع و جایی که صدا زده می‌شوند ثابت می‌ماند → فقط بدنه عوض می‌شود.

---

## ۶. گام‌های پیشنهادی پیاده‌سازی (بعد از دریافت هاست)
1. انتخاب استک (مثلاً Node + Express + Postgres، یا سرویس آماده مثل Supabase/Firebase).
2. ساخت جداول بر اساس بخش ۲ (میگریشن/SQL).
3. پیاده‌سازی اندپوینت‌های بخش ۴.
4. اتصال Storage و اندپوینت `/upload`.
4. جایگزینی بدنهٔ استوریج‌های بخش ۵ با `fetch`.
5. انتقال داده‌های تست `localStorage` به دیتابیس (seed/migration).
6. فعال‌سازی احراز هویت واقعی (JWT) و انتقال توکن به محیط امن.
