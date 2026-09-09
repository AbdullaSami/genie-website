-- ════════════════════════════════════════════════════════════
--  GENIE STUDIO — CMS Seed Data
--  Applied automatically via: supabase db reset
--  Or manually via: supabase db seed
-- ════════════════════════════════════════════════════════════

-- ── 1. SITE SETTINGS ─────────────────────────────────────────
INSERT INTO site_settings (
  id, site_name, logo_url, favicon_url,
  default_seo_title, default_seo_description, default_og_image, canonical_url,
  phone, mobile, email, secondary_email,
  address, google_maps_url, business_hours, copyright_text, updated_at
) VALUES (
  'default', 'Genie Studio', '/COLORD_HORIZENTAL.png', '/favicon.ico',
  'Genie Studio® — A Brand of Magic That Never Fails',
  'Genie Studio is a full-service creative studio specialising in brand identity, web, 3D, AI automation, marketing, and event planning.',
  '/COLORD_HORIZENTAL.png', 'https://genies.studio',
  '+20 100 000 0000', '+20 100 000 0001',
  'hello@genies.studio', 'contact@genies.studio',
  'Cairo, Egypt', 'https://maps.google.com',
  'Sun - Thu: 9:00 AM - 6:00 PM',
  '© 2025 Genie Studio. All rights reserved.',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name, logo_url = EXCLUDED.logo_url,
  email = EXCLUDED.email, updated_at = EXCLUDED.updated_at;

-- ── 2. SOCIAL LINKS ──────────────────────────────────────────
INSERT INTO social_links (platform, label, url, is_active, sort_order) VALUES
  ('instagram', 'Instagram',   'https://instagram.com/genie.studio',        TRUE, 1),
  ('linkedin',  'LinkedIn',    'https://linkedin.com/company/genie-studio', TRUE, 2),
  ('x',         'X (Twitter)', 'https://x.com/geniestudio',                 TRUE, 3),
  ('whatsapp',  'WhatsApp',    'https://wa.me/201000000000',                TRUE, 4),
  ('facebook',  'Facebook',    'https://facebook.com/geniestudio',          TRUE, 5)
ON CONFLICT DO NOTHING;

-- ── 3. NAVIGATION ITEMS ───────────────────────────────────────
INSERT INTO navigation_items (title, url, is_external, open_in_new_tab, is_active, sort_order) VALUES
  ('Services', '#services', FALSE, FALSE, TRUE, 1),
  ('Work',     '#work',     FALSE, FALSE, TRUE, 2),
  ('About',    '#about',    FALSE, FALSE, TRUE, 3),
  ('Contact',  '#contact',  FALSE, FALSE, TRUE, 4)
ON CONFLICT DO NOTHING;

-- ── 4. FOOTER SECTIONS ───────────────────────────────────────
INSERT INTO footer_sections (title, sort_order, links, is_active) VALUES
  ('Navigation', 1,
   '[{"label":"Services","url":"#services"},{"label":"Work","url":"#work"},{"label":"About","url":"#about"},{"label":"Contact","url":"#contact"}]'::jsonb,
   TRUE),
  ('Contact', 2,
   '[{"label":"Email Us","url":"mailto:hello@genies.studio"},{"label":"Call Us","url":"tel:+201000000000"}]'::jsonb,
   TRUE)
ON CONFLICT DO NOTHING;

-- ── 5. STATS ─────────────────────────────────────────────────
INSERT INTO stats (value, label, sort_order) VALUES
  (50, 'Projects Delivered', 1),
  (20, 'Brands Shaped',      2),
  (3,  'Years of Excellence',3),
  (6,  'Service Verticals',  4)
ON CONFLICT DO NOTHING;

-- ── 6. SERVICES ──────────────────────────────────────────────
INSERT INTO services (number, name, description, tags, sort_order) VALUES
  ('01','Brand Identity & Strategy','Full visual identity systems — logo, guidelines, brand voice, and everything in between.',ARRAY['Logo','Guidelines','Brand Voice'],1),
  ('02','Web Design & Development','Pixel-perfect websites, landing pages, and full-stack web applications built to perform.',ARRAY['UI/UX','Landing Pages','Full-Stack'],2),
  ('03','3D Design & Visualization','Product renders, architectural visualizations, motion & 3D animation that stop the scroll.',ARRAY['3D Renders','Motion','Architecture'],3),
  ('04','AI Automation','Smart workflows and AI-powered tools that save time and unlock new creative possibilities.',ARRAY['Workflows','AI Tools','Automation'],4),
  ('05','Marketing & Social Media','Content strategies, campaigns, and social presence that grow audiences and drive results.',ARRAY['Content','Campaigns','Social'],5),
  ('06','Event Planning & Identity','End-to-end event production and branded experiences that leave a lasting impression.',ARRAY['Events','Branding','Production'],6)
ON CONFLICT DO NOTHING;

-- ── 7. PROJECTS ──────────────────────────────────────────────
INSERT INTO projects (title, category, gradient, is_active, sort_order) VALUES
  ('Luminary Brand System','Brand Identity',     'from-violet-900 to-indigo-900',TRUE,1),
  ('Nexus Web Platform',   'Web Design & Dev',   'from-cyan-900 to-blue-900',    TRUE,2),
  ('Apex Product Renders', '3D Visualization',   'from-orange-900 to-red-900',   TRUE,3),
  ('FlowAI Dashboard',     'AI Automation',      'from-emerald-900 to-teal-900', TRUE,4),
  ('Nova Campaign',        'Marketing',          'from-pink-900 to-rose-900',    TRUE,5),
  ('Stellar Gala 2025',    'Event Identity',     'from-amber-900 to-yellow-900', TRUE,6)
ON CONFLICT DO NOTHING;

-- ── 8. TEAM ──────────────────────────────────────────────────
INSERT INTO team (name, role, photo_url, bio, sort_order) VALUES
  ('Name Here','Creative Director','https://placehold.co/320x320/1a1a1a/00ABED?text=CD','Brief bio about this team member and what they bring to the studio.',1),
  ('Name Here','Lead Designer',   'https://placehold.co/320x320/1a1a1a/00ABED?text=LD','Brief bio about this team member and what they bring to the studio.',2),
  ('Name Here','Tech Director',   'https://placehold.co/320x320/1a1a1a/00ABED?text=TD','Brief bio about this team member and what they bring to the studio.',3)
ON CONFLICT DO NOTHING;

-- ── 9. TESTIMONIALS ──────────────────────────────────────────
INSERT INTO testimonials (quote, client_name, client_title, sort_order) VALUES
  ('Genie Studio transformed our brand completely. The results exceeded every expectation.','Client Name','CEO, Company Name',1),
  ('Working with this team was a pleasure from day one. Truly world-class creative work.','Client Name','Founder, Company Name',2),
  ('The attention to detail and strategic thinking set them apart from anyone else we have worked with.','Client Name','Marketing Director, Company Name',3)
ON CONFLICT DO NOTHING;

-- ── 10. HOME PAGE ────────────────────────────────────────────
INSERT INTO pages (slug,title,seo_title,seo_description,og_image,canonical_url,is_published,sort_order) VALUES (
  'home','Home',
  'Genie Studio® — A Brand of Magic That Never Fails',
  'Genie Studio is a full-service creative studio specialising in brand identity, web, 3D, AI automation, marketing, and event planning.',
  '/COLORD_HORIZENTAL.png','https://genies.studio',TRUE,1
) ON CONFLICT (slug) DO NOTHING;

-- ── 11. HOME PAGE SECTIONS ───────────────────────────────────
DO $$
DECLARE home_id UUID;
BEGIN
  SELECT id INTO home_id FROM pages WHERE slug='home' LIMIT 1;
  IF home_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='hero') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'hero','Bold Ideas, Real Results',
      'A full-service creative studio building brands, digital experiences, 3D visuals, AI systems, and unforgettable events — for teams that refuse to be ordinary.',
      1,TRUE,
      '{"eyebrow":"Cairo, Egypt · Est. 2022","icon_url":"/ICON_VERSION.png","primary_cta_text":"See Our Work","primary_cta_url":"#work","secondary_cta_text":"Start a Project","secondary_cta_url":"#contact","slogan_items":["A BRAND OF MAGIC THAT NEVER FAILS","BRAND IDENTITY","WEB & DIGITAL","3D DESIGN","AI AUTOMATION","EVENT PLANNING"]}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='stats_band') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'stats_band','Studio Stats','Delivering excellence consistently',2,TRUE,'{"section_label":"Impact"}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='services_grid') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'services_grid','Six ways we make magic happen',
      'From the first spark to the final pixel — we cover every creative discipline your brand needs to grow.',
      3,TRUE,'{"section_label":"What We Do"}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='about') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'about','Built on clarity, craft, and imagination',
      'Genie Studio is a creative powerhouse that partners with ambitious brands to deliver identities, digital experiences, and campaigns that leave a lasting mark.',
      4,TRUE,
      '{"section_label":"About Genie Studio","body":"From brand strategy and visual identity to web development, 3D production, AI automation, and event planning — we bring every idea to life with precision and purpose.","icon_url":"/ICON_VERSION.png","visual_text":"Est. 2022 · Cairo, Egypt","tags":["Brand Identity","Art Direction","UI / UX","Web Dev","3D & Motion","AI Systems","Events","Marketing"]}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='projects_grid') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'projects_grid','Projects that speak for themselves',
      'A selection of brands and experiences we''ve had the privilege to create.',
      5,TRUE,'{"section_label":"Our Work"}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='team_section') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'team_section','Meet the board','The minds behind every idea, strategy, and pixel.',
      6,TRUE,'{"section_label":"The Team"}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='testimonials') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'testimonials','What Clients Say','Client feedback and testimonials.',
      7,TRUE,'{"section_label":"What Clients Say"}'::jsonb
    );
  END IF;

  IF NOT EXISTS(SELECT 1 FROM page_sections WHERE page_id=home_id AND block_type='contact_form') THEN
    INSERT INTO page_sections(page_id,block_type,title,subtitle,sort_order,is_active,content) VALUES(
      home_id,'contact_form','Let''s build something magical',
      'Tell us about your project and we''ll make the magic happen.',
      8,TRUE,
      '{"section_label":"Ready to Start?","submit_text":"Send Message →","success_message":"✦ Message sent! We will be in touch soon.","services":["Brand Identity & Strategy","Web Design & Development","3D Design & Visualization","AI Automation","Marketing & Social Media","Event Planning & Identity","Something else"]}'::jsonb
    );
  END IF;
END $$;
