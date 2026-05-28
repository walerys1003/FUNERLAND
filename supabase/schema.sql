-- ============================================================================
-- Polskie Pogrzeby — Database Schema
-- PostgreSQL 15+ / Supabase
-- Author: Agent 1 — Master Builder
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";   -- fuzzy search
create extension if not exists "postgis";   -- geo queries

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
create type user_role as enum ('family', 'company_owner', 'admin', 'editor');
create type lead_status as enum ('new', 'viewed', 'contacted', 'won', 'lost', 'expired');
create type subscription_plan as enum ('basic', 'pro', 'premium', 'enterprise');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type review_status as enum ('pending', 'approved', 'rejected', 'flagged');
create type service_category as enum (
  'zaklady-pogrzebowe',
  'kremacja',
  'kwiaciarnie-pogrzebowe',
  'kamieniarze',
  'transport-zwlok',
  'transmisje-online',
  'mistrzowie-ceremonii',
  'cennik-pogrzebu'
);

-- ============================================================================
-- USERS (extends auth.users)
-- ============================================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  role user_role default 'family',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- CITIES
-- ============================================================================
create table public.cities (
  id serial primary key,
  slug text unique not null,
  name text not null,
  voivodeship text not null,
  population integer,
  has_crematorium boolean default false,
  cemeteries_count integer default 0,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);
create index on public.cities (slug);

-- ============================================================================
-- COMPANIES
-- ============================================================================
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  city_id integer references public.cities(id),
  address text,
  postal_code text,
  district text,
  lat double precision,
  lng double precision,

  phone text,
  email text,
  website text,
  nip text unique,
  krs text,

  -- categories array (multi)
  categories service_category[] default '{}',

  -- meta
  description text,
  founded_year integer,
  employees_count text,
  available_24_7 boolean default false,
  verified boolean default false,
  verified_at timestamptz,

  -- ratings (cached)
  rating_avg numeric(2,1) default 0,
  rating_count integer default 0,
  leads_count integer default 0,
  response_time_avg interval,

  -- subscription
  plan subscription_plan default 'basic',
  subscription_status subscription_status default 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text,

  -- ownership
  owner_user_id uuid references public.users(id) on delete set null,
  claimed boolean default false,
  claimed_at timestamptz,

  -- media
  logo_url text,
  banner_url text,
  gallery_urls text[] default '{}',

  -- SEO
  meta_title text,
  meta_description text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.companies (city_id);
create index on public.companies (slug);
create index on public.companies using gin (categories);
create index on public.companies using gin (name gin_trgm_ops);

-- ============================================================================
-- SERVICES (cennik per firma)
-- ============================================================================
create table public.company_services (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  category service_category not null,
  name text not null,
  description text,
  price_from integer,        -- w groszach
  price_to integer,
  unit text default 'PLN',
  included text[] default '{}',
  position integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);
create index on public.company_services (company_id);

-- ============================================================================
-- LEADS (zapytania od rodzin)
-- ============================================================================
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  -- kontakt rodziny
  family_user_id uuid references public.users(id) on delete set null,
  family_name text not null,
  family_phone text not null,
  family_email text,

  -- gdzie
  city_id integer references public.cities(id),
  district text,

  -- co
  ceremony_type text,         -- 'pochowek', 'kremacja', 'swiecki'
  budget_range text,          -- '<10k', '10-15k', '15-25k', '25k+'
  needed_date date,
  urgent boolean default false,
  notes text,
  consents jsonb default '{}',

  -- routing
  matched_companies uuid[] default '{}',
  sent_to_companies uuid[] default '{}',
  contacted_by uuid[] default '{}',

  status lead_status default 'new',
  score integer default 0,
  source text default 'organic',
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- pay-per-reveal
  reveal_price integer default 4900,  -- 49 zł w groszach
  revealed_by_companies uuid[] default '{}',

  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '72 hours')
);
create index on public.leads (city_id);
create index on public.leads (status);
create index on public.leads (created_at desc);

-- ============================================================================
-- LEAD OFFERS (oferty firm na lead)
-- ============================================================================
create table public.lead_offers (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  price_total integer,        -- w groszach
  price_breakdown jsonb default '{}',
  message text,
  available_date date,
  status text default 'sent',  -- 'sent', 'viewed', 'accepted', 'declined'
  viewed_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique (lead_id, company_id)
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  author_user_id uuid references public.users(id) on delete set null,
  author_name text not null,
  author_email text,

  rating integer not null check (rating between 1 and 5),
  title text,
  content text not null,

  -- weryfikacja
  verified_purchase boolean default false,
  verification_lead_id uuid references public.leads(id),
  status review_status default 'pending',

  -- response
  company_response text,
  company_response_at timestamptz,

  -- moderacja
  flagged_reasons text[] default '{}',
  moderated_by uuid references public.users(id),
  moderated_at timestamptz,

  created_at timestamptz default now()
);
create index on public.reviews (company_id, status);

-- ============================================================================
-- OBITUARIES (nekrologi)
-- ============================================================================
create table public.obituaries (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,

  full_name text not null,
  born_date date,
  died_date date not null,
  city_id integer references public.cities(id),

  photo_url text,
  message text,
  ceremony_date timestamptz,
  ceremony_location text,
  cemetery text,

  family_user_id uuid references public.users(id),
  company_id uuid references public.companies(id),
  premium boolean default false,
  premium_until timestamptz,

  views_count integer default 0,
  candles_count integer default 0,

  created_at timestamptz default now()
);

-- ============================================================================
-- TRANSACTIONS (Stripe + P24)
-- ============================================================================
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  company_id uuid references public.companies(id),

  type text not null,             -- 'subscription', 'lead_reveal', 'obituary_premium', 'one_time'
  amount integer not null,        -- w groszach
  currency text default 'PLN',

  provider text not null,         -- 'stripe', 'p24'
  provider_id text,
  status text default 'pending',  -- 'pending', 'succeeded', 'failed', 'refunded'

  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create index on public.transactions (company_id, type);
create index on public.transactions (status);

-- ============================================================================
-- SEO PAGES (programmatic)
-- ============================================================================
create table public.seo_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  type text not null,           -- 'city-category', 'cennik', 'guide'
  city_id integer references public.cities(id),
  category service_category,

  title text not null,
  h1 text not null,
  meta_description text,
  intro text,
  content jsonb default '{}',   -- sekcje, FAQ, cmentarze, parafie

  views_count integer default 0,
  last_generated_at timestamptz default now(),
  created_at timestamptz default now()
);
create index on public.seo_pages (type, city_id);

-- ============================================================================
-- TRIGGERS — updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TRIGGER — refresh company rating cache
-- ============================================================================
create or replace function public.refresh_company_rating()
returns trigger as $$
begin
  update public.companies
  set
    rating_avg = (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews
                   where company_id = new.company_id and status = 'approved'),
    rating_count = (select count(*) from public.reviews
                     where company_id = new.company_id and status = 'approved')
  where id = new.company_id;
  return new;
end;
$$ language plpgsql;

create trigger reviews_refresh_rating
  after insert or update of status on public.reviews
  for each row execute function public.refresh_company_rating();
