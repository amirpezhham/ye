# راهنمای استقرار روی هاست (Production)

پروژه به‌صورت **تک‌سرویس** منتشر می‌شود: یک پروسهٔ Node (Express) هم API را روی `/api` پاسخ می‌دهد و هم خروجی بیلد React را از `dist/` سرو می‌کند. پس فقط **یک پورت** و **یک دامنه** لازم است و مشکل CORS/کوکی هم به‌طور طبیعی حل می‌شود.

```
مرورگر ──HTTPS──▶ Reverse Proxy (nginx/Caddy یا خود هاست)
                        │
                        ▼
              Node (Express) :PORT
                 ├── /api/*  →  API + کوکی نشست
                 └── /*       →  dist/  + fallback تک‌صفحه‌ای
                        │
                        ▼
                  PostgreSQL
```

---

## ۱. پیش‌نیازها

- Node.js نسخهٔ ۲۲ یا بالاتر
- PostgreSQL نسخهٔ ۱۴ یا بالاتر (با SSL اگر ارائه‌دهنده الزام کرده)
- دامنه + گواهی TLS (HTTPS **الزامی** است؛ دلیلش در بخش ۶)

---

## ۲. متغیرهای محیطی

یک فایل `.env` کنار `package.json` بسازید (یا متغیرها را در پنل هاست تعریف کنید):

| متغیر | اجباری | توضیح |
|---|---|---|
| `NODE_ENV` | ✅ | در هاست باید `production` باشد |
| `DATABASE_URL` | ✅ | رشتهٔ اتصال پستگرس |
| `SESSION_SECRET` | ✅ | حداقل ۳۲ کاراکتر تصادفی (`openssl rand -hex 24`) |
| `ADMIN_ORIGIN` | ✅ | **دقیقاً** آدرس عمومی سایت، مثل `https://yedood.ir` |
| `API_PORT` | ➖ | پیش‌فرض ۴۰۰۰؛ اگر هاست `PORT` تزریق کند همان استفاده می‌شود |
| `SERVE_STATIC` | ➖ | پیش‌فرض در production برابر `true` |
| `STATIC_DIR` | ➖ | پیش‌فرض `./dist` |
| `DATABASE_SSL` | ➖ | `true` (پیش‌فرض production) \| `no-verify` \| `false` |
| `ADMIN_SESSION_HOURS` | ➖ | پیش‌فرض ۱۲ |
| `PUBLIC_SITE_URL` | ➖ | برای `robots.txt` و `sitemap.xml`؛ در نبودش از هدر Host استفاده می‌شود |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | ➖ | برای اعلان سفارش |

> ⚠️ `TELEGRAM_BOT_TOKEN` و `SESSION_SECRET` هرگز نباید در فرانت‌اند یا متغیرهای `VITE_*` قرار بگیرند؛ هر چیزی که با `VITE_` شروع شود داخل باندل مرورگر می‌رود.

---

## ۳. گام‌های نصب

```bash
# ۱) دریافت کد و نصب وابستگی‌ها (فقط production)
git clone <repo> && cd ye
npm ci --omit=dev || npm install --omit=dev
# برای بیلد به devDependencies نیاز است، پس کامل نصب کنید:
npm install

# ۲) تنظیم .env (جدول بالا)

# ۳) ساخت جداول دیتابیس
npm run db:migrate

# ۴) ساخت حساب مدیر اولیه (رمز حداقل ۱۲ کاراکتر)
ADMIN_USERNAME=admin ADMIN_PASSWORD='یک-رمز-قوی-حداقل-۱۲-کاراکتر' npm run db:create-admin

# ۵) بیلد فرانت‌اند + سرور
npm run build:all

# ۶) اجرا
npm start            # = node dist-server/server/index.js
```

بررسی سلامت:

```bash
curl -s https://دامنه/api/health          # {"status":"ok"}
curl -sI https://دامنه/product/any-slug   # 200 و text/html
```

---

## ۴. اجرای دائمی

### systemd (VPS)

`/etc/systemd/system/yedood.service`:

```ini
[Unit]
Description=ye Dood 2 dood
After=network.target postgresql.service

[Service]
Type=simple
User=yedood
WorkingDirectory=/var/www/yedood
EnvironmentFile=/var/www/yedood/.env
ExecStart=/usr/bin/node dist-server/server/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now yedood
```

### PM2

```bash
npm i -g pm2
pm2 start dist-server/server/index.js --name yedood
pm2 save && pm2 startup
```

> در هر دو حالت، `npm run build:all` و `npm run db:migrate` باید **پیش از** استارت اجرا شده باشند.

### نمونهٔ nginx (TLS + پروکسی)

```nginx
server {
  listen 443 ssl http2;
  server_name yedood.ir;

  ssl_certificate     /etc/letsencrypt/live/yedood.ir/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yedood.ir/privkey.pem;

  # آپلود تصویر محصول در بدنهٔ JSON می‌رود (dataURL)، پس سقف بدنه بالا باشد.
  client_max_body_size 16m;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 80;
  server_name yedood.ir;
  return 301 https://$host$request_uri;
}
```

سرور به‌صورت خودکار gzip می‌کند؛ اگر nginx هم gzip دارد، تداخلی ایجاد نمی‌شود.

---

## ۵. به‌روزرسانی نسخه

```bash
git pull
npm install
npm run db:migrate      # اسکیما idempotent است (CREATE TABLE IF NOT EXISTS)
npm run build:all
sudo systemctl restart yedood
```

---

## ۶. نکات امنیتی مهم

- **HTTPS الزامی است.** در `NODE_ENV=production` کوکی نشست با پرچم `Secure` صادر می‌شود؛ روی HTTP ساده مرورگر آن را ذخیره نمی‌کند و ورود پنل ادمین کار نمی‌کند.
- `ADMIN_ORIGIN` باید دقیقاً (با `https` و بدون اسلش انتهایی) با دامنه یکی باشد، وگرنه CORS کوکی را رد می‌کند.
- `SESSION_SECRET` را عوض کنید؛ با تغییر آن همهٔ نشست‌های فعال باطل می‌شوند.
- اگر `NODE_ENV` روی `production` باشد و `trust proxy` فعال است، هدرهای `X-Forwarded-*` توسط پروکسی تنظیم شوند (نمونهٔ nginx بالا).
- رمز مدیر اولیه را بعد از اولین ورود از «تنظیمات» عوض کنید.

---

## ۷. چک‌لیست پس از نصب

- [ ] `GET /api/health` پاسخ `{"status":"ok"}` می‌دهد
- [ ] صفحهٔ اصلی، `/shop` و یک مسیر تودرتو مثل `/product/<slug>` با رفرش مستقیم بالا می‌آیند (fallback تک‌صفحه‌ای)
- [ ] `/api/products` لیست محصولات را برمی‌گرداند (اگر `items: []` بود، دیتابیس خالی است)
- [ ] ورود پنل ادمین روی **HTTPS** انجام می‌شود
- [ ] `robots.txt` و `sitemap.xml` آدرس مطلق دامنه را نشان می‌دهند
- [ ] یک سفارش آزمایشی ثبت و در پنل ادمین دیده می‌شود
- [ ] در صورت نیاز، اعلان تلگرام با یک سفارش واقعی تست شده است

---

## ۸. عیب‌یابی

| نشانه | علت احتمالی | راه‌حل |
|---|---|---|
| `EADDRINUSE` | پورت اشغال است | `API_PORT`/`PORT` را عوض کنید |
| صفحه سفید روی مسیرهای تودرتو | `base` در `vite.config.ts` نسبی است یا بیلد قدیمی است | `base` باید `/` باشد؛ `npm run build:all` را دوباره بزنید |
| ورود ادمین روی هاست کار نمی‌کند | نبود HTTPS یا ناهم‌خوانی `ADMIN_ORIGIN` | بخش ۶ |
| `502` روی `/api/*` در حالت توسعه | API بالا نیست | `npm run dev:all` |
| خطای اتصال پستگرس | SSL | `DATABASE_SSL=no-verify` یا `false` |
| `SERVE_STATIC فعال است اما dist پیدا نشد` | بیلد انجام نشده | `npm run build` |
