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
| `FORCE_HTTPS` | ➖ | `true` → هدایت خودکار HTTP به HTTPS (پیش‌فرض `false`) |
| `TRUST_PROXY` | ➖ | تعداد هاپ‌های پروکسی معکوس؛ پیش‌فرض در production برابر `1` |
| `TLS_CERT_FILE` / `TLS_KEY_FILE` | ➖ | اجرای مستقیم HTTPS بدون پروکسی معکوس (مسیر مطلق فایل‌ها) |
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

## ۶. HTTPS و ورود امن پنل ادمین

در `NODE_ENV=production` کوکی نشست با پرچم `Secure` صادر می‌شود. یعنی مرورگر آن را **فقط روی HTTPS** ذخیره و ارسال می‌کند. اگر سایت روی HTTP ساده سرو شود، ورود ادمین **بی‌صدا شکست می‌خورد** (پاسخ ورود ۲۰۰ است، اما کوکی ذخیره نمی‌شود و درخواست بعدی ۴۰۱ می‌گیرد). پس HTTPS اختیاری نیست.

### گزینهٔ الف — پشت پروکسی معکوس (توصیه‌شده)

پروکسی (nginx/Caddy) TLS را تمام می‌کند و ترافیک را روی HTTP به Node می‌فرستد:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header Host              $host;
```

سرور با `TRUST_PROXY` (پیش‌فرض در production: یک هاپ) این هدرها را باور می‌کند، بنابراین `request.secure` درست تشخیص داده می‌شود و:

- درخواست‌های HTTPS هدایت نمی‌شوند
- هدر `Strict-Transport-Security` فقط روی اتصال امن فرستاده می‌شود

اگر پروکسی شما چند لایه دارد، تعداد هاپ‌ها را صریح بدهید: `TRUST_PROXY=2`.

### گزینهٔ ب — HTTPS مستقیم بدون پروکسی

اگر هاست پروکسی معکوس ندارد، خود Express می‌تواند TLS را تمام کند:

```bash
TLS_CERT_FILE=/etc/letsencrypt/live/yedood.ir/fullchain.pem \
TLS_KEY_FILE=/etc/letsencrypt/live/yedood.ir/privkey.pem \
npm start
```

در لاگ می‌بینید: `HTTPS API listening on port ...`

### هدایت HTTP → HTTPS

با `FORCE_HTTPS=true` هر درخواست HTTP با `301` به HTTPS هدایت می‌شود. تنها استثنا `GET /api/health` است تا بررسی سلامت هاست‌ها نشکند.

### تست HTTPS روی سیستم خودی

برای اینکه مسیر واقعی production را قبل از هاست ببینید:

```bash
npm run tls:self-signed     # ساخت .certs/cert.pem و .certs/key.pem

NODE_ENV=production FORCE_HTTPS=true SERVE_STATIC=true \
TLS_CERT_FILE=.certs/cert.pem TLS_KEY_FILE=.certs/key.pem \
API_PORT=4443 ADMIN_ORIGIN=https://localhost:4443 npm start
```

سپس `https://localhost:4443/admin/login` را باز کنید و یک‌بار هشدار گواهی self-signed را رد کنید (Advanced → Proceed).

> فایل `.certs/` در `.gitignore` است و هرگز نباید کامیت شود.

### سایر نکات امنیتی

- `ADMIN_ORIGIN` باید دقیقاً (با `https` و بدون اسلش انتهایی) با دامنه یکی باشد، وگرنه CORS کوکی را رد می‌کند.
- `SESSION_SECRET` را عوض کنید؛ با تغییر آن همهٔ نشست‌های فعال باطل می‌شوند.
- نشست‌ها بی‌حالت (stateless) و امضاشده‌اند؛ یعنی پس از «خروج» کوکی در مرورگر پاک می‌شود اما یک کوکی دزدیده‌شده تا انقضا معتبر می‌ماند. برای باطل‌کردن فوری همهٔ نشست‌ها، رمز مدیر را عوض کنید (ستون `session_version` افزایش می‌یابد).
- رمز مدیر اولیه را بعد از اولین ورود از «تنظیمات» عوض کنید.

---

## ۶.۵. ربات تلگرام و سفارش‌ها

ربات دو کار انجام می‌دهد:

1. **اعلان سفارش برای ادمین‌ها** — هر سفارش جدید به چت ادمین‌های ثبت‌شده فرستاده می‌شود.
2. **تکمیل سفارش توسط مشتری** — مشتری از صفحهٔ «سفارش ثبت شد» روی «تکمیل سفارش در تلگرام» می‌زند، ربات خلاصهٔ سفارش را نشان می‌دهد و با دکمهٔ «✅ تأیید سفارش» آن را نهایی می‌کند؛ سپس ادمین‌ها باخبر می‌شوند.

### راه‌اندازی

1. از BotFather توکن بگیرید و `TELEGRAM_BOT_TOKEN` را در `.env` بگذارید.
2. سرویس را اجرا کنید؛ در لاگ باید ببینید: `ربات تلگرام فعال است: @your_bot`.
3. وارد پنل ادمین شوید → **تنظیمات** → بخش «ربات تلگرام» → کد اتصال را کپی کنید.
4. در تلگرام، ربات را باز کنید و این پیام را بفرستید:
   ```
   /start admin_<کد اتصال>
   ```
   اگر پیام «✅ این چت به عنوان ادمین ثبت شد» را دیدید، تمام است.

> ⚠️ هرگز یوزرنیم خودِ ربات (مثل `@mybot`) را در `TELEGRAM_CHAT_ID` نگذارید؛ تلگرام خطای
> `Forbidden: the bot can't send messages to the bot` می‌دهد. `TELEGRAM_CHAT_ID` باید شناسهٔ
> **عددی** یک کاربر/گروه باشد. در حالت عادی نیازی به تنظیم آن نیست و ثبت ادمین از داخل ربات کافی است.

### حالت اتصال: polling یا وبهوک

- **پیش‌فرض (بدون تنظیم): long-polling.** ربات هر ۳ ثانیه آپدیت‌ها را می‌گیرد. به دامنهٔ عمومی نیازی ندارد و برای یک فروشگاه کافی است.
- **وبهوک (اختیاری):** `TELEGRAM_WEBHOOK_URL=https://دامنه/api/telegram/webhook` و `TELEGRAM_WEBHOOK_SECRET` (حداقل ۸ کاراکتر، فقط `A-Za-z0-9_-`) را تنظیم کنید. سرور خودش `setWebhook` را صدا می‌زند و درخواست‌های ورودی با هدر `X-Telegram-Bot-Api-Secret-Token` اعتبارسنجی می‌شوند.

> در حالت polling ربات خودش `deleteWebhook` را صدا می‌زند، چون تلگرام اجازهٔ هم‌زمانی این دو را نمی‌دهد.

### صف اعلان و تلاش دوباره

اعلان سفارش در جدول `notification_outbox` ذخیره و با backoff نمایی (تا ۱ ساعت) دوباره تلاش می‌شود. برای بررسی:

```sql
SELECT id, order_id, attempts, available_at, sent_at, last_error
FROM notification_outbox ORDER BY id DESC LIMIT 20;
```

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
| ورود ادمین روی هاست کار نمی‌کند (۲۰۰ می‌گیرد ولی ریدایرکت به لاگین) | نبود HTTPS → کوکی `Secure` ذخیره نمی‌شود | بخش ۶ |
| ورود ادمین کار نمی‌کند | ناهم‌خوانی `ADMIN_ORIGIN` با دامنه | `ADMIN_ORIGIN` را دقیقاً برابر آدرس عمومی بگذارید |
| حلقهٔ بی‌پایان HTTP→HTTPS | پروکسی `X-Forwarded-Proto` را ست نمی‌کند | `TRUST_PROXY` و هدرهای پروکسی را تنظیم کنید |
| `502` روی `/api/*` در حالت توسعه | API بالا نیست | `npm run dev:all` |
| خطای اتصال پستگرس | SSL | `DATABASE_SSL=no-verify` یا `false` |
| `SERVE_STATIC فعال است اما dist پیدا نشد` | بیلد انجام نشده | `npm run build` |
