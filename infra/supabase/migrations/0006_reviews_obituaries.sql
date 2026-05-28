-- 0006_reviews_obituaries.sql
create type review_status as enum ('pending', 'published', 'rejected');
create type obituary_tier as enum ('free', 'premium');
create type obituary_status as enum ('draft', 'published', 'archived');

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text not null check (length(title) between 5 and 120),
  body text not null check (length(body) between 30 and 2000),
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_email citext not null,
  verified boolean not null default false,
  status review_status not null default 'pending',
  reply_body text,
  reply_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reviews_company_idx on reviews(company_id);
create index if not exists reviews_status_idx on reviews(status);
create index if not exists reviews_rating_idx on reviews(rating);

-- Update company aggregates on review publish
create or replace function refresh_company_rating(p_company uuid)
returns void language sql as $$
  update companies
  set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where company_id = p_company and status = 'published'), 0),
    reviews_count = (select count(*) from reviews where company_id = p_company and status = 'published')
  where id = p_company;
$$;

create or replace function reviews_after_publish()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' then
    perform refresh_company_rating(new.company_id);
  end if;
  return new;
end; $$;

drop trigger if exists reviews_aggregate on reviews;
create trigger reviews_aggregate
  after insert or update of status on reviews
  for each row execute function reviews_after_publish();

-- Obituaries
create table if not exists obituaries (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  person_name text not null,
  birth_date date,
  death_date date not null,
  city text not null,
  funeral_date timestamptz,
  funeral_place text,
  body text not null check (length(body) between 20 and 4000),
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_email citext not null,
  photo_url text,
  candles int not null default 0,
  tier obituary_tier not null default 'free',
  status obituary_status not null default 'published',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists obituaries_city_idx on obituaries(city);
create index if not exists obituaries_created_idx on obituaries(created_at desc);
create index if not exists obituaries_status_idx on obituaries(status);
create index if not exists obituaries_slug_trgm on obituaries using gin (person_name gin_trgm_ops);

create table if not exists candles (
  id uuid primary key default uuid_generate_v4(),
  obituary_id uuid not null references obituaries(id) on delete cascade,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (obituary_id, ip_hash)
);

-- Trigger: bump candle count
create or replace function bump_candle_count()
returns trigger language plpgsql as $$
begin
  update obituaries set candles = candles + 1 where id = new.obituary_id;
  return new;
end; $$;

drop trigger if exists candles_bump_count on candles;
create trigger candles_bump_count
  after insert on candles
  for each row execute function bump_candle_count();

-- RLS
alter table reviews enable row level security;
alter table obituaries enable row level security;
alter table candles enable row level security;

drop policy if exists "reviews_public_read" on reviews;
create policy "reviews_public_read" on reviews
  for select using (status = 'published' or is_company_member(company_id) or (select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "reviews_self_insert" on reviews;
create policy "reviews_self_insert" on reviews
  for insert with check (author_user_id = auth.uid() or author_user_id is null);

drop policy if exists "reviews_company_reply" on reviews;
create policy "reviews_company_reply" on reviews
  for update using (is_company_member(company_id) or (select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "obituaries_public_read" on obituaries;
create policy "obituaries_public_read" on obituaries
  for select using (status = 'published');

drop policy if exists "obituaries_self_insert" on obituaries;
create policy "obituaries_self_insert" on obituaries
  for insert with check (author_user_id = auth.uid() or author_user_id is null);

drop policy if exists "obituaries_self_update" on obituaries;
create policy "obituaries_self_update" on obituaries
  for update using (author_user_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "candles_public_insert" on candles;
create policy "candles_public_insert" on candles
  for insert with check (true);

drop policy if exists "candles_public_read" on candles;
create policy "candles_public_read" on candles
  for select using (true);
