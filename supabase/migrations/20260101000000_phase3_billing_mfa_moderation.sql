-- ============================================================================
-- Phase 3 migration — Billing (Stripe), MFA audit, Review flags (moderation AI)
-- Author: Agent 4 — Schema steward
-- Date: 2026-01-01
-- ============================================================================
-- Run order: after supabase/schema.sql + supabase/rls.sql.
-- Idempotent: safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) COMPANY_SUBSCRIPTIONS — full Stripe subscription history
--    The existing `companies` table holds the CURRENT plan only.
--    This table is the audit log + source of truth for billing events.
-- ----------------------------------------------------------------------------
create table if not exists public.company_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status not null default 'trialing',

  -- Stripe identifiers
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,

  -- Pricing snapshot at time of subscription
  amount_cents integer not null default 0,    -- e.g. 34900 = 349.00 PLN
  currency text not null default 'PLN',
  period text not null default 'month',       -- 'month' | 'year'

  -- Period tracking
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,

  -- Lifecycle
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_company_subscriptions_company on public.company_subscriptions(company_id);
create index if not exists idx_company_subscriptions_status on public.company_subscriptions(status);
create index if not exists idx_company_subscriptions_period_end on public.company_subscriptions(current_period_end);

-- Auto-update timestamp
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_company_subscriptions_updated on public.company_subscriptions;
create trigger trg_company_subscriptions_updated
  before update on public.company_subscriptions
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 2) BILLING_EVENTS — raw Stripe webhook events for replay/debugging
-- ----------------------------------------------------------------------------
create table if not exists public.billing_events (
  id uuid primary key default uuid_generate_v4(),
  stripe_event_id text unique not null,
  event_type text not null,                   -- 'checkout.session.completed' etc.
  payload jsonb not null,
  processed boolean default false,
  processed_at timestamptz,
  error text,
  created_at timestamptz default now()
);

create index if not exists idx_billing_events_processed on public.billing_events(processed) where processed = false;
create index if not exists idx_billing_events_type on public.billing_events(event_type);


-- ----------------------------------------------------------------------------
-- 3) MFA_AUDIT — audit log of 2FA enrollment / verify / disable
--    Supabase manages factor data; we keep our own audit trail for security review.
-- ----------------------------------------------------------------------------
create table if not exists public.mfa_audit (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('enroll', 'verify', 'disable', 'challenge_failed')),
  factor_id text,
  factor_type text default 'totp',
  ip inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_mfa_audit_user on public.mfa_audit(user_id, created_at desc);

-- Helper view: which users have at least one verified TOTP factor?
-- (Supabase's auth.mfa_factors is a managed table — this view joins our audit log
--  with the latest "verify" action per user as a denormalized convenience read.)
create or replace view public.users_with_mfa as
  select distinct user_id
  from public.mfa_audit
  where action = 'verify';


-- ----------------------------------------------------------------------------
-- 4) REVIEW_FLAGS — moderation AI flags + manual reports
--    Stores both auto-detected (Agent 6) and user-reported flags on reviews.
-- ----------------------------------------------------------------------------
create table if not exists public.review_flags (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  source text not null check (source in ('auto', 'user', 'admin')),
  reason text not null,                       -- 'profanity', 'spam', 'pii', 'off-topic', 'manual'
  score numeric(4,3) check (score >= 0 and score <= 1), -- confidence 0..1
  details jsonb,                              -- {matched_terms: [], heuristic: '...'}
  reporter_id uuid references auth.users(id) on delete set null,
  resolved boolean default false,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_review_flags_review on public.review_flags(review_id);
create index if not exists idx_review_flags_unresolved on public.review_flags(resolved) where resolved = false;
create index if not exists idx_review_flags_source on public.review_flags(source);


-- ----------------------------------------------------------------------------
-- 5) COMPANY_WIDGETS — embeddable widget config (Agent 8, Premium feature)
-- ----------------------------------------------------------------------------
create table if not exists public.company_widgets (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  token text unique not null,                 -- public widget token (used in <script src=...?token=>)
  variant text default 'badge' check (variant in ('badge', 'reviews', 'cta', 'full')),
  theme text default 'light' check (theme in ('light', 'dark', 'auto')),
  primary_color text default '#2E4F3E',
  allowed_origins text[] default array[]::text[], -- empty = allow all (Premium auto-restricts)
  views integer default 0,
  clicks integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_company_widgets_company_variant
  on public.company_widgets(company_id, variant);
create index if not exists idx_company_widgets_token on public.company_widgets(token);

drop trigger if exists trg_company_widgets_updated on public.company_widgets;
create trigger trg_company_widgets_updated
  before update on public.company_widgets
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 6) AI_MATCH_QUERIES — log AI matching engine queries for analytics
-- ----------------------------------------------------------------------------
create table if not exists public.ai_match_queries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  query text,
  filter_state jsonb,                         -- serialized FilterState
  results_count integer,
  clicked_company_id uuid references public.companies(id) on delete set null,
  clicked_position integer,
  ip inet,
  created_at timestamptz default now()
);

create index if not exists idx_ai_match_queries_created on public.ai_match_queries(created_at desc);
create index if not exists idx_ai_match_queries_user on public.ai_match_queries(user_id);


-- ============================================================================
-- RLS POLICIES for new tables
-- ============================================================================

-- company_subscriptions: admins read all, company owners read their own, no inserts from clients
alter table public.company_subscriptions enable row level security;

drop policy if exists subs_admin_all on public.company_subscriptions;
create policy subs_admin_all on public.company_subscriptions
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

drop policy if exists subs_owner_read on public.company_subscriptions;
create policy subs_owner_read on public.company_subscriptions
  for select using (
    company_id in (
      select c.id from public.companies c
      where c.owner_id = auth.uid()
    )
  );

-- billing_events: only service role (no public access)
alter table public.billing_events enable row level security;
drop policy if exists billing_events_no_public on public.billing_events;
create policy billing_events_no_public on public.billing_events
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- mfa_audit: user reads own, admin reads all
alter table public.mfa_audit enable row level security;
drop policy if exists mfa_audit_own on public.mfa_audit;
create policy mfa_audit_own on public.mfa_audit
  for select using (user_id = auth.uid());
drop policy if exists mfa_audit_admin on public.mfa_audit;
create policy mfa_audit_admin on public.mfa_audit
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- review_flags: admin all, reporter reads own
alter table public.review_flags enable row level security;
drop policy if exists review_flags_admin on public.review_flags;
create policy review_flags_admin on public.review_flags
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
drop policy if exists review_flags_reporter_read on public.review_flags;
create policy review_flags_reporter_read on public.review_flags
  for select using (reporter_id = auth.uid());

-- company_widgets: company owners + admins; public read by token only (via service-role endpoint)
alter table public.company_widgets enable row level security;
drop policy if exists widgets_owner_all on public.company_widgets;
create policy widgets_owner_all on public.company_widgets
  for all using (
    company_id in (select id from public.companies where owner_id = auth.uid())
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ai_match_queries: admin reads all, users read own
alter table public.ai_match_queries enable row level security;
drop policy if exists ai_queries_admin on public.ai_match_queries;
create policy ai_queries_admin on public.ai_match_queries
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
drop policy if exists ai_queries_own on public.ai_match_queries;
create policy ai_queries_own on public.ai_match_queries
  for select using (user_id = auth.uid());


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Has company X an active subscription on plan Y (or higher)?
create or replace function public.company_has_plan(
  p_company_id uuid,
  p_min_plan subscription_plan
) returns boolean
language plpgsql security definer as $$
declare
  v_current subscription_plan;
  v_rank int;
  v_min int;
begin
  select plan into v_current from public.companies where id = p_company_id;
  v_rank := case v_current
    when 'enterprise' then 4
    when 'premium'    then 3
    when 'pro'        then 2
    when 'basic'      then 1
    else 0 end;
  v_min := case p_min_plan
    when 'enterprise' then 4
    when 'premium'    then 3
    when 'pro'        then 2
    when 'basic'      then 1
    else 0 end;
  return v_rank >= v_min;
end;
$$;

-- Mark a review for moderation review when it has unresolved auto-flags
create or replace function public.apply_review_auto_flags()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.review_flags
    where review_id = new.id and source = 'auto' and resolved = false and score >= 0.7
  ) then
    new.status := 'flagged'::review_status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reviews_auto_flag on public.reviews;
create trigger trg_reviews_auto_flag
  before insert or update on public.reviews
  for each row execute function public.apply_review_auto_flags();


-- ============================================================================
-- COMMENTS for self-documenting schema
-- ============================================================================
comment on table public.company_subscriptions is 'Stripe subscription history for marketplace companies (audit log)';
comment on table public.billing_events is 'Raw Stripe webhook events for replay/debugging';
comment on table public.mfa_audit is 'Audit trail of 2FA actions (Agent 2)';
comment on table public.review_flags is 'Moderation AI flags + user reports on reviews (Agent 6)';
comment on table public.company_widgets is 'Embeddable widget config (Agent 8, Premium plan)';
comment on table public.ai_match_queries is 'AI matching engine query log (Agent 9)';
comment on function public.company_has_plan is 'Check if a company has at least the given subscription tier';
