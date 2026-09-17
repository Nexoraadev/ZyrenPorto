-- ============================================
-- MIGRATION: Fase 1 (Projects Advanced & Certificates)
-- ============================================

-- 1. Tambahkan kolom NDA dan Content Blocks ke tabel projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS nda_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;
-- Keterangan content_blocks: array of objects [{ type: 'text', title: 'Problem Solving', content: '...' }, { type: 'image', url: '...' }]

-- 2. Buat tabel relasi antara proyek dan skills (Integrasi)
CREATE TABLE IF NOT EXISTS public.project_skills (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project_skills"
  ON public.project_skills FOR SELECT USING (true);

CREATE POLICY "Auth users can insert project_skills"
  ON public.project_skills FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can delete project_skills"
  ON public.project_skills FOR DELETE TO authenticated USING (true);

-- 3. Buat tabel Certificates (Manajemen Sertifikat)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  file_url TEXT, -- Untuk file PDF, PPT, atau Docs di Supabase Storage
  linkedin_url TEXT, -- Tautan verifikasi ke LinkedIn atau Credly
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read certificates"
  ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Auth users can insert certificates"
  ON public.certificates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can update certificates"
  ON public.certificates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can delete certificates"
  ON public.certificates FOR DELETE TO authenticated USING (true);
