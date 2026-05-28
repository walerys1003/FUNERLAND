-- 0007_ai_audit.sql
-- AI request log + general audit log for compliance.

create table if not exists ai_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  endpoint text not null,
  model text,
  prompt text,
  response text,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,5),
  flagged text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists ai_logs_user_idx on ai_logs(user_id);
create index if not exists ai_logs_session_idx on ai_logs(session_id);
create index if not exists ai_logs_endpoint_idx on ai_logs(endpoint);
create index if not exists ai_logs_created_idx on ai_logs(created_at desc);

-- Generic audit log (RODO + compliance)
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}',
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_user_idx on audit_log(user_id);
create index if not exists audit_action_idx on audit_log(action);
create index if not exists audit_created_idx on audit_log(created_at desc);

-- Generic helper: log an action from PL/pgSQL (used by triggers)
create or replace function log_audit(p_action text, p_entity_type text, p_entity_id text, p_metadata jsonb default '{}')
returns void language sql as $$
  insert into audit_log (user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
$$;

-- RLS
alter table ai_logs enable row level security;
alter table audit_log enable row level security;

drop policy if exists "ai_logs_self_read" on ai_logs;
create policy "ai_logs_self_read" on ai_logs
  for select using (user_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');

drop policy if exists "audit_admin_read" on audit_log;
create policy "audit_admin_read" on audit_log
  for select using ((select role from profiles where id = auth.uid()) = 'admin' or user_id = auth.uid());
