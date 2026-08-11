/*
# Simplify board_content, rename sidebar positions, add panel_settings

1. Changes
- board_content: remove section/slot_key CHECK constraints, make them nullable
  so the table becomes a simple flat list (title + file + sort_order)
- sidebar_content: update position CHECK to new names
  (left_top, left_bottom, right_top, right_bottom)
- Migrate existing sidebar data to new position names
- Add panel_settings table for custom sidebar panel titles

2. Security
- panel_settings: same RLS pattern as other content tables (public read, auth write)
*/

-- ============ board_content: remove section/slot_key constraints ============
ALTER TABLE board_content DROP CONSTRAINT IF EXISTS board_content_section_check;
ALTER TABLE board_content ALTER COLUMN section DROP NOT NULL;
ALTER TABLE board_content ALTER COLUMN slot_key DROP NOT NULL;

-- ============ sidebar_content: rename positions ============
ALTER TABLE sidebar_content DROP CONSTRAINT IF EXISTS sidebar_content_position_check;

-- Migrate existing data to new position names
UPDATE sidebar_content SET position = 'left_top' WHERE position = 'apd';
UPDATE sidebar_content SET position = 'left_bottom' WHERE position = 'form';
UPDATE sidebar_content SET position = 'right_top' WHERE position = 'k3';
UPDATE sidebar_content SET position = 'right_bottom' WHERE position = 'machine';

ALTER TABLE sidebar_content ADD CONSTRAINT sidebar_content_position_check
  CHECK (position IN ('left_top', 'left_bottom', 'right_top', 'right_bottom'));

-- ============ panel_settings: custom sidebar panel titles ============
CREATE TABLE IF NOT EXISTS panel_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL CHECK (position IN ('left_top', 'left_bottom', 'right_top', 'right_bottom')),
  title text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(position)
);

ALTER TABLE panel_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_panel_settings" ON panel_settings;
CREATE POLICY "read_panel_settings" ON panel_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_panel_settings" ON panel_settings;
CREATE POLICY "insert_panel_settings" ON panel_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_panel_settings" ON panel_settings;
CREATE POLICY "update_panel_settings" ON panel_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_panel_settings" ON panel_settings;
CREATE POLICY "delete_panel_settings" ON panel_settings FOR DELETE
  TO authenticated USING (true);

-- Seed default titles
INSERT INTO panel_settings (position, title) VALUES
  ('left_top', 'Sidebar Kiri Atas'),
  ('left_bottom', 'Sidebar Kiri Bawah'),
  ('right_top', 'Sidebar Kanan Atas'),
  ('right_bottom', 'Sidebar Kanan Bawah')
ON CONFLICT (position) DO NOTHING;