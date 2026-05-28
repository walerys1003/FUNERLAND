-- Phase 3 follow-up: reconcile subscription_plan enum with billing/plans.ts.
--
-- The codebase uses PlanId = 'free' | 'standard' | 'pro' | 'premium', but the
-- original schema.sql defined the enum as ('basic', 'pro', 'premium', 'enterprise').
-- This migration adds the missing values so the SAME enum can be reused by
-- company_subscriptions inserts coming from Stripe webhooks and admin simulate UI
-- without lossy mapping.
--
-- IMPORTANT: ADD VALUE IF NOT EXISTS is non-destructive — existing rows are not
-- touched, the order in the enum is preserved, and old values ('basic',
-- 'enterprise') stay valid (treated as aliases by the application layer).
--
-- Application-layer mapping (see src/lib/billing/plan-mapping.ts):
--   'basic'      → 'standard'   (legacy alias)
--   'enterprise' → 'premium'    (legacy alias for top tier)

-- Add 'free' and 'standard' to the existing subscription_plan enum.
-- Postgres ≥ 12 supports IF NOT EXISTS.
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'subscription_plan' and e.enumlabel = 'free'
  ) then
    alter type subscription_plan add value 'free' before 'basic';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'subscription_plan' and e.enumlabel = 'standard'
  ) then
    -- Place 'standard' after 'basic' so the ordinal ordering reads:
    --   free (0), basic (1), standard (2), pro (3), premium (4), enterprise (5)
    alter type subscription_plan add value 'standard' after 'basic';
  end if;
end$$;

-- Backfill: any existing company.plan = 'basic' is functionally 'standard' in
-- the new scheme. We DO NOT auto-migrate — the value stays valid, the app maps
-- it at read time. This keeps the migration reversible.

-- Helper view: normalized plan (canonicalises legacy aliases).
create or replace view public.v_subscription_plan_canonical as
select
  s.id,
  s.company_id,
  s.plan,
  case s.plan::text
    when 'basic'      then 'standard'
    when 'enterprise' then 'premium'
    else s.plan::text
  end as canonical_plan,
  s.status,
  s.amount_cents,
  s.currency,
  s.period,
  s.current_period_end,
  s.created_at
from public.company_subscriptions s;

comment on view public.v_subscription_plan_canonical is
  'Reads company_subscriptions but maps legacy plan aliases (basic→standard, enterprise→premium) to the canonical PlanId used in src/lib/billing/plans.ts.';

-- =====================================================
-- Phase 3 follow-up: widen company_widgets.variant check constraint
-- =====================================================
-- Original 20260101 migration restricted variant to ('badge','reviews','cta','full').
-- The actual implementation (src/lib/widget/token.ts + /widget/[token]/embed)
-- uses ('card','banner','compact','reviews'). We broaden the check to accept both
-- vocabularies so existing rows stay valid and new code can write canonical values.

do $$
begin
  if exists (
    select 1
    from information_schema.constraint_column_usage ccu
    join information_schema.table_constraints tc
      on tc.constraint_name = ccu.constraint_name
    where ccu.table_name = 'company_widgets'
      and ccu.column_name = 'variant'
      and tc.constraint_type = 'CHECK'
  ) then
    alter table public.company_widgets drop constraint if exists company_widgets_variant_check;
  end if;
end$$;

alter table public.company_widgets
  add constraint company_widgets_variant_check
  check (variant in ('badge', 'reviews', 'cta', 'full', 'card', 'banner', 'compact'));

-- Make sure the column has a sensible default for the new vocabulary.
alter table public.company_widgets alter column variant set default 'card';

-- Add updated_at trigger if it isn't already attached (idempotent guard).
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_company_widgets'
  ) then
    create trigger set_updated_at_company_widgets
      before update on public.company_widgets
      for each row execute function set_updated_at();
  end if;
end$$;
