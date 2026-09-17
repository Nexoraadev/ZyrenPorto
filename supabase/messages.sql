-- ============================================
-- Messages table — contact form submissions
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  replied    BOOLEAN DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (contact form)
CREATE POLICY "Anyone can send message"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Only authenticated (admin) can read/update
CREATE POLICY "Auth can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Messages WA table — WhatsApp webhook inbox
-- Pesan masuk dari WhatsApp via Fonnte webhook
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages_wa (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sender      TEXT NOT NULL,
  sender_name TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  replied     BOOLEAN DEFAULT false
);

ALTER TABLE public.messages_wa ENABLE ROW LEVEL SECURITY;

-- Webhook (service role) dapat insert
CREATE POLICY "Service role can insert messages_wa"
  ON public.messages_wa FOR INSERT
  WITH CHECK (true);

-- Hanya admin yang dapat read/update/delete
CREATE POLICY "Auth can read messages_wa"
  ON public.messages_wa FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth can update messages_wa"
  ON public.messages_wa FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth can delete messages_wa"
  ON public.messages_wa FOR DELETE
  TO authenticated
  USING (true);
