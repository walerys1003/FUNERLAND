-- 0003_companies.sql
-- Companies (marketplace listings) + multi-user company_members.

create type company_category as enum ('pogrzeby', 'kremacja', 'kwiaciarnie', 'kamieniarze', 'transport');
create type company_plan as enum ('free', 'standard', 'pro', 'premium');
create type member_role as enum ('owner', 'admin', 'agent');

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  category company_category not null,
  city text not null,
  city_slug text not null,
  district text,
  address text,
  phone text,
  phone_24h boolean not null default false,
  email citext,
  website text,
  -- geo
  lat double precision,
  lng double precision,
  geom geography(point, 4326),
  -- presentation
  description text,
  image_url text,
  banner_url text,
  features text[] default '{}',
  -- business
  years_active int default 0,
  is_verified boolean not null default false,
  verified_year int,
  plan company_plan not null default 'free',
  -- aggregates (denormalized — updated via triggers/jobs)
  rating numeric(2,1) not null default 0,
  reviews_count int not null default 0,
  -- ai embedding (1536-dim for OpenAI text-embedding-3-small)
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_city_idx on companies(city_slug);
create index if not exists companies_category_idx on companies(category);
create index if not exists companies_geom_idx on companies using gist (geom);
create index if not exists companies_rating_idx on companies(rating desc);
create index if not exists companies_slug_trgm on companies using gin (slug gin_trgm_ops);
create index if not exists companies_name_trgm on companies using gin (name gin_trgm_ops);
-- ivfflat needs lists tuned by row-count; create after seed in production.
-- create index companies_embedding_idx on companies using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Keep geography in sync with lat/lng
create or replace function companies_set_geom()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  else
    new.geom := null;
  end if;
  return new;
end; $$;

drop trigger if exists companies_geom_trigger on companies;
create trigger companies_geom_trigger
  before insert or update on companies
  for each row execute function companies_set_geom();

drop trigger if exists companies_set_updated_at on companies;
create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- Services (per company)
create table if not exists company_services (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  price_from numeric(10,2),
  position int default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_services_company_idx on company_services(company_id);

-- Membership (who can manage a company)
create table if not exists company_members (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role member_role not null default 'agent',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create index if not exists company_members_user_idx on company_members(user_id);

-- Helper function: is the current user a member of the company?
create or replace function is_company_member(p_company uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from company_members m
    where m.company_id = p_company and m.user_id = auth.uid()
  );
$$;

-- RLS
alter table companies enable row level security;
alter table company_services enable row level security;
alter table company_members enable row level security;

drop policy if exists "companies_public_read" on companies;
create policy "companies_public_read" on companies
  for select using (true);

drop policy if exists "companies_owner_update" on companies;
create policy "companies_owner_update" on companies
  for update using (is_company_member(id))
  with check (is_company_member(id));

drop policy if exists "companies_admin_all" on companies;
create policy "companies_admin_all" on companies
  for all using ((select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "services_public_read" on company_services;
create policy "services_public_read" on company_services
  for select using (true);

drop policy if exists "services_owner_write" on company_services;
create policy "services_owner_write" on company_services
  for all using (is_company_member(company_id))
  with check (is_company_member(company_id));

drop policy if exists "members_self_read" on company_members;
create policy "members_self_read" on company_members
  for select using (user_id = auth.uid() or is_company_member(company_id));

drop policy if exists "members_owner_write" on company_members;
create policy "members_owner_write" on company_members
  for all using (
    exists (select 1 from company_members m where m.company_id = company_members.company_id and m.user_id = auth.uid() and m.member_role = 'owner')
    or (select role from profiles where id = auth.uid()) = 'admin'
  );
