-- 0004_bookings_leads.sql

create type booking_status as enum ('new', 'confirmed', 'completed', 'cancelled');
create type lead_status as enum ('new', 'contacted', 'won', 'lost');
create type lead_source as enum ('booking', 'zapytanie', 'company-page', 'ai-match');

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  number text not null unique,
  category text not null,
  company_id uuid references companies(id) on delete set null,
  family_user_id uuid references auth.users(id) on delete set null,
  slot_start timestamptz,
  slot_end timestamptz,
  contact_name text not null,
  contact_email citext not null,
  contact_phone text not null,
  contact_city text,
  notes text,
  payload jsonb not null default '{}',
  status booking_status not null default 'new',
  ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_company_idx on bookings(company_id);
create index if not exists bookings_family_idx on bookings(family_user_id);
create index if not exists bookings_status_idx on bookings(status);
create index if not exists bookings_slot_idx on bookings(slot_start);
create index if not exists bookings_email_idx on bookings(contact_email);

drop trigger if exists bookings_set_updated_at on bookings;
create trigger bookings_set_updated_at
  before update on bookings
  for each row execute function set_updated_at();

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  category text,
  city text,
  contact_name text not null,
  contact_email citext not null,
  contact_phone text not null,
  message text,
  source lead_source not null default 'booking',
  status lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_company_idx on leads(company_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_idx on leads(created_at desc);

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- RLS
alter table bookings enable row level security;
alter table leads enable row level security;

-- Bookings: family sees their own; company-members see those for their company; admin sees all
drop policy if exists "bookings_family_read" on bookings;
create policy "bookings_family_read" on bookings
  for select using (
    family_user_id = auth.uid()
    or is_company_member(company_id)
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Insert: anonymous booking via service-role only (API route); authenticated users can insert their own
drop policy if exists "bookings_self_insert" on bookings;
create policy "bookings_self_insert" on bookings
  for insert with check (family_user_id = auth.uid() or family_user_id is null);

drop policy if exists "bookings_company_update" on bookings;
create policy "bookings_company_update" on bookings
  for update using (is_company_member(company_id))
  with check (is_company_member(company_id));

-- Leads: only company members and admin
drop policy if exists "leads_company_read" on leads;
create policy "leads_company_read" on leads
  for select using (
    is_company_member(company_id)
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "leads_company_update" on leads;
create policy "leads_company_update" on leads
  for update using (is_company_member(company_id))
  with check (is_company_member(company_id));
