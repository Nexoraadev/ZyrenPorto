-- ============================================
-- Page views analytics table
-- ============================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  path       TEXT NOT NULL,
  referrer   TEXT,
  user_agent TEXT,
  country    TEXT
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public landing page)
CREATE POLICY "Anyone can insert page_view"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Auth can read page_views"
  ON public.page_views FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Auth can delete page_views"
  ON public.page_views FOR DELETE
  TO authenticated USING (true);
