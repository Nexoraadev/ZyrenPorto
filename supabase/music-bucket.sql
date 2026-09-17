-- Jalankan di Supabase SQL Editor untuk setup music storage
-- 1. Buat bucket via Dashboard: Storage → New Bucket → Name: "music" → Public: ON
-- 2. Atau gunakan SQL ini (jika Supabase version support):

-- Insert default music setting
INSERT INTO public.site_settings (key, value)
VALUES ('music', '{"url":""}')
ON CONFLICT (key) DO NOTHING;

-- Storage policies untuk bucket "music" (jalankan setelah buat bucket manual):
-- CREATE POLICY "Public read music" ON storage.objects FOR SELECT USING (bucket_id = 'music');
-- CREATE POLICY "Auth upload music" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'music');
-- CREATE POLICY "Auth delete music" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'music');
