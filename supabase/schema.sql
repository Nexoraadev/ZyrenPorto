-- ============================================
-- Zhiyy Portfolio — Supabase Schema
-- Jalankan di Supabase SQL Editor
-- ============================================

-- ============================================
-- Tabel project_categories
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  CONSTRAINT project_categories_name_key UNIQUE (name)
);

ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project_categories"
  ON public.project_categories FOR SELECT
  USING (true);

CREATE POLICY "Auth users can insert project_categories"
  ON public.project_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users can update project_categories"
  ON public.project_categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can delete project_categories"
  ON public.project_categories FOR DELETE
  TO authenticated
  USING (true);

-- Default categories
INSERT INTO public.project_categories (name, order_index) VALUES
  ('Web',             1),
  ('Animation',       2),
  ('Illustration',    3),
  ('Logo/Branding',   4),
  ('Photography',     5),
  ('UI/UX',           6)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Projects table (skema baru — setelah migrasi)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  long_description TEXT,
  tech_stack       TEXT[] DEFAULT '{}',
  live_url         TEXT,
  github_url       TEXT,
  featured         BOOLEAN DEFAULT false,
  order_index      INTEGER DEFAULT 0,
  category_id      UUID NOT NULL REFERENCES public.project_categories(id),
  video_url        TEXT
);

-- NOTE: Kolom image_url dan category (TEXT) telah dihapus setelah migrasi data.
-- Migrasi: image_url dipindahkan ke tabel project_images.
--          category (text) digantikan oleh category_id (FK ke project_categories).

-- ============================================
-- Tabel project_images
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  order_index  INTEGER DEFAULT 0
);

ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project_images"
  ON public.project_images FOR SELECT
  USING (true);

CREATE POLICY "Auth users can insert project_images"
  ON public.project_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users can update project_images"
  ON public.project_images FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can delete project_images"
  ON public.project_images FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Skills table
-- ============================================
CREATE TABLE IF NOT EXISTS public.skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  level       INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
  icon        TEXT,
  order_index INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Public read skills"
  ON public.skills FOR SELECT
  USING (true);

-- Write access hanya untuk user yang sudah login (admin)
CREATE POLICY "Auth users can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can insert skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users can update skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can delete skills"
  ON public.skills FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Content Protection Settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- ============================================
-- Site Content Settings (editable by admin)
-- ============================================
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_name',    '{"first":"REAVLENIA","last":"AREZHA"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_roles',   '{"roles":["Web Developer","Animator","UI/UX Designer","Illustrator"]}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_bio',     '{"text":"Menciptakan karya yang fungsional sekaligus indah — dari kode sampai kanvas."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_stats',   '{"items":[{"value":"10+","label":"Projects"},{"value":"3+","label":"Years"},{"value":"5+","label":"Disciplines"}]}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('about_bio',    '{"paragraphs":["Halo! Aku Reavlenia Arezha, seorang creative multidisiplin yang bergerak di dunia digital.","Bukan cuma ngoding — aku juga bikin animasi 2D, desain logo, UI/UX, fotografi, dan ilustrasi.","Stack utamaku Next.js + TypeScript untuk dev, Figma + Adobe Suite untuk desain."]}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('contact_info', '{"email":"ohmyliinnn@gmail.com","github":"https://github.com/Rheaglitch","instagram":"https://instagram.com/","linkedin":"https://linkedin.com/","location":"Indonesia"}')
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, value)
VALUES (
  'hero_image',
  '{"url":"https://zljhjdhknybktcvtdutz.supabase.co/storage/v1/object/public/hero/ab9e4d158163df3ee068613735669b04-removebg-preview.png"}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Auth users can update site_settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Supabase Storage bucket: project-images
-- Buat via Dashboard: Storage > New bucket > "project-images" > Public
-- Tambah policies:
--   - Public read: storage.objects SELECT USING (bucket_id = 'project-images')
--   - Auth write: storage.objects INSERT TO authenticated WITH CHECK (bucket_id = 'project-images')
--   - Auth delete: storage.objects DELETE TO authenticated USING (bucket_id = 'project-images')
-- ============================================

-- ============================================
-- Seed data
-- ============================================
INSERT INTO public.skills (name, category, level, order_index) VALUES
  ('Next.js',     'Frontend', 90, 1),
  ('React',       'Frontend', 90, 2),
  ('TypeScript',  'Frontend', 85, 3),
  ('Tailwind CSS','Frontend', 90, 4),
  ('Node.js',     'Backend',  80, 5),
  ('Supabase',    'Backend',  85, 6),
  ('PostgreSQL',  'Backend',  75, 7),
  ('REST API',    'Backend',  85, 8),
  ('Git',         'Tools',    85, 9),
  ('Vercel',      'Tools',    90, 10),
  ('Figma',       'Tools',    70, 11),
  ('Docker',      'Tools',    60, 12);
