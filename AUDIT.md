# 🔍 PEŁNY AUDYT PROJEKTU — PolskiePogrzeby.pl

**Data audytu:** 2026-05-28
**Stan budżetu kodowego:** Phase 1 ✅ + Phase 2 ✅ → **Phase 3 (przygotowanie produkcji)**
**Build status:** `npx next build` → SUCCESS (99 stron)
**Open PR:** #1 (https://github.com/walerys1003/FUNERLAND/pull/1)

---

## CO MAMY GOTOWE (Phase 1 + Phase 2)

### ✅ Strony (28 routes)
- Statyczne: `/`, `/dla-firm`, `/kalkulator`, `/nekrologi`, `/zapytanie`, `/marketplace`, `/design-system`, `/orchestrator`
- Panele: `/admin`, `/panel-firmy`, `/panel-firmy/leady`, `/panel-firmy/profil`, `/panel-rodziny`
- Dynamiczne SSG: `/[city]/[category]`, `/firma/[slug]`, `/poradnik/[slug]`, `/rezerwacja/[kategoria]`
- Dynamiczne: `/szukaj`, `/sitemap.xml`, `/robots.txt`

### ✅ API Routes (8)
`/api/lead`, `/api/claim`, `/api/stripe-webhook`, `/api/reviews/verify`, `/api/health`, `/api/search`, `/api/ai/chat`, `/api/ai/match`, `/api/booking`

### ✅ Bibliotek (12)
ai/prompts, articles, data, marketplace/categories, resend, search/meilisearch, seo/json-ld, sms, stripe, supabase/{admin,client,server}

### ✅ Komponenty (15)
ai/chat-widget, booking/booking-stepper, icons, orchestrator/dashboard, calculator-preview, company-card, hero, logo, site-header, site-footer, stars, three-steps, trust-stats, verified-badge

### ✅ Infrastruktura
docker-compose.yml, Dockerfile, traefik config, Coolify deploy guide, GH Actions workflows (w `infra/github-workflows-backup/`)

### ✅ Dokumentacja
gtm/{launch-checklist, 30-day-plan, kpi-dashboard}.md, outreach/{emails, sms, phone, linkedin, objections}, supabase/{schema, rls, seed}.sql, .env.example

---

## ❌ CZEGO BRAKUJE DO PRODUKCJI (1000 tasków w Phase 3)

### 🔴 KRYTYCZNE — bez tego launch niemożliwy (P0)

#### Auth & Security
- [ ] Pełny flow logowania (Supabase Auth UI: email+password, Google OAuth, magic link)
- [ ] Middleware ochrony tras `/panel-firmy/*`, `/panel-rodziny/*`, `/admin/*`
- [ ] Session refresh w SSR
- [ ] CSRF protection na form POST
- [ ] Rate limiting na produkcji (Upstash Redis zamiast in-memory Map)
- [ ] CSP headers, HSTS, X-Frame-Options w `next.config.mjs`
- [ ] Cloudflare Turnstile CAPTCHA na `/zapytanie`, `/api/lead`, `/api/booking`
- [ ] reCAPTCHA fallback dla użytkowników bez JS

#### Płatności (Stripe + Przelewy24 + BLIK)
- [ ] `/api/checkout/subscription` — tworzenie sesji Stripe Checkout per plan
- [ ] `/api/checkout/lead-unlock` — one-time 49 zł per lead
- [ ] `/api/checkout/obituary-premium` — one-time 49 zł
- [ ] `/api/p24/init` — Przelewy24 init transaction
- [ ] `/api/p24/notify` — Przelewy24 webhook
- [ ] `/api/p24/verify` — verify P24 hash
- [ ] BLIK flow przez P24
- [ ] Strony `/billing/sukces`, `/billing/blad`, `/billing/anulowane`
- [ ] Invoice generation (PDF) per transakcję
- [ ] Faktura VAT zgodna z PL (JPK_VAT, KSeF gotowy)
- [ ] Tabela `transactions` filled przez webhooks
- [ ] Self-service: anulowanie subskrypcji, zmiana planu

#### Panel Firmy (Company Dashboard)
- [ ] Dashboard główny: KPI tygodnia (leady, wyświetlenia, konwersja)
- [ ] `/panel-firmy/leady` — pełna lista z filtrami, statusami, unlocked/locked
- [ ] `/panel-firmy/leady/[id]` — szczegóły leadu + przycisk "Odsłoń kontakt" (Stripe)
- [ ] `/panel-firmy/profil` — edycja profilu: nazwa, opis, zdjęcia, mapa, ceny, godziny
- [ ] `/panel-firmy/zespol` — multi-user (właściciel + pracownicy)
- [ ] `/panel-firmy/recenzje` — moderacja własnych opinii
- [ ] `/panel-firmy/billing` — historia płatności, faktury, plan
- [ ] `/panel-firmy/statystyki` — wykresy konwersji, źródeł, top zapytania
- [ ] `/panel-firmy/ustawienia` — notyfikacje email/SMS, sprzedaż priorytetów
- [ ] `/panel-firmy/onboarding` — wizard 5 kroków dla nowych firm
- [ ] Upload zdjęć (drag&drop, Supabase Storage)
- [ ] OG image generator per profil

#### Panel Rodziny (Family Dashboard)
- [ ] Dashboard: aktywne zapytania, oferty od firm, historia
- [ ] `/panel-rodziny/zapytania` — lista wysłanych zapytań
- [ ] `/panel-rodziny/zapytania/[id]` — szczegóły + 3 oferty firm w jednym widoku
- [ ] `/panel-rodziny/wiadomości` — komunikator z firmami (Supabase Realtime)
- [ ] `/panel-rodziny/recenzje` — wystawianie opinii po zakończeniu
- [ ] `/panel-rodziny/dokumenty` — przechowywanie dokumentów (akt zgonu, ZUS)
- [ ] `/panel-rodziny/zapisz-jako-bliski` — multi-funeral support
- [ ] Powiadomienia push/email gdy firma odpowie

#### Panel Admin (Super-Admin)
- [ ] Dashboard: KPI globalne, MRR, churn, NPS
- [ ] `/admin/firmy` — lista wszystkich, filter, search, ban/unban
- [ ] `/admin/firmy/[id]/weryfikacja` — sprawdzenie NIP, KRS, dokumentów
- [ ] `/admin/leady` — wszystkie leady, routing manualny, statusy
- [ ] `/admin/recenzje/moderacja` — kolejka recenzji do moderacji
- [ ] `/admin/użytkownicy` — pełna lista, role, blokady
- [ ] `/admin/transakcje` — wszystkie płatności, refundy
- [ ] `/admin/contentu` — CMS dla artykułów (markdown editor)
- [ ] `/admin/seo` — meta tags, redirects, OG images
- [ ] `/admin/notyfikacje` — broadcast SMS/email
- [ ] `/admin/audyt` — log wszystkich zmian (audit log)

### 🟠 WAŻNE — pełna funkcjonalność (P1)

#### Wyszukiwarka (Meilisearch w pełnej krasie)
- [ ] Geo-search w promieniu X km
- [ ] Filter facets (rating range, budget range)
- [ ] Sortowanie po: relevance, rating, price, distance
- [ ] Autocomplete (search-as-you-type)
- [ ] "Powiązane wyszukiwania" + "Często wyszukiwane"
- [ ] Zapisywanie historii wyszukiwań w sesji
- [ ] Search analytics → tabela `search_logs`
- [ ] Synonimy PL (rozszerzone: 200+ par)
- [ ] Misspell correction (Levenshtein dla "krmacja" → "kremacja")
- [ ] Filters URL-state (sharable links)
- [ ] Map view (Leaflet/Mapbox) z markerami firm
- [ ] "Bez wyników" suggestions

#### AI Assistant (rozbudowa)
- [ ] Streaming odpowiedzi (SSE/EventStream)
- [ ] Funkcja "generuj nekrolog" w czacie (call do `/api/ai/generate/obituary`)
- [ ] Funkcja "porównaj oferty" (parsing leadów z panelu rodziny)
- [ ] Multi-turn memory (zachowywanie kontekstu rozmowy w Supabase)
- [ ] Sentiment detection (gniew/smutek → escalation)
- [ ] FAQ from chatbot → suggest article
- [ ] Voice input (Web Speech API)
- [ ] Multilingual (PL/EN/UA dla migrantów)
- [ ] Embeddings dla artykułów → semantic search
- [ ] Cost monitoring (per-session token tracking)

#### Booking & Rezerwacja
- [ ] Real-time availability calendar (Supabase Realtime)
- [ ] iCal/Google Calendar sync dla firm
- [ ] Modyfikacja istniejącej rezerwacji
- [ ] Anulowanie z formularzem (powód)
- [ ] Email reminder 24h przed
- [ ] SMS reminder dzień przed
- [ ] Add to family panel po booking
- [ ] Webhook do firmy po booking (config webhook URL)
- [ ] Booking conflict detection
- [ ] Booking attachment (zdjęcia, dokumenty)

#### Nekrologi
- [ ] `/nekrologi/[slug]` — pełna strona pamięci
- [ ] Dodaj wspomnienie / świecę (RSVP-style)
- [ ] Embed video z YouTube/Vimeo
- [ ] Galeria zdjęć
- [ ] Mapa z miejscem ceremonii
- [ ] Płatność premium (49 zł — bez reklam, własna domena vanity, longer retention)
- [ ] Privacy levels (publiczny / link-only / private)
- [ ] Comment moderation
- [ ] Share buttons (FB, WhatsApp, Email, copy link)

#### Recenzje
- [ ] Forma wystawiania recenzji (5-step: rating + opis + zdjęcia + plusy/minusy + RODO)
- [ ] Verified review badge (potwierdzony booking ID)
- [ ] Helpfulness votes (👍 helpful / 👎)
- [ ] Odpowiedź firmy na recenzję (1 odpowiedź per recenzja)
- [ ] Filter: 5★ / 4★ / 3★ / 2★ / 1★
- [ ] Sort: najnowsze / najwyżej oceniane / "krytyczne"
- [ ] Anti-fake detection (fingerprinting + behavioral)

#### Mapa & Geo
- [ ] Integracja Leaflet + OpenStreetMap
- [ ] Markery firm z popupem (nazwa, rating, "zobacz profil")
- [ ] Clustering markerów przy zoom-out
- [ ] Wyszukiwanie "rób w pobliżu mnie" (geolocation)
- [ ] Distance calculator dla transport zwłok
- [ ] Voivodeship overlay
- [ ] Map view dla `/szukaj`, `/firma/[slug]`, `/[city]/[category]`

### 🟡 ROZWIJAJĄCE — premium experience (P2)

#### Analytics & Tracking
- [ ] Plausible setup + scripts
- [ ] Custom events: lead_submitted, booking_completed, search_performed, ai_chat_opened
- [ ] Funnel reports w panelu admin
- [ ] Heatmap (PostHog hosted lub Plausible Heatmaps)
- [ ] A/B testing framework
- [ ] UTM tracking + attribution

#### Performance & SEO+
- [ ] Image optimization (next/image + Sharp)
- [ ] OG image generator (`/api/og?title=...`)
- [ ] PWA manifest + service worker
- [ ] Offline support dla artykułów (Workbox)
- [ ] Critical CSS inline
- [ ] Font preload + subset
- [ ] Lighthouse CI w PRs (assert ≥90)
- [ ] AMP wersje dla artykułów
- [ ] Hreflang dla PL/EN
- [ ] Schema.org rich snippets validation
- [ ] FAQ schema na każdym /[city]/[category]

#### Komunikacja
- [ ] Email templates HTML (MJML → Resend)
- [ ] Email queue z retry (BullMQ + Redis)
- [ ] SMS queue z retry
- [ ] Webhook delivery z retry + DLQ
- [ ] Transactional emails: welcome, lead-confirmation, booking-confirmation, payment-success, payment-failed, password-reset, account-verify, review-request
- [ ] Marketing emails: weekly digest, promo, win-back
- [ ] Unsubscribe per category (transactional vs marketing)
- [ ] Email preview tool dla developerów

#### Integracje 3rd party
- [ ] Google Business Profile integration (push reviews)
- [ ] Facebook Pixel + Conversions API
- [ ] Google Tag Manager
- [ ] Sentry (errors + performance)
- [ ] Highlight.io (session replay)
- [ ] Slack integration (lead → channel notify)
- [ ] Zapier webhook (export to CRMs)
- [ ] CRM integration (Pipedrive/HubSpot)
- [ ] WhatsApp Business API
- [ ] Telegram bot (admin notyfikacje)

#### Mobile & Apps
- [ ] PWA install banner
- [ ] iOS Safari fixes (100vh, safe-area)
- [ ] Pull-to-refresh
- [ ] Bottom navigation na mobile
- [ ] Touch gestures
- [ ] React Native app skeleton (Expo) — opcjonalnie

#### Treść premium
- [ ] +12 nowych artykułów SEO (cel: 20 total)
- [ ] Video tutorials embedowane
- [ ] PDF do pobrania (np. "Lista dokumentów")
- [ ] Interactive checklist na każdym artykule
- [ ] Calculator embed w artykułach
- [ ] Glossary terminów funeralnych
- [ ] FAQ database (50+ pytań)
- [ ] Testimonials carousel z prawdziwymi (zaakceptowanymi) recenzjami

#### Bezpieczeństwo zaawansowane
- [ ] 2FA dla admin
- [ ] Audit log dla wszystkich zmian
- [ ] GDPR data export per user
- [ ] GDPR data deletion (right to be forgotten)
- [ ] PII anonymization w logach
- [ ] Penetration test (OWASP Top 10)
- [ ] Secrets rotation procedure
- [ ] Backup verification automatyczna (cotygodniowy test restore)
- [ ] Disaster Recovery runbook
- [ ] On-call rotation (PagerDuty)

#### Testing
- [ ] Unit tests dla libs (vitest)
- [ ] Integration tests dla API routes
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests
- [ ] Load tests (k6) — 1000 RPS target
- [ ] Accessibility tests (axe-core)
- [ ] Test data factory
- [ ] CI/CD test pipeline

---

## STATYSTYKI AUDYTU

| Kategoria        | Done | Pending | Total |
|------------------|------|---------|-------|
| Strony           | 28   | ~25     | ~53   |
| API routes       | 9    | ~30     | ~39   |
| Komponenty UI    | 15   | ~50     | ~65   |
| Biblioteki       | 12   | ~20     | ~32   |
| Integracje 3rd   | 3    | ~12     | ~15   |
| Testy            | 0    | ~80     | ~80   |
| Treść            | 8 art| ~15 art | ~23   |

**Procent ukończenia:** ~25% pełnej produkcji enterprise-grade.

---

## PRIORYTETYZACJA Phase 3 (1000 tasków)

Następny pakiet 1000 tasków zostanie podzielony tak:

- **Agent 1 (Builder)** — 180: auth flow, panele rodziny + firmy + admin, billing
- **Agent 2 (Designer)** — 90: UI components dla paneli, dark mode, animations
- **Agent 3 (Content)** — 70: +12 artykułów, FAQ db, glossary, video scripts
- **Agent 4 (Outreach)** — 50: drip campaigns, partner outreach, PR kit
- **Agent 5 (SEO)** — 100: rich snippets, AMP, hreflang, structured data validation
- **Agent 6 (GTM)** — 50: A/B testing, retention campaigns, NPS automation
- **Agent 7 (Search)** — 80: geo search, autocomplete, map view, analytics
- **Agent 8 (Marketplace)** — 150: calendar, messaging, nekrologi premium, recenzje
- **Agent 9 (AI)** — 100: streaming, embeddings, multi-turn, voice, multilingual
- **Agent 10 (DevOps)** — 130: monitoring, alerts, backup verify, load testing, security hardening
- **Agent 11 (QA)** — NEW 100: testing infrastructure (unit/integration/E2E/a11y/visual)

**Razem: 1100** → przycinam do exact 1000 w generatorze.

---

## DEFINITION OF "PRODUCTION READY"

✅ Lighthouse Performance ≥90 mobile
✅ Lighthouse Accessibility ≥95
✅ Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms
✅ E2E tests pass (10+ critical paths)
✅ Pen-test passed (OWASP Top 10)
✅ Load tested: 1000 RPS sustained
✅ Backup + restore verified weekly
✅ Disaster Recovery RTO <1h, RPO <24h
✅ All P0/P1 features shipped
✅ GDPR compliant (audyt prawny)
✅ Cookie policy + Privacy policy + Terms of Service
✅ Real-user monitoring active (Plausible + Sentry + RUM)
✅ Status page online (status.polskiepogrzeby.pl)
✅ Support email + phone working
✅ NPS feedback loop active
✅ 99.9% uptime SLA achievable

---

**Next step:** wygenerowanie 1000 produkcyjnych tasków przez `orchestrator/generate-tasks-v3.mjs` + plan implementacji w 90 dni.
