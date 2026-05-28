-- =============================================================================
-- Sprint 2 — Storage buckets + audit log + 2FA + messages
-- Migracja: 2026-03-01
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. STORAGE BUCKETS — utwórz jeśli nie istnieją
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('companies', 'companies', true),
  ('obituaries', 'obituaries', true),
  ('docs', 'docs', false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. STORAGE POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- avatars: publiczny odczyt, własny upload (folder = userId)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_own_insert" ON storage.objects;
CREATE POLICY "avatars_own_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'u'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_own_delete" ON storage.objects;
CREATE POLICY "avatars_own_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );

-- companies: publiczny odczyt, upload tylko dla company/admin
DROP POLICY IF EXISTS "companies_public_read" ON storage.objects;
CREATE POLICY "companies_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'companies');

DROP POLICY IF EXISTS "companies_role_insert" ON storage.objects;
CREATE POLICY "companies_role_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'companies'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('company', 'admin')
    )
  );

-- obituaries: publiczny odczyt, upload dla zalogowanych
DROP POLICY IF EXISTS "obituaries_public_read" ON storage.objects;
CREATE POLICY "obituaries_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'obituaries');

DROP POLICY IF EXISTS "obituaries_auth_insert" ON storage.objects;
CREATE POLICY "obituaries_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'obituaries' AND auth.uid() IS NOT NULL
  );

-- docs: tylko właściciel (lub admin)
DROP POLICY IF EXISTS "docs_own_read" ON storage.objects;
CREATE POLICY "docs_own_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'docs'
    AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "docs_own_insert" ON storage.objects;
CREATE POLICY "docs_own_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'docs' AND auth.uid() IS NOT NULL
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUDIT LOG — RODO + bezpieczeństwo
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip TEXT,
  user_agent TEXT,
  before_data JSONB,
  after_data JSONB,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred ON public.audit_log(occurred_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read" ON public.audit_log;
CREATE POLICY "audit_admin_read" ON public.audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "audit_self_read" ON public.audit_log;
CREATE POLICY "audit_self_read" ON public.audit_log
  FOR SELECT USING (actor_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MESSAGES (chat firma ↔ rodzina)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  family_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_family INT DEFAULT 0,
  unread_company INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_family ON public.message_threads(family_id);
CREATE INDEX IF NOT EXISTS idx_threads_company ON public.message_threads(company_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT CHECK (sender_role IN ('family', 'company', 'admin', 'system')),
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_id, created_at DESC);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Wątki widoczne dla family/company w nim uczestniczących + admin
DROP POLICY IF EXISTS "threads_participants" ON public.message_threads;
CREATE POLICY "threads_participants" ON public.message_threads
  FOR SELECT USING (
    family_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = message_threads.company_id AND cm.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "messages_via_thread" ON public.messages;
CREATE POLICY "messages_via_thread" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.message_threads t
      WHERE t.id = messages.thread_id
        AND (
          t.family_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = t.company_id AND cm.user_id = auth.uid()
          )
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

DROP POLICY IF EXISTS "messages_insert_participants" ON public.messages;
CREATE POLICY "messages_insert_participants" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.message_threads t
      WHERE t.id = messages.thread_id
        AND (
          t.family_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = t.company_id AND cm.user_id = auth.uid()
          )
        )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 2FA / MFA — tabela kodów (TOTP secrets w auth.mfa_factors,
--    ale tu trzymamy SMS-OTP i one-time codes)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  purpose TEXT NOT NULL CHECK (purpose IN ('login', 'phone_verify', 'password_reset', 'sensitive_action')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user_purpose ON public.user_otp_codes(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.user_otp_codes(expires_at);

ALTER TABLE public.user_otp_codes ENABLE ROW LEVEL SECURITY;

-- OTP — tylko service_role może czytać/zapisywać (przez API endpoints)
DROP POLICY IF EXISTS "otp_no_direct_access" ON public.user_otp_codes;
CREATE POLICY "otp_no_direct_access" ON public.user_otp_codes
  FOR ALL USING (false);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RETENTION — auto-delete starych OTP po 24h (cron in app)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM public.user_otp_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours'
     OR consumed_at IS NOT NULL AND consumed_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────────────────────
