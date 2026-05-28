# Supabase migrations

Apply in order:

```bash
# Self-hosted (Docker) — paste into psql inside supabase-db container
for f in infra/supabase/migrations/*.sql; do
  echo "==> $f"
  docker exec -i supabase-db psql -U postgres -d postgres < "$f"
done
```

For Supabase Cloud:
```bash
# Using supabase CLI (recommended)
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

## Order
1. `0001_extensions.sql` — uuid, pgcrypto, citext, pg_trgm, postgis, vector
2. `0002_profiles_roles.sql` — profiles + role enum + auth trigger
3. `0003_companies.sql` — companies, services, members + geo
4. `0004_bookings_leads.sql` — bookings + leads (RLS-scoped to company members)
5. `0005_messaging.sql` — threads + messages with unread counters
6. `0006_reviews_obituaries.sql` — reviews aggregate + obituaries + candles
7. `0007_ai_audit.sql` — ai_logs + audit_log (compliance)

## RLS summary

| Table | Read | Write |
|-------|------|-------|
| profiles | self + admin | self |
| companies | public | members + admin |
| company_services | public | members + admin |
| bookings | self + members + admin | self insert; members update |
| leads | members + admin | members update |
| message_threads | participants + admin | participants update |
| messages | thread participants | thread participants insert |
| reviews | public (published) + members + admin | self insert; members reply |
| obituaries | public (published) | self insert/update + admin |
| candles | public | public insert |
| ai_logs | self + admin | service-role only |
| audit_log | self + admin | service-role only (via `log_audit`) |
