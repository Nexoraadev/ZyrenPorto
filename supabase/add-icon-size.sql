-- Tambah kolom icon_size ke tabel skills
-- Jalankan di Supabase SQL Editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skills' AND column_name = 'icon_size'
  ) THEN
    ALTER TABLE public.skills ADD COLUMN icon_size INTEGER DEFAULT 70;
  END IF;
END $$;
