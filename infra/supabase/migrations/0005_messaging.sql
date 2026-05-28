-- 0005_messaging.sql
create type message_role as enum ('customer', 'company', 'system');

create table if not exists message_threads (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_email citext not null,
  customer_name text not null,
  subject text not null,
  booking_id uuid references bookings(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  unread_for_company int not null default 0,
  unread_for_customer int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists threads_company_idx on message_threads(company_id);
create index if not exists threads_customer_idx on message_threads(customer_user_id);
create index if not exists threads_email_idx on message_threads(customer_email);
create index if not exists threads_updated_idx on message_threads(updated_at desc);

drop trigger if exists threads_set_updated_at on message_threads;
create trigger threads_set_updated_at
  before update on message_threads
  for each row execute function set_updated_at();

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  author_role message_role not null,
  author_name text not null,
  body text not null check (length(body) between 1 and 4000),
  attachments jsonb default '[]',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_idx on messages(thread_id, created_at);

-- Trigger: bump thread on new message + update unread counters
create or replace function bump_thread_on_message()
returns trigger language plpgsql as $$
begin
  update message_threads
  set
    updated_at = now(),
    unread_for_company = case when new.author_role = 'customer' then unread_for_company + 1 else unread_for_company end,
    unread_for_customer = case when new.author_role = 'company' then unread_for_customer + 1 else unread_for_customer end
  where id = new.thread_id;
  return new;
end; $$;

drop trigger if exists messages_bump_thread on messages;
create trigger messages_bump_thread
  after insert on messages
  for each row execute function bump_thread_on_message();

-- RLS
alter table message_threads enable row level security;
alter table messages enable row level security;

drop policy if exists "threads_participant_read" on message_threads;
create policy "threads_participant_read" on message_threads
  for select using (
    customer_user_id = auth.uid()
    or customer_email = (select email::citext from auth.users where id = auth.uid())
    or is_company_member(company_id)
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "threads_participant_update" on message_threads;
create policy "threads_participant_update" on message_threads
  for update using (
    customer_user_id = auth.uid()
    or is_company_member(company_id)
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "messages_thread_participant" on messages;
create policy "messages_thread_participant" on messages
  for select using (
    exists (
      select 1 from message_threads t
      where t.id = messages.thread_id
      and (
        t.customer_user_id = auth.uid()
        or t.customer_email = (select email::citext from auth.users where id = auth.uid())
        or is_company_member(t.company_id)
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages
  for insert with check (
    exists (
      select 1 from message_threads t
      where t.id = messages.thread_id
      and (
        t.customer_user_id = auth.uid()
        or is_company_member(t.company_id)
      )
    )
  );
