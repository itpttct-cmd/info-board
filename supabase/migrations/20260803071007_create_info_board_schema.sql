/*
# Information Board Schema

1. Overview
This migration creates the complete schema for an Information Board display system (TV display + admin management).
The app has TWO distinct access patterns:
  - TV display page (public, no login) - reads all content to show on TV screens
  - Admin dashboard (requires login) - manages all content and admin accounts

Because the TV display page must show data WITHOUT being logged in, the board_content,
running_text, and sidebar_content tables are READ-ONLY public (anon + authenticated SELECT).
Only authenticated admins can INSERT/UPDATE/DELETE.

2. New Tables
- `board_content` - stores files (images/excel) for each slider section on the TV display
  - id, section (top/bottom), slot_key (e.g. company_kpi), title, content_type (image/excel),
    file_url, file_name, is_active, sort_order, created_at, updated_at
- `running_text` - the scrolling text shown in the footer
  - id, text, is_active, sort_order, created_at
- `sidebar_content` - content for the side panels (APD info + form files)
  - id, position (apd/form), title, content_type (image/excel/text), file_url, file_name,
    text_content, is_active, sort_order, created_at
- `admin_profiles` - extends auth.users with display_name for admin UI
  - id (FK auth.users), display_name, created_at

3. Security
- RLS enabled on ALL tables.
- SELECT policies allow anon + authenticated (so the TV display works without login).
- INSERT/UPDATE/DELETE policies restricted to authenticated users (admins).
- admin_profiles is fully authenticated-only (admin account management).
- Storage bucket 'board-media' created for image/excel uploads, public read.
*/