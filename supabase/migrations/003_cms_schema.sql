-- ═══════════════════════════════════════════════════════════
--  GENIE STUDIO — CMS & ADMIN DATABASE SCHEMA
--  Migration: 003_cms_schema.sql
-- ═══════════════════════════════════════════════════════════

-- ── 1. SITE SETTINGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id                      TEXT PRIMARY KEY DEFAULT 'default',
  site_name               TEXT NOT NULL DEFAULT 'Genie Studio',
  logo_url                TEXT NOT NULL DEFAULT '/COLORD_HORIZENTAL.png',
  favicon_url             TEXT NOT NULL DEFAULT '/favicon.ico',
  default_seo_title       TEXT NOT NULL DEFAULT 'Genie Studio® — A Brand of Magic That Never Fails',
  default_seo_description TEXT NOT NULL DEFAULT 'Genie Studio is a full-service creative studio specialising in brand identity, web, 3D, AI automation, marketing, and event planning.',
  default_og_image        TEXT NOT NULL DEFAULT '/COLORD_HORIZENTAL.png',
  canonical_url           TEXT NOT NULL DEFAULT 'https://genies.studio',
  phone                   TEXT DEFAULT '+20 100 000 0000',
  mobile                  TEXT DEFAULT '+20 100 000 0001',
  email                   TEXT NOT NULL DEFAULT 'hello@genies.studio',
  secondary_email         TEXT DEFAULT 'contact@genies.studio',
  address                 TEXT DEFAULT 'Cairo, Egypt',
  google_maps_url         TEXT DEFAULT '',
  business_hours          TEXT DEFAULT 'Sun - Thu: 9:00 AM - 6:00 PM',
  copyright_text          TEXT NOT NULL DEFAULT '© 2025 Genie Studio. All rights reserved.',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. SOCIAL LINKS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform      TEXT NOT NULL,
  label         TEXT NOT NULL,
  url           TEXT NOT NULL,
  icon          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. NAVIGATION ITEMS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS navigation_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  is_external   BOOLEAN NOT NULL DEFAULT FALSE,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. FOOTER SECTIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  links         JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. PAGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  seo_title       TEXT,
  seo_description TEXT,
  og_image        TEXT,
  canonical_url   TEXT,
  no_index        BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. PAGE SECTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id       UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_type    TEXT NOT NULL,
  title         TEXT,
  subtitle      TEXT,
  content       JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. MEDIA ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  url           TEXT NOT NULL,
  size          BIGINT NOT NULL DEFAULT 0,
  mime_type     TEXT NOT NULL DEFAULT 'image/jpeg',
  alt_text      TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. ADMIN USERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. UPDATE EXISTING TABLES WITH MISSING COLUMNS ────────────
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE team ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE stats ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS notes TEXT;

-- ── 10. ROW LEVEL SECURITY (RLS) ──────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read policies
DROP POLICY IF EXISTS "public read site_settings" ON site_settings;
CREATE POLICY "public read site_settings" ON site_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read social_links" ON social_links;
CREATE POLICY "public read social_links" ON social_links FOR SELECT USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "public read navigation_items" ON navigation_items;
CREATE POLICY "public read navigation_items" ON navigation_items FOR SELECT USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "public read footer_sections" ON footer_sections;
CREATE POLICY "public read footer_sections" ON footer_sections FOR SELECT USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "public read pages" ON pages;
CREATE POLICY "public read pages" ON pages FOR SELECT USING (is_published = TRUE OR is_admin());

DROP POLICY IF EXISTS "public read page_sections" ON page_sections;
CREATE POLICY "public read page_sections" ON page_sections FOR SELECT USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "public read media" ON media;
CREATE POLICY "public read media" ON media FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin read admin_users" ON admin_users;
CREATE POLICY "admin read admin_users" ON admin_users FOR SELECT USING (is_admin());

-- Admin full write policies for CMS tables
DROP POLICY IF EXISTS "admin all site_settings" ON site_settings;
CREATE POLICY "admin all site_settings" ON site_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all social_links" ON social_links;
CREATE POLICY "admin all social_links" ON social_links FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all navigation_items" ON navigation_items;
CREATE POLICY "admin all navigation_items" ON navigation_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all footer_sections" ON footer_sections;
CREATE POLICY "admin all footer_sections" ON footer_sections FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all pages" ON pages;
CREATE POLICY "admin all pages" ON pages FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all page_sections" ON page_sections;
CREATE POLICY "admin all page_sections" ON page_sections FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all media" ON media;
CREATE POLICY "admin all media" ON media FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all stats" ON stats;
CREATE POLICY "admin all stats" ON stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all services" ON services;
CREATE POLICY "admin all services" ON services FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all projects" ON projects;
CREATE POLICY "admin all projects" ON projects FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all team" ON team;
CREATE POLICY "admin all team" ON team FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all testimonials" ON testimonials;
CREATE POLICY "admin all testimonials" ON testimonials FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin all contact_submissions" ON contact_submissions;
CREATE POLICY "admin all contact_submissions" ON contact_submissions FOR ALL USING (is_admin()) WITH CHECK (is_admin());
