# Launch Checklist — PolskiePogrzeby.pl

**Cel:** wystartować produkcyjnie MVP w 14 dni od `t-0`.
**Brand essence:** Pożegnaj godnie. Bez presji. Bez ukrytych kosztów.

---

## T-14 do T-7 — Twardy fundament

### Infrastruktura
- [ ] Domena `polskiepogrzeby.pl` + Cloudflare DNS (CDN, WAF, Bot Fight Mode)
- [ ] Hosting VPS (Hetzner CCX23 lub Contabo VDS L) z Coolify
- [ ] SSL Let's Encrypt + auto-renew przez Traefik
- [ ] Backup strategy: pg_dump 1×/dobę → MinIO + cron weekly do offsite
- [ ] Monitoring: Uptime Kuma + Plausible + Sentry
- [ ] Self-hosted Supabase (Postgres + Auth + Storage + Realtime + PostgREST + GoTrue)
- [ ] Meilisearch instance + master key + index keys
- [ ] Redis (queue + cache)
- [ ] Container registry (GHCR) + GitHub Actions CI/CD

### Baza danych
- [ ] Uruchom `supabase/schema.sql` w produkcji
- [ ] Uruchom `supabase/rls.sql` i sprawdź wszystkie polityki
- [ ] Załaduj `supabase/seed.sql` (7 miast, 9 firm seed, 8 kategorii)
- [ ] Indeksy: trgm name, gin categories, gist geo
- [ ] PostGIS extension + index na `companies(location)`

### Płatności
- [ ] Stripe konto + KYC + Polska VAT
- [ ] Przelewy24 konto + integracja BLIK
- [ ] Webhook secrets w Vault/env
- [ ] Testowe transakcje (sandbox): 3× sub, 3× lead unlock, 3× obituary

### Komunikacja
- [ ] Resend domena + DKIM/SPF/DMARC zweryfikowane
- [ ] SMSAPI.pl konto + sender ID "PolPogrzeby"
- [ ] Twilio fallback (USA/UK leads)
- [ ] Wszystkie templaty 4× e-mail + 3× SMS przetestowane

---

## T-7 do T-3 — Treść i SEO

- [ ] 8 artykułów `/poradnik/[slug]` opublikowanych
- [ ] OG image generator (`/api/og?title=...`) + per-artykuł
- [ ] `sitemap.xml` + `robots.txt` zatwierdzone w GSC
- [ ] Schema.org JSON-LD na każdej stronie (Organization, LocalBusiness, FAQPage, Article, BreadcrumbList)
- [ ] Internal linking: każdy artykuł → 3-5 powiązanych
- [ ] Meta titles ≤60 znaków, descriptions ≤155 znaków, brak duplicate
- [ ] Lighthouse Mobile ≥90 (Perf/A11y/BP/SEO)
- [ ] Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms
- [ ] Hreflang `pl-PL` na wszystkich stronach
- [ ] Google Search Console + Bing Webmaster + Plausible verify

---

## T-3 do T-1 — Polish & QA

### Funkcjonalność
- [ ] Test end-to-end: zapytanie → routing → notyfikacje → company panel
- [ ] Test booking flow 6 kroków (5 kategorii × 3 scenariusze = 15 ścieżek)
- [ ] Test AI assistant z 20 realnymi pytaniami żałobnymi
- [ ] Test wyszukiwarki Meilisearch: 50 queries (typo tolerance, semantyka, lokalizacja)
- [ ] Test claim flow (NIP + email firmowy + telefon)
- [ ] Test recenzji (token + anti-spam threshold)

### A11y i UX
- [ ] WCAG 2.1 AA: contrast 4.5:1, focus visible, ARIA labels, keyboard nav
- [ ] Mobile: testowane na iPhone SE / Galaxy A50 / iPad
- [ ] Empty states + error states + loading skeletons we wszystkich widokach
- [ ] 404 + 500 strony z empatycznym tonem
- [ ] Cookie banner (Plausible cookie-less = brak banera potrzebny)
- [ ] RODO: polityka prywatności + regulamin + checkbox consent w formularzach

### Bezpieczeństwo
- [ ] Pen-test podstawowy (OWASP Top 10)
- [ ] Rate limiting na `/api/lead`, `/api/claim`, `/api/ai/chat`
- [ ] CAPTCHA (Cloudflare Turnstile) na publicznych formularzach
- [ ] RLS verified na wszystkich tabelach (assertions test)
- [ ] Secrets w env vault, nigdy nie w repo
- [ ] CSP headers + HSTS + X-Frame-Options

---

## T-0 — LAUNCH DAY

### 06:00 — Przed otwarciem
- [ ] Final smoke test produkcji (3 scenariusze e2e)
- [ ] Włącz Plausible + Sentry alerty
- [ ] Sprawdź backup status (last < 24h)
- [ ] Status page online

### 09:00 — Publiczny start
- [ ] DNS propagation verify (dig polskiepogrzeby.pl)
- [ ] Submit sitemap do GSC + Bing
- [ ] Post na LinkedIn (CEO + firma)
- [ ] Post na FB + Instagram (oficjalny)
- [ ] Outreach email do 100 zakładów pogrzebowych (template `01-pierwsze-wejscie.md`)
- [ ] Press release do branżowych mediów (Gazeta Funeralna, Branża Pogrzebowa.pl)

### 12:00 — Monitoring
- [ ] Sprawdź logi (Sentry, Coolify, Plausible)
- [ ] Sprawdź pierwsze leady — czy notyfikacje działają?
- [ ] Sprawdź Lighthouse production (real device)

### 18:00 — Daily recap
- [ ] KPI dzień 1: unique visitors, leady, claim requests
- [ ] Issues zgłoszone → priorytetyzacja na T+1

---

## T+1 do T+30 — Hyper-care

- [ ] Daily standup 9:00 (15 min)
- [ ] Daily KPI dashboard review
- [ ] Cotygodniowe deploye środowe (środy 14:00, hot-fixy 24/7)
- [ ] Cold outreach: 50 emaili/dzień + 20 SMS/dzień
- [ ] Linkbuilding: 5 dofollow/tydz. (branża, media lokalne)
- [ ] Content velocity: 2 artykuły/tydz. minimum
- [ ] NPS survey po 5 leadach (Resend transactional)

---

## Definition of Done — MVP launch

✅ 76+ stron statycznych + dynamiczne /firma/[slug], /[city], /[city]/[category], /poradnik/[slug]
✅ Min. 30 zweryfikowanych firm w bazie
✅ Działający lead flow + claim + booking
✅ Stripe + Przelewy24 + BLIK testowe → produkcyjne
✅ AI assistant odpowiada w <3s
✅ Meilisearch zwraca wyniki w <100ms
✅ Lighthouse ≥90 mobile
✅ Backup + monitoring + alerting aktywne
✅ Polityka prywatności + regulamin + RODO

🚀 **Go-live: gotowi.**
