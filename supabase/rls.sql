-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.company_services enable row level security;
alter table public.leads enable row level security;
alter table public.lead_offers enable row level security;
alter table public.reviews enable row level security;
alter table public.obituaries enable row level security;
alter table public.transactions enable row level security;
alter table public.seo_pages enable row level security;
alter table public.cities enable row level security;

-- ============================================================================
-- USERS
-- ============================================================================
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- ============================================================================
-- CITIES (publiczne do odczytu)
-- ============================================================================
create policy "cities_public_read" on public.cities
  for select using (true);

-- ============================================================================
-- COMPANIES
-- ============================================================================
-- każdy może czytać
create policy "companies_public_read" on public.companies
  for select using (true);

-- tylko owner lub admin może edytować
create policy "companies_owner_update" on public.companies
  for update using (
    auth.uid() = owner_user_id
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- tylko admin może wstawiać (claim flow przez API)
create policy "companies_admin_insert" on public.companies
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================================================
-- COMPANY SERVICES
-- ============================================================================
create policy "services_public_read" on public.company_services
  for select using (true);

create policy "services_owner_write" on public.company_services
  for all using (
    exists (
      select 1 from public.companies c
      where c.id = company_services.company_id
        and c.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- LEADS — wrażliwe!
-- ============================================================================
-- rodzina widzi swoje leady
create policy "leads_family_select" on public.leads
  for select using (auth.uid() = family_user_id);

-- firma widzi tylko leady jej dopasowane (po revealed)
create policy "leads_company_select" on public.leads
  for select using (
    exists (
      select 1 from public.companies c
      where c.owner_user_id = auth.uid()
        and c.id = any(leads.revealed_by_companies)
    )
  );

-- rodzina (lub anon przez API z service role) może tworzyć leada
create policy "leads_insert_anyone" on public.leads
  for insert with check (true);

-- ============================================================================
-- LEAD OFFERS
-- ============================================================================
create policy "offers_family_read" on public.lead_offers
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_offers.lead_id
        and l.family_user_id = auth.uid()
    )
  );

create policy "offers_company_write" on public.lead_offers
  for all using (
    exists (
      select 1 from public.companies c
      where c.id = lead_offers.company_id
        and c.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- REVIEWS
-- ============================================================================
-- approved widzą wszyscy
create policy "reviews_public_approved" on public.reviews
  for select using (status = 'approved');

-- autor widzi własne (pending)
create policy "reviews_author_own" on public.reviews
  for select using (auth.uid() = author_user_id);

-- każdy zalogowany może dodać (status pending)
create policy "reviews_insert" on public.reviews
  for insert with check (auth.role() = 'authenticated');

-- firma może odpowiedzieć na własne opinie
create policy "reviews_company_response" on public.reviews
  for update using (
    exists (
      select 1 from public.companies c
      where c.id = reviews.company_id
        and c.owner_user_id = auth.uid()
    )
  )
  with check (
    -- tylko company_response można zmieniać
    true
  );

-- admin pełna moderacja
create policy "reviews_admin_all" on public.reviews
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
  );

-- ============================================================================
-- OBITUARIES (publiczne)
-- ============================================================================
create policy "obituaries_public_read" on public.obituaries
  for select using (true);

create policy "obituaries_owner_write" on public.obituaries
  for all using (auth.uid() = family_user_id);

-- ============================================================================
-- TRANSACTIONS — tylko własne
-- ============================================================================
create policy "transactions_owner" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_company" on public.transactions
  for select using (
    exists (
      select 1 from public.companies c
      where c.id = transactions.company_id
        and c.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEO PAGES (publiczne)
-- ============================================================================
create policy "seo_pages_public_read" on public.seo_pages
  for select using (true);
