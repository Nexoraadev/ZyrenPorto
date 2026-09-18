-- Tambah kolom description ke tabel skills (keterangan tooltip di orbit)
-- Jalankan di Supabase SQL Editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'skills'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.skills ADD COLUMN description TEXT;
  END IF;
END $$;
