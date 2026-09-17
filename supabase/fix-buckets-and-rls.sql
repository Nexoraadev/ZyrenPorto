-- ============================================================
-- Jalankan di Supabase SQL Editor untuk fix semua bucket + RLS
-- ============================================================

-- 0. Buat tabel messages_wa jika belum ada
CREATE TABLE IF NOT EXISTS public.messages_wa (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sender      TEXT NOT NULL,
  sender_name TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  replied     BOOLEAN DEFAULT false,
  direction   TEXT DEFAULT 'inbound'  -- 'inbound' = dari webhook Fonnte, 'outbound' = dari form landing page
);

-- Tambah kolom direction jika tabel sudah ada tapi kolom belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages_wa' AND column_name = 'direction'
  ) THEN
    ALTER TABLE public.messages_wa ADD COLUMN direction TEXT DEFAULT 'inbound';
  END IF;
END $$;

ALTER TABLE public.messages_wa ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages_wa' AND policyname = 'Service role can insert messages_wa'
  ) THEN
    CREATE POLICY "Service role can insert messages_wa"
      ON public.messages_wa FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages_wa' AND policyname = 'Auth can read messages_wa'
  ) THEN
    CREATE POLICY "Auth can read messages_wa"
      ON public.messages_wa FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages_wa' AND policyname = 'Auth can update messages_wa'
  ) THEN
    CREATE POLICY "Auth can update messages_wa"
      ON public.messages_wa FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages_wa' AND policyname = 'Auth can delete messages_wa'
  ) THEN
    CREATE POLICY "Auth can delete messages_wa"
      ON public.messages_wa FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 1. Pastikan site_settings ada RLS untuk authenticated write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'site_settings' AND policyname = 'Auth users can update site_settings'
  ) THEN
    CREATE POLICY "Auth users can update site_settings"
      ON public.site_settings FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 2. Pastikan project_images ada RLS untuk authenticated write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_images' AND policyname = 'Auth users can manage project_images'
  ) THEN
    CREATE POLICY "Auth users can manage project_images"
      ON public.project_images FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 3. Pastikan project_categories ada RLS untuk authenticated write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_categories' AND policyname = 'Auth users can manage project_categories'
  ) THEN
    CREATE POLICY "Auth users can manage project_categories"
      ON public.project_categories FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read logos'
  ) THEN
    CREATE POLICY "Public read logos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'logos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth upload logos'
  ) THEN
    CREATE POLICY "Auth upload logos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'logos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth delete logos'
  ) THEN
    CREATE POLICY "Auth delete logos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'logos');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero', 'hero', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read hero'
  ) THEN
    CREATE POLICY "Public read hero"
      ON storage.objects FOR SELECT USING (bucket_id = 'hero');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth upload hero'
  ) THEN
    CREATE POLICY "Auth upload hero"
      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth delete hero'
  ) THEN
    CREATE POLICY "Auth delete hero"
      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read project-images'
  ) THEN
    CREATE POLICY "Public read project-images"
      ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth upload project-images'
  ) THEN
    CREATE POLICY "Auth upload project-images"
      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth delete project-images'
  ) THEN
    CREATE POLICY "Auth delete project-images"
      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES ('music', '{"url":""}')
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public read music'
  ) THEN
    CREATE POLICY "Public read music"
      ON storage.objects FOR SELECT USING (bucket_id = 'music');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth upload music'
  ) THEN
    CREATE POLICY "Auth upload music"
      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'music');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Auth delete music'
  ) THEN
    CREATE POLICY "Auth delete music"
      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'music');
  END IF;
END $$;
