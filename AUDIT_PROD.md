# 🚀 AUDYT PRODUKCYJNY — FUNERLAND

**Data:** 2026-05-28
**Stan:** branch `genspark_ai_developer`, commit `a0a58fc`
**Baseline:** `AUDIT.md` (Phase 2, 313 linii) + Phase 3 (`c70f471`) + Phase 3 follow-ups (`a0a58fc`)
**Build:** ✓ clean (1 warning: optional `stripe` dep)

---

## 📊 STAN OBECNY — co JEST gotowe

### Infrastruktura aplikacyjna
- ✅ **Next.js 15** App Router, React 19 RC, TypeScript strict
- ✅ **38 API routes** + **~50 stron**
- ✅ **Supabase**: schema.sql (351 l.) + rls.sql (172 l.) + seed.sql (127 l.) + 2 migracje (421 l.)
- ✅ **Middleware ochrony tras** (`src/middleware.ts`) — `/panel-firmy`, `/panel-rodziny`, `/admin` z rolami
- ✅ **Security headers** w `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- ✅ **Image optimization**: AVIF/WebP, deviceSizes, remotePatterns dla 8 hostów, cache TTL
- ✅ **Cache headers**: 1y immutable dla `/_next/static`, 1h-30d dla obrazków, 1h-1d dla OG/sitemap
- ✅ **sitemap.ts + robots.ts + icon.svg + /api/og/route.tsx**
- ✅ **/api/health** + **/api/vitals**

### Funkcjonalności (zaimplementowane od AUDIT.md)
| Kategoria | Status | Lokalizacja |
|---|---|---|
| Auth + 2FA TOTP | ✅ | `/api/account/2fa/*` (enroll/verify/disable/status) |
| Stripe Checkout + Webhook | ✅ | `/api/billing/{checkout,webhook}` + `/api/stripe-webhook` |
| Subscriptions repo | ✅ | `subscriptionRepo` + migracja `company_subscriptions` |
| AI Match v2 (filtry + ranking + CTR) | ✅ | `/api/ai/match/v2`, `/api/ai/match/click` |
| Moderacja AI opinii | ✅ | `heuristics.ts` (PROFANITY/SPAM/OFF_TOPIC + PESEL/NIP + leetspeak) + `/api/moderate` |
| Widget embed (Premium) | ✅ | `/widget/[token]/embed{,.js}` + `/api/widget/issue` + panel-firmy/widget |
| GDPR endpoints | ✅ | `/api/account/{delete,export}` |
| AI chat + streaming | ✅ | `/api/ai/chat`, `/api/ai/chat/stream`, `/api/ai/semantic-search` |
| Nekrologi + księga + memory wall + QR | ✅ | `/api/obituaries/*`, `/api/qr/obituary/[slug]` |
| Marketplace + filtry + mapa + porównaj | ✅ | `firmy`, `porownaj`, `marketplace`, `[city]/[category]` |
| Programmatic SEO (8 tools × N cities) | ✅ | `narzedzia/[tool]/[city]` |
| Recenzje z weryfikacją + admin | ✅ | `/api/reviews/*`, `/admin/opinie` |
| Booking + availability | ✅ | `/api/booking`, `/api/availability` |
| Lead capture + admin | ✅ | `/api/lead`, `/api/leads`, `/admin/leady` |
| Calc kosztów + zasiłek + kredyt | ✅ | `narzedzia/*` |
| Panel firmy + panel rodziny | ✅ | `panel-firmy/*`, `panel-rodziny/*` |
| Admin panel (finanse/firmy/leady/etc.) | ✅ | `admin/*` |

---

## 🔴 P0 — BLOKERY PRODUKCJI (bez tego NIE startujemy)

### P0.1 — Płatności PL (P24 / BLIK)
- ❌ **Brak** `/api/p24/init`, `/api/p24/notify`, `/api/p24/verify`
- ❌ Brak `src/lib/payments/p24.ts` (HMAC signing, CRC, sessionId)
- ❌ Wszystkie env vars są (`P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC_KEY`, `P24_API_KEY`, `P24_ENV`) ale **kod nie istnieje**
- ❌ Brak UI wyboru metody płatności (Stripe vs P24 vs BLIK)
- **Estymacja:** 3-5 dni (init + notify + return URL + sandbox + prod cert)
- **Ryzyko:** PL klienci preferują BLIK/P24 nad kartą — bez tego konwersja na płatne plany ~10-20%

### P0.2 — Stripe: brak realnej zależności + brak produktów
- ❌ `stripe` **NIE jest** w `dependencies` → kod używa `@ts-ignore` na dynamicznym imporcie
- ❌ Build pokazuje `Module not found: 'stripe'` (warning, ale runtime będzie 500)
- ❌ **Brak utworzonych Price IDs** w Stripe Dashboard (env vars `STRIPE_PRICE_*` to placeholdery)
- ❌ **Brak konfiguracji webhook endpoint w Stripe** → eventy nie dotrą do `/api/billing/webhook`
- **Działania:**
  ```bash
  npm install stripe
  # + utworzenie produktów basic/pro/premium/enterprise + lead_reveal + obituary_premium
  # + Webhook signing secret z dashboardu (live mode)
  # + listener: customer.subscription.{created,updated,deleted} + invoice.paid + invoice.payment_failed
  ```
- **Estymacja:** 1-2 dni
- **Ryzyko:** ⚠️ KRYTYCZNE — bez tego płatności w ogóle nie działają

### P0.3 — CAPTCHA na publicznych formularzach
- ❌ Brak Cloudflare Turnstile / hCaptcha na: `/zapytanie`, `/opinie/dodaj`, `/api/lead`, `/api/reviews`, `/api/claim`, kondolencje
- ❌ Brak `src/lib/security/turnstile.ts` (verify endpoint)
- **Ryzyko:** Spam, fake leads, fake reviews — botowe ataki na lead-gen
- **Estymacja:** 1 dzień (Turnstile widget + verify server-side)

### P0.4 — Rate limiting produkcyjny (Redis)
- ❌ Obecne RL jest in-memory (zerowane przy restarcie, nie działa na multi-instance)
- ❌ Brak Upstash Redis / Vercel KV integracji
- **Endpointy KRYTYCZNE do RL:** `/api/ai/chat`, `/api/ai/match*`, `/api/lead`, `/api/reviews`, `/api/auth/*`, `/api/moderate`, `/api/billing/*`
- **Estymacja:** 1-2 dni (Upstash setup + `lib/security/rate-limit.ts` + integracja)

### P0.5 — Strony prawne (GDPR/RODO blocker)
- ❌ **BRAK** `/regulamin`, `/polityka-prywatnosci`, `/cookies`, `/rodo`, `/regulamin-firm`
- ❌ Brak Cookie Banner (consent management)
- ❌ Brak DPA z Supabase/Stripe/Resend (formalność do podpisu)
- **Działania:**
  - 5 stron MDX/TSX z treścią prawną (przygotuje prawnik, ale infra musi być)
  - Cookie banner z opt-in dla Plausible/Sentry
  - Footer linki + checkboxy w rejestracji + formularzach
- **Estymacja:** 2-3 dni (infrastruktura), treść po stronie prawnika
- **Ryzyko:** ⚠️ KARA UODO do 20M EUR / 4% obrotu

### P0.6 — Content Security Policy (CSP) + HSTS
- ❌ Brak CSP w `next.config.mjs` (są inne headers, brak `Content-Security-Policy`)
- ❌ Brak `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **Działania:** dodać CSP z `'strict-dynamic'` + nonce dla inline scripts (lub allowlist Stripe/Plausible/Supabase)
- **Estymacja:** 0.5 dnia

### P0.7 — Monitoring: Sentry + Plausible NIE są podpięte
- ❌ Env vars są (`SENTRY_DSN`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) ale **brak kodu**
- ❌ Brak `@sentry/nextjs` w deps
- ❌ Brak `<Script src="plausible.io/js/script.js" />` w layout.tsx
- ❌ Brak `instrumentation.ts` / `sentry.{client,server,edge}.config.ts`
- **Estymacja:** 0.5-1 dzień

### P0.8 — Email transactional (Resend) — wiring partial
- ❌ Brak `src/lib/email/` (templates: welcome, verify, lead-received, booking-confirmation, password-reset, 2fa-recovery, subscription-receipt)
- ❌ Brak deps `resend` w package.json
- ❌ Env vars są (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) ale nieużywane
- **Estymacja:** 2-3 dni (7 szablonów React Email + send helper + DNS/SPF/DKIM/DMARC)

### P0.9 — Domain + DNS + SSL + email auth
- ❌ Brak konfiguracji DNS (A/AAAA, CNAME `www`, MX, SPF, DKIM, DMARC)
- ❌ Brak Cloudflare proxy + WAF rules
- ❌ Brak SSL cert (Let's Encrypt / Cloudflare)
- **Estymacja:** 0.5 dnia (jeśli domena już kupiona)

---

## 🟠 P1 — WAŻNE (można uruchomić MVP z degradacją UX)

### P1.1 — Testy
- ❌ **Zero testów** (`vitest`, `playwright`, `jest` — żadne nie zainstalowane)
- Minimum:
  - Unit: `heuristics.ts`, `plan-mapping.ts`, `token.ts` (HMAC verify), `matcher.ts` v2
  - Integration: `/api/billing/webhook`, `/api/moderate`, `/api/ai/match/v2`
  - E2E (Playwright): full funnel rejestracja → wybór planu → checkout → panel firmy → wystawienie widgetu
- **Estymacja:** 5-7 dni (setup + ~30 testów minimum)

### P1.2 — Faktury PDF + JPK
- ❌ Brak `/api/invoice/generate`
- ❌ Brak `src/lib/invoice/` (PDF generator — `pdfkit` lub `@react-pdf/renderer`)
- ❌ Brak schematu `invoices` w DB (numerowanie, NIP, kwota netto/VAT)
- ❌ Brak integracji z księgowością (Fakturownia API / InFakt API) — opcjonalne ale rekomendowane
- **Estymacja:** 3-4 dni

### P1.3 — Cron jobs
- ❌ `CRON_SECRET` w env ale **brak `/api/cron/*`**
- Potrzebne joby:
  - `cron/cleanup-expired-tokens` (2FA recovery, magic links)
  - `cron/refresh-subscriptions` (sync Stripe → DB co 6h jako fallback)
  - `cron/digest-leads` (codzienne podsumowanie leadów dla firm)
  - `cron/moderation-queue-alerts` (powiadom admin gdy queue > N)
  - `cron/sitemap-regenerate` (jeśli statyczna)
  - `cron/cleanup-orphaned-uploads` (Supabase Storage)
- **Estymacja:** 2 dni

### P1.4 — Admin tools brakujące
- ❌ `/admin/uzytkownicy` strona JEST, ale **brak `/api/admin/users`** (CRUD)
- ❌ Brak audit log table + UI (`/admin/audit-log`)
- ❌ Brak ban/suspend user flow
- ❌ Brak impersonation (security risk jeśli dodać, ale support potrzebuje)
- **Estymacja:** 3-4 dni

### P1.5 — GDPR UI flows
- ✅ Endpointy `/api/account/{delete,export}` istnieją
- ❌ Brak UI w `/konto`: przycisk "Pobierz moje dane" + "Usuń konto" + confirm modal + email confirmation
- ❌ Brak DSAR queue dla admina (wnioski o dostęp)
- **Estymacja:** 1-2 dni

### P1.6 — OG images dynamiczne — pełne pokrycie
- ✅ `/api/og/route.tsx` istnieje (1 endpoint)
- ❌ Brak dedykowanych OG dla: nekrologi (z imieniem/datami), firmy (logo+ocena), poradnik, miasta, narzędzia, oferty premium
- **Estymacja:** 1-2 dni (1 template + warianty per route type)

### P1.7 — Email Magic Link + Verification flow
- Auth jest, ale brak:
  - ❌ Email verification po rejestracji (Supabase ma builtin, ale szablon trzeba podmienić w Supabase Dashboard na PL)
  - ❌ Password reset email PL
  - ❌ Magic link login jako opcja
- **Estymacja:** 1 dzień (głównie konfiguracja Supabase templates)

### P1.8 — Backup + DR
- ❌ Brak udokumentowanej procedury backupu Supabase (Point-in-Time-Recovery włączony? snapshots?)
- ❌ Brak runbooka DR (RTO/RPO)
- ❌ Brak test restore procedure
- **Estymacja:** 1 dzień (Supabase Pro plan + dokumentacja)

### P1.9 — Image optimization — audit istniejących
- ✅ next/image setup jest
- ❌ Brak audytu czy wszędzie używane `next/image` zamiast `<img>` (grep wymagany)
- ❌ Brak lazy loading na listing page (above-the-fold prefetch?)
- **Estymacja:** 0.5 dnia (audit + fix)

### P1.10 — SEO finalizacja
- ✅ sitemap.ts + robots.ts
- ❌ Brak `manifest.webmanifest` (PWA-lite — minimum dla "Add to Home Screen")
- ❌ Brak Schema.org JSON-LD na: nekrologi (`Person` + `MemorialEvent`), firmy (`LocalBusiness` + `Review` + `AggregateRating`), poradnik (`Article`), oferty (`Product` + `Offer`)
- ❌ Brak `hreflang` (jeśli planowana wersja EN/UA)
- **Estymacja:** 1-2 dni

---

## 🟡 P2 — POST-LAUNCH (nice-to-have, można dorzucić w pierwszych tygodniach)

| Feature | Effort |
|---|---|
| PWA (service worker + offline) | 2-3 dni |
| Push notifications (Web Push API) | 2 dni |
| A/B testing framework (Vercel Edge Config / PostHog) | 2-3 dni |
| Multilingual (UA — ważne demograficznie) | 5-7 dni |
| Google Business Profile sync | 3-4 dni |
| Mobile app (React Native + Expo) | 30-60 dni |
| Advanced analytics (cohort, funnel, retention) | 3-5 dni |
| Live chat (Intercom/Crisp) | 1 dzień |
| Lighthouse CI w GitHub Actions | 0.5 dnia |
| Status page (BetterStack / Statuspage) | 0.5 dnia |
| Load testing (k6 / Artillery) — 1000 RPS target | 1-2 dni |
| Pen test (zewnętrzny) | tygodnie/zewnętrznie |

---

## 🚀 DEPLOYMENT CHECKLIST

### Infra
- [ ] Wybór hostingu: **Vercel** (recommended dla Next.js 15) / Coolify / self-hosted
- [ ] Supabase project **production** (osobny od dev — różne projecty, nie schematy)
- [ ] Uruchomienie migracji na prod: `20260101000000_phase3_billing_mfa_moderation.sql` + `20260115000000_reconcile_subscription_plan.sql`
- [ ] Włączenie **Point-in-Time Recovery** (Supabase Pro plan, ~25$/mc)
- [ ] Cloudflare przed domeną (DNS + WAF + DDoS + caching)

### Env vars na produkcji (z `.env.example`)
- [ ] `NEXT_PUBLIC_SITE_URL=https://funerland.pl` (prod URL)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (prod project)
- [ ] `STRIPE_SECRET_KEY` (live mode `sk_live_...`) + `STRIPE_WEBHOOK_SECRET` (z prod webhook) + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`)
- [ ] Wszystkie `STRIPE_PRICE_*` — **utworzone w Stripe Dashboard live mode**
- [ ] `P24_*` z prod merchant ID + prod CRC keys
- [ ] `RESEND_API_KEY` + zweryfikowana domena nadawcza (SPF/DKIM)
- [ ] `OPENAI_API_KEY` z limitami billing alerts
- [ ] `SENTRY_DSN` + source maps upload
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] `CRON_SECRET` — wygenerowany świeży (32+ bajtów)
- [ ] `ADMIN_EMAIL` — prawdziwy adres
- [ ] `WIDGET_SIGNING_SECRET` (osobny od JWT secret) — wygenerowany dla HMAC tokenów widgetu

### Webhooks i 3rd party
- [ ] Stripe Webhook endpoint zarejestrowany: `https://funerland.pl/api/billing/webhook` (live mode)
- [ ] Stripe products + prices utworzone i ID zgadzają się z env
- [ ] P24 Merchant panel: notify URL, return URL skonfigurowane
- [ ] Resend domena zweryfikowana + DKIM/SPF zaktualizowane
- [ ] Supabase Auth: redirect URLs ustawione na prod domain
- [ ] Supabase Auth: szablony email PL (potwierdzenie, reset hasła, magic link)
- [ ] OpenAI organization: usage limits + billing alerts

### CI/CD
- [ ] GitHub Actions: lint + type-check + build na PR
- [ ] (P1) Lighthouse CI na PR
- [ ] (P1) Vitest + Playwright na PR
- [ ] Auto-deploy `main` → prod, `genspark_ai_developer` → preview

### Bezpieczeństwo
- [ ] Wszystkie SECRET_KEY rotowane (nie z dev/example)
- [ ] Supabase RLS sprawdzona ręcznie + automatycznie (sql script: każda tabela MUSI mieć policy)
- [ ] CSP headers
- [ ] HSTS preload submitted (hstspreload.org)
- [ ] Skanowanie zależności (`npm audit` + GitHub Dependabot)

### Compliance
- [ ] DPA z każdym procesorem: Supabase, Stripe, OpenAI, Resend, Sentry, Cloudflare
- [ ] Rejestr czynności przetwarzania (art. 30 RODO)
- [ ] Polityka prywatności + regulamin + cookies — opublikowane
- [ ] Cookie banner działa
- [ ] Inspektor Ochrony Danych (IOD) — wyznaczony jeśli wymagany

---

## 📅 SZACUNEK CZASOWY

### Ścieżka MVP-launch (tylko P0)
**~3-4 tygodnie focused work** dla 1-2 deweloperów:
- Tydzień 1: P0.2 (Stripe install + products) + P0.6 (CSP/HSTS) + P0.7 (Sentry/Plausible) + P0.9 (DNS/SSL)
- Tydzień 2: P0.3 (CAPTCHA) + P0.4 (Redis rate limit) + P0.8 (Resend emails)
- Tydzień 3: P0.1 (P24/BLIK integration — najdłuższy task)
- Tydzień 4: P0.5 (legal pages — wymaga współpracy z prawnikiem) + smoke testy + bug bash

### Ścieżka soft-launch (P0 + krytyczne P1)
**~6-8 tygodni** dodając:
- Testy E2E (P1.1) — 1 tydzień
- Faktury PDF (P1.2) — 1 tydzień
- Cron + admin tools + GDPR UI (P1.3-5) — 1 tydzień
- Polish OG/SEO/backup (P1.6-9) — 1 tydzień

### Pełna gotowość enterprise
**~12 tygodni** z P2 (PWA, multilingual, load testing, pen test, status page)

---

## 🎯 REKOMENDACJA — NAJBLIŻSZE 3 KROKI

### Krok 1 (dziś / jutro) — odblokować Stripe
```bash
npm install stripe
# + utworzenie produktów w Stripe Dashboard
# + skonfigurowanie webhook endpoint (na razie ngrok dla testów)
# + usunięcie @ts-ignore z dynamic imports w kodzie billing
```

### Krok 2 (ten tydzień) — bezpieczeństwo + monitoring
1. Instalacja `@sentry/nextjs` + `instrumentation.ts`
2. Dodanie Plausible script w `app/layout.tsx`
3. Upstash Redis + `src/lib/security/rate-limit.ts`
4. Cloudflare Turnstile w 5 endpointach publicznych
5. CSP + HSTS w `next.config.mjs`

### Krok 3 (przyszły tydzień) — P24 + legal + email
1. `src/lib/payments/p24.ts` + 3 routes (init/notify/return)
2. 5 stron prawnych (szablon + treść od prawnika)
3. Cookie banner (np. `vanilla-cookieconsent`)
4. Resend templates (7 szablonów React Email)

---

## 📁 NOWE PLIKI/MODUŁY DO DODANIA

```
src/
├── lib/
│   ├── payments/
│   │   └── p24.ts                          # HMAC signing + CRC
│   ├── security/
│   │   ├── rate-limit.ts                   # Upstash Redis
│   │   ├── turnstile.ts                    # Cloudflare CAPTCHA verify
│   │   └── csp.ts                          # CSP builder helper
│   ├── email/
│   │   ├── client.ts                       # Resend wrapper
│   │   └── templates/
│   │       ├── welcome.tsx
│   │       ├── lead-received.tsx
│   │       ├── booking-confirmation.tsx
│   │       ├── password-reset.tsx
│   │       ├── 2fa-recovery.tsx
│   │       ├── subscription-receipt.tsx
│   │       └── obituary-published.tsx
│   ├── invoice/
│   │   ├── generator.ts                    # @react-pdf/renderer
│   │   └── numbering.ts                    # FV/YYYY/MM/NNNN
│   └── analytics/
│       ├── plausible.ts                    # client + server events
│       └── sentry.ts                       # error context helpers
│
├── app/
│   ├── api/
│   │   ├── p24/{init,notify,return}/route.ts
│   │   ├── invoice/generate/route.ts
│   │   ├── cron/{cleanup,refresh-subs,digest-leads,moderation-alerts}/route.ts
│   │   └── admin/{users,audit-log}/route.ts
│   ├── regulamin/page.tsx
│   ├── polityka-prywatnosci/page.tsx
│   ├── cookies/page.tsx
│   ├── rodo/page.tsx
│   ├── regulamin-firm/page.tsx
│   └── manifest.ts                          # PWA
│
├── components/
│   ├── legal/
│   │   └── cookie-banner.tsx
│   └── analytics/
│       └── plausible-script.tsx
│
├── instrumentation.ts                       # Sentry init
├── sentry.client.config.ts
├── sentry.server.config.ts
└── sentry.edge.config.ts

supabase/migrations/
├── 20260201000000_invoices.sql
├── 20260201000001_audit_log.sql
└── 20260201000002_dsar_requests.sql        # GDPR DSAR queue

tests/
├── unit/
│   ├── heuristics.test.ts
│   ├── plan-mapping.test.ts
│   └── widget-token.test.ts
├── integration/
│   ├── billing-webhook.test.ts
│   └── moderation.test.ts
└── e2e/
    ├── auth-flow.spec.ts
    ├── booking-flow.spec.ts
    └── billing-checkout.spec.ts

.github/workflows/
├── ci.yml                                   # lint + build + test
├── lighthouse.yml                           # LHCI
└── deploy.yml                               # Vercel/Coolify
```

---

## 🔥 SUMA REMANENTU

| Kategoria | Items | Effort |
|---|---|---|
| 🔴 P0 (blokery) | 9 | ~3-4 tygodnie |
| 🟠 P1 (ważne) | 10 | ~3-4 tygodnie |
| 🟡 P2 (post-launch) | 12 | ~6-8 tygodni |
| **RAZEM do enterprise-ready** | **31** | **~12 tygodni** |
| **RAZEM do soft-launch MVP** | **19 (P0+P1)** | **~6-8 tygodni** |
| **RAZEM do hard-launch MVP** | **9 (P0)** | **~3-4 tygodnie** |

**Stan aktualny:** projekt ma solidny szkielet (~50 stron, 38 API, RLS, migracje, AI flows, moderacja, widget, billing logic). **Główne braki to zewnętrzne integracje (P24, Stripe install, Resend, Sentry, Plausible, Turnstile) + strony prawne + testy.** Architektura jest gotowa — pozostaje "ostatnia mila" przed produkcją.
