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

CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
