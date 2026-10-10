CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  price BIGINT NOT NULL CHECK (price >= 0),
  stock INTEGER CHECK (stock >= 0),
  status TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_slug_idx ON products(category_slug);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  total_items INTEGER NOT NULL CHECK (total_items >= 0),
  total_price BIGINT NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'new',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders(phone);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_outbox_pending_idx
  ON notification_outbox(available_at)
  WHERE sent_at IS NULL;

CREATE TABLE IF NOT EXISTS data_migrations (
  migration_key TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary JSONB NOT NULL
);

-- ---------- ربات تلگرام ----------

-- چت‌هایی که با ربات تعامل داشته‌اند. is_admin با کد اتصال پنل فعال می‌شود.
CREATE TABLE IF NOT EXISTS telegram_chats (
  chat_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- اتصال سفارش به چت مشتری در تلگرام و زمان تأیید نهایی.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_confirmed_at TIMESTAMPTZ;
