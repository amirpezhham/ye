# راهنمای اجرای محلی و عیب‌یابی (Runbook)

این سند نتیجهٔ عیب‌یابی خطای **۵۰۲ روی `/api/products`** است و گام‌به‌گام نحوهٔ بالا آوردن کل پروژه (فرانت + API + دیتابیس) را ثبت می‌کند.

---

## ۱. چرا خطای ۵۰۲ می‌گیریم؟

`vite.config.ts` یک پروکسی دارد:

```
/api  →  http://localhost:4000
```

اگر سرور API روی پورت ۴۰۰۰ بالا نباشد، پروکسی Vite پاسخ می‌دهد:

```
HTTP/1.1 502 Bad Gateway
[vite] http proxy error: /api/products
Error: connect ECONNREFUSED 127.0.0.1:4000
```

یعنی **۵۰۲ از کد پروژه نیست**؛ نشانهٔ «بالا نبودن سرور API» است. پس همیشه اول از سلامت API مطمئن شوید:

```bash
curl -i http://localhost:4000/api/health   # باید 200 بدهد
```

### دو علتی که باعث بالا نیامدن API می‌شوند

1. **نبود فایل `.env`** — `server/config.ts` با Zod این متغیرها را اجباری می‌گیرد و بدون آن‌ها پروسه بلافاصله می‌افتد:
   ```
   ZodError: DATABASE_URL → expected string, received undefined
             SESSION_SECRET → expected string, received undefined
   ```
   (فایل `.env` در `.gitignore` است، پس روی مخزن ذخیره نمی‌شود و باید در هر محیط دستی ساخته شود.)
2. **نبود PostgreSQL** — حتی با `.env` معتبر، بدون دیتابیس در دسترس، API کار نمی‌کند.

> نکتهٔ مهم: `npm run dev` **فقط فرانت‌اند** را اجرا می‌کند و API را استارت نمی‌زند. اگر فقط این دستور را بزنید، همیشه ۵۰۲ می‌گیرید.

---

## ۲. بالا آوردن کامل پروژه

### گام ۱ — نصب و تنظیمات محیط

```bash
npm install
cp .env.example .env
```

سپس در `.env` مقدار `DATABASE_URL` و یک `SESSION_SECRET` تصادفی با حداقل ۳۲ کاراکتر بگذارید:

```bash
openssl rand -hex 24      # برای ساخت SESSION_SECRET
```

### گام ۲ — PostgreSQL

اگر PostgreSQL نصب است، دیتابیس و کاربر را بسازید و گام ۳ را ادامه دهید.

اگر **نصب نیست و دسترسی root هم ندارید** (محیط سندباکس)، می‌توانید یک پستگرس واقعی کاملاً کاربرمحور بالا بیاورید:

```bash
mkdir -p /tmp/pg && cd /tmp/pg && npm init -y && npm i embedded-postgres
```

فایل `start.mjs`:

```js
import EmbeddedPostgres from 'embedded-postgres'

const pg = new EmbeddedPostgres({
  databaseDir: '/tmp/pgdata',
  user: 'yedood',
  password: 'change-this-password',
  port: 5432,
  persistent: true,
})

try { await pg.initialise() } catch (e) { console.log('initialise:', e?.message ?? e) }
await pg.start()
try { await pg.createDatabase('yedood') } catch (e) { console.log('createDatabase:', e?.message ?? e) }
console.log('POSTGRES_READY')
setInterval(() => {}, 1 << 30)
```

```bash
cd /tmp/pg && node start.mjs      # منتظر پیام POSTGRES_READY بمانید
```

### گام ۳ — ساخت جداول، ادمین و اجرای API

```bash
npm run db:migrate
ADMIN_USERNAME=admin ADMIN_PASSWORD=admin12345678 npm run db:create-admin
npm run api:dev                   # باید بنویسد: API listening on port 4000
```

### گام ۴ — اجرای فرانت‌اند (ترمینال جدا)

```bash
npm run dev                       # http://localhost:4173
```

### گام ۵ — بررسی سلامت

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4173/api/products   # باید 200 باشد
```

---

## ۳. جدول عیب‌یابی سریع

| نشانه | علت | راه‌حل |
|---|---|---|
| `502 Bad Gateway` روی `/api/...` | API روی ۴۰۰۰ بالا نیست | `npm run api:dev` را اجرا کنید |
| `ZodError: DATABASE_URL ... undefined` | `.env` وجود ندارد | از `.env.example` کپی بسازید |
| `ECONNREFUSED 5432` | PostgreSQL بالا نیست | سرویس پستگرس را استارت بزنید |
| `/api/products` جواب `200` می‌دهد ولی `items: []` | دیتابیس خالی است | داده را منتقل/درج کنید (بخش ۴) |
| ورود ادمین `401` می‌دهد | حساب ادمین ساخته نشده | `npm run db:create-admin` |

---

## ۴. انتقال داده‌ها به دیتابیس

فرانت‌اند دیگر داده‌ها را از `localStorage` نمی‌خواند و همه چیز از API می‌آید. بنابراین یک دیتابیس خالی یعنی فروشگاه بدون محصول.

دو مسیر وجود دارد:

- **انتقال رسمی (یک‌باره):** از مرورگری که داده‌های قدیمی `localStorage` را دارد وارد پنل ادمین شوید → «تنظیمات» → «انتقال یک‌باره اطلاعات».
  این عملیات در کل دیتابیس فقط **یک بار** مجاز است (کلید `browser-localstorage-v1` در جدول `data_migrations`) و اگر قبلاً انجام شده باشد، خطای `MIGRATION_ALREADY_COMPLETED` می‌دهد. برای بررسی:
  ```sql
  SELECT * FROM data_migrations;
  ```
- **درج داده‌های نمونه:** برای تست سریع می‌توان داده‌های پیش‌فرض پروژه را مستقیم در جداول `categories` / `products` / `posts` درج کرد. توجه کنید این کار روی فلگ انتقال یک‌باره اثری ندارد، ولی چون شناسه‌ها یکسان‌اند، انتقال بعدی برای همان رکوردها `ON CONFLICT DO NOTHING` می‌شود.

---

## ۵. نکات باقی‌مانده

- مقادیر `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` فقط باید در `.env` سرور باشند و **هرگز** در فرانت‌اند یا متغیرهای `VITE_*` قرار نگیرند.
- `ADMIN_ORIGIN` باید دقیقاً با آدرس فرانت‌اند یکی باشد، وگرنه کوکی نشست (`SameSite=strict`) ارسال نمی‌شود و پنل ادمین مدام `401` می‌دهد.
- در محیط تولید، `NODE_ENV=production` باعث فعال شدن `ssl` برای اتصال پستگرس و `secure` شدن کوکی می‌شود؛ پس HTTPS الزامی است.
