-- 00012_waitlist_leads.sql
-- Lane E of Rev5 iter2 "AI-Assisted Scenario" pivot.
-- Stores waitlist signups from /scenarios page (pre-Gumroad pre-order pool).
--
-- DEPLOY NOTE (per CLAUDE.md): executed manually via Supabase Studio > SQL Editor
-- BEFORE npm run deploy. Ralph does NOT run migrations.
--
-- RLS model: no policies for anon/authenticated (default DENY on all ops).
-- Writes go through Server Actions using SUPABASE_SERVICE_ROLE_KEY (RLS-bypass).

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id                bigserial PRIMARY KEY,
  email             text NOT NULL,
  consent_marketing boolean NOT NULL DEFAULT false,
  source            text NOT NULL DEFAULT 'scenarios_page',
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness on email.
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_leads_email_lower_idx
  ON public.waitlist_leads (lower(email));

-- Lookup helper for "N / 10" counter and recent-activity queries.
CREATE INDEX IF NOT EXISTS waitlist_leads_created_at_idx
  ON public.waitlist_leads (created_at DESC);

ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- No policies: anon + authenticated see nothing. Service-role bypasses RLS.
-- If a future read-endpoint is added, add an explicit SELECT policy here.
