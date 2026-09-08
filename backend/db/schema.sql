-- Artosphere — Neon (Postgres) schema
-- این فایل idempotent است و می‌توان چند بار اجرا کرد.

CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title_fa      TEXT NOT NULL,
  title_en      TEXT NOT NULL,
  category_fa   TEXT NOT NULL DEFAULT '',
  category_en   TEXT NOT NULL DEFAULT '',
  year          TEXT NOT NULL DEFAULT '',
  summary_fa    TEXT NOT NULL DEFAULT '',
  summary_en    TEXT NOT NULL DEFAULT '',
  description_fa TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  cover_image   TEXT NOT NULL DEFAULT '',
  accent_color  TEXT NOT NULL DEFAULT '#101010',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  budget      TEXT,
  message     TEXT NOT NULL,
  locale      TEXT NOT NULL DEFAULT 'fa',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- نوع رسانه کاور پروژه: image یا video (برای دیتابیس‌های قدیمی‌تر این ستون
-- با ALTER اضافه می‌شود چون CREATE TABLE IF NOT EXISTS ستون جدید اضافه نمی‌کند)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_type TEXT NOT NULL DEFAULT 'image';

-- کتابخانه رسانه: هر فایلی که از پنل ادمین آپلود می‌شود (عکس یا ویدیو) اینجا
-- ثبت می‌شود تا هم قابل استفاده مجدد باشد و هم فهرست آن در پنل دیده شود.
CREATE TABLE IF NOT EXISTS media (
  id            SERIAL PRIMARY KEY,
  filename      TEXT NOT NULL,
  url           TEXT NOT NULL,
  media_type    TEXT NOT NULL DEFAULT 'image',
  mime_type     TEXT NOT NULL DEFAULT '',
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  public_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- برای دیتابیس‌هایی که از قبل جدول media را داشتند (بدون ستون public_id)
ALTER TABLE media ADD COLUMN IF NOT EXISTS public_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_created ON media (created_at DESC);
