-- ============================================================
-- Information Board — Complete Database Setup
-- Run this in pgAdmin or psql to create all tables for local PostgreSQL
-- Usage: psql -U postgres -d infoboard -f database/setup.sql
-- ============================================================

-- ============ users ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Administrator',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ board_content ============
-- UPDATE: Tambahkan 'pdf' pada CHECK (content_type)
CREATE TABLE IF NOT EXISTS board_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT,
  slot_key TEXT,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'excel', 'pdf')),
  file_url TEXT,
  file_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ running_text ============
CREATE TABLE IF NOT EXISTS running_text (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ sidebar_content ============
-- UPDATE: Tambahkan 'pdf' pada CHECK (content_type) jika sidebar juga butuh PDF
CREATE TABLE IF NOT EXISTS sidebar_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL CHECK (position IN ('left_top', 'left_bottom', 'right_top', 'right_bottom')),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'excel', 'text', 'pdf')),
  file_url TEXT,
  file_name TEXT,
  text_content TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ panel_settings ============
CREATE TABLE IF NOT EXISTS panel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL UNIQUE CHECK (position IN ('left_top', 'left_bottom', 'right_top', 'right_bottom')),
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_board_content_active ON board_content(is_active);
CREATE INDEX IF NOT EXISTS idx_running_text_active ON running_text(is_active);
CREATE INDEX IF NOT EXISTS idx_sidebar_content_position ON sidebar_content(position, is_active);

-- ============ Seed default panel titles ============
INSERT INTO panel_settings (position, title) VALUES
  ('left_top', 'Sidebar Kiri Atas'),
  ('left_bottom', 'Sidebar Kiri Bawah'),
  ('right_top', 'Sidebar Kanan Atas'),
  ('right_bottom', 'Sidebar Kanan Bawah')
ON CONFLICT (position) DO NOTHING;