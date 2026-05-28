-- 0002_profiles_roles.sql
-- User profiles + role-based access. Each auth.users row has 1 profiles row.
-- A profile can be linked to multiple company_members (one user may run multiple firms).

create type user_role as enum ('family', 'company', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'family',
  full_name text,
  phone text,
  city text,
  avatar_url text,
  marketing_opt_in boolean not null default false,
  rodo_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;

drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles
  for select using (auth.uid() = id or (select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles
  for all using ((select role from profiles where id = auth.uid()) = 'admin');
