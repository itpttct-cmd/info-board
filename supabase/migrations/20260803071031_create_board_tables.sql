/*
# Create board_content, running_text, sidebar_content, admin_profiles tables
See overview migration for full documentation.
*/

-- ============ board_content ============
CREATE TABLE IF NOT EXISTS board_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('top', 'bottom')),
  slot_key text NOT NULL,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('image', 'excel')),
  file_url text,
  file_name text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE board_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_board_content" ON board_content;
CREATE POLICY "read_board_content" ON board_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_board_content" ON board_content;
CREATE POLICY "insert_board_content" ON board_content FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_board_content" ON board_content;
CREATE POLICY "update_board_content" ON board_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_board_content" ON board_content;
CREATE POLICY "delete_board_content" ON board_content FOR DELETE
  TO authenticated USING (true);

-- ============ running_text ============
CREATE TABLE IF NOT EXISTS running_text (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE running_text ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_running_text" ON running_text;
CREATE POLICY "read_running_text" ON running_text FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_running_text" ON running_text;
CREATE POLICY "insert_running_text" ON running_text FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_running_text" ON running_text;
CREATE POLICY "update_running_text" ON running_text FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_running_text" ON running_text;
CREATE POLICY "delete_running_text" ON running_text FOR DELETE
  TO authenticated USING (true);

-- ============ sidebar_content ============
CREATE TABLE IF NOT EXISTS sidebar_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL CHECK (position IN ('apd', 'form')),
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('image', 'excel', 'text')),
  file_url text,
  file_name text,
  text_content text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sidebar_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_sidebar_content" ON sidebar_content;
CREATE POLICY "read_sidebar_content" ON sidebar_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_sidebar_content" ON sidebar_content;
CREATE POLICY "insert_sidebar_content" ON sidebar_content FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_sidebar_content" ON sidebar_content;
CREATE POLICY "update_sidebar_content" ON sidebar_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_sidebar_content" ON sidebar_content;
CREATE POLICY "delete_sidebar_content" ON sidebar_content FOR DELETE
  TO authenticated USING (true);

-- ============ admin_profiles ============
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Administrator',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_admin_profiles" ON admin_profiles;
CREATE POLICY "read_admin_profiles" ON admin_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_admin_profile" ON admin_profiles;
CREATE POLICY "insert_admin_profile" ON admin_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_admin_profile" ON admin_profiles;
CREATE POLICY "update_admin_profile" ON admin_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_board_content_section ON board_content(section, slot_key);
CREATE INDEX IF NOT EXISTS idx_board_content_active ON board_content(is_active);
CREATE INDEX IF NOT EXISTS idx_running_text_active ON running_text(is_active);
CREATE INDEX IF NOT EXISTS idx_sidebar_content_position ON sidebar_content(position, is_active);

-- ============ Storage bucket for board media ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-media', 'board-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "read_board_media" ON storage.objects;
CREATE POLICY "read_board_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'board-media');

DROP POLICY IF EXISTS "insert_board_media" ON storage.objects;
CREATE POLICY "insert_board_media" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'board-media');

DROP POLICY IF EXISTS "update_board_media" ON storage.objects;
CREATE POLICY "update_board_media" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'board-media') WITH CHECK (bucket_id = 'board-media');

DROP POLICY IF EXISTS "delete_board_media" ON storage.objects;
CREATE POLICY "delete_board_media" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'board-media');