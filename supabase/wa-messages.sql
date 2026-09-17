-- ============================================
-- WhatsApp Messages table — from Fonnte webhook
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages_wa (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sender      TEXT NOT NULL,  -- nomor WA pengirim
  sender_name TEXT,           -- nama kontak jika ada
  message     TEXT NOT NULL,
  replied     BOOLEAN DEFAULT false,
  read        BOOLEAN DEFAULT false
);

ALTER TABLE public.messages_wa ENABLE ROW LEVEL SECURITY;

-- Webhook dapat insert (no auth needed for webhook)
CREATE POLICY "Webhook can insert wa messages"
  ON public.messages_wa FOR INSERT
  WITH CHECK (true);

-- Only authenticated (admin) can read/update/delete
CREATE POLICY "Auth can read wa messages"
  ON public.messages_wa FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Auth can update wa messages"
  ON public.messages_wa FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Auth can delete wa messages"
  ON public.messages_wa FOR DELETE
  TO authenticated USING (true);
