# Runbook produkcyjny — PolskiePogrzeby.pl

> Dokument operacyjny dla zespołu utrzymania (on-call). Wersja: **2026-05-28**.
> Aktualizuj po każdym incydencie i po każdej zmianie infrastruktury.

---

## 1. Architektura w pigułce

```
[Browser]
   │
   ├─ Next.js 15 (App Router, SSR/ISR) ── Vercel (lub Node 20 runtime)
   │      │
   │      ├─ Middleware (route protection /panel-* /admin)
   │      ├─ API routes (/api/*)
   │      └─ Widget embed (/widget/[token]/*)
   │
   ├─ Supabase Postgres + RLS  (USE_SUPABASE=true)
   │      ├─ companies, leads, reviews, obituaries
   │      ├─ message_threads + messages
   │      ├─ subscriptions + billing_events
   │      ├─ audit_log (RODO)
   │      └─ user_otp_codes (2FA)
   │
   ├─ Supabase Storage (4 buckets: avatars / companies / obituaries / docs)
   │
   ├─ Stripe — checkout + portal + webhook (PL: p24, blik, card)
   ├─ Resend — emaile transakcyjne (11 szablonów)
   ├─ SMSAPI.pl — OTP, alerty leadów, przypomnienia rezerwacji
   ├─ Sentry — observability (opcjonalne)
   ├─ Upstash Redis — rate-limit (fallback: in-memory)
   └─ Plausible — analytics (load po zgodzie cookie)
```

**Tryb demo (`USE_SUPABASE=false`):** wszystkie repozytoria działają na in-memory ring buffer.
Idealne do podglądu / develpomentu. Dane giną przy restarcie.

---

## 2. Zmienne środowiskowe (env)

Pełna lista: `.env.example`. **Krytyczne dla produkcji:**

| Zmienna | Wymagane? | Opis |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | np. `https://polskiepogrzeby.pl` |
| `USE_SUPABASE` | ✅ | `true` na prodzie |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Klucz anonimowy (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (server only) — **nigdy w client bundle** |
| `STRIPE_SECRET_KEY` | ✅ | `sk_live_…` na prodzie |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_…` po skonfigurowaniu endpointu w Stripe |
| `STRIPE_PRICE_STANDARD` | ✅ | Price ID planu Standard |
| `STRIPE_PRICE_PREMIUM` | ✅ | Price ID planu Premium |
| `RESEND_API_KEY` | ✅ | `re_…` |
| `EMAIL_FROM` | ✅ | `kontakt@polskiepogrzeby.pl` (zweryfikowana domena Resend) |
| `SMSAPI_TOKEN` | ✅ | SMSAPI.pl OAuth token |
| `SMSAPI_FROM` | ✅ | Sender ID (np. `Pogrzeby`) — wymaga akceptacji u operatora |
| `WIDGET_SIGNING_SECRET` | ✅ | min. 32 znaki — używany do HMAC tokenów widgetu |
| `UPSTASH_REDIS_REST_URL` | ⭕ | bez tego rate-limit chodzi in-memory |
| `UPSTASH_REDIS_REST_TOKEN` | ⭕ | jw. |
| `SENTRY_DSN` | ⭕ | bez DSN — Sentry jest no-op |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | ⭕ | bez tego — Plausible się nie ładuje |

---

## 3. Deployment — checklist (5–10 min)

### 3.1 Pre-flight

1. **Sprawdź CI** na branchu źródłowym (push lub PR): `npm test`, `npm run typecheck`, `npm run build`.
2. **Sprawdź migracje** w `supabase/migrations/`. Najnowsza:
   `20260301000000_storage_buckets_and_audit.sql`
3. **Zatwierdź env** w panelu Vercel / Render dla nowych zmiennych.

### 3.2 Deploy

```bash
# Vercel (zalecane)
vercel --prod

# Lub: push do main → auto-deploy
git push origin main
```

### 3.3 Post-deploy smoke

```bash
SITE=https://polskiepogrzeby.pl

curl -s "$SITE/api/health" | jq           # → { ok: true }
curl -sI "$SITE/" | grep -E "(content-security-policy|strict-transport)"
curl -s "$SITE/robots.txt" | head -5
curl -s "$SITE/sitemap.xml" | head -5
```

Sprawdź wizualnie:
- [ ] Strona główna ładuje się < 2s (LCP w DevTools)
- [ ] Cookie consent banner pojawia się
- [ ] Formularz `/zapytanie` przyjmuje submission (sprawdź w panelu / w Supabase)
- [ ] `/firmy` listing renderuje firmy
- [ ] `/nekrologi` ładują z bazy
- [ ] Sentry release widoczny w dashboardzie (jeśli `SENTRY_DSN` ustawione)

---

## 4. Rollback

### 4.1 Vercel (zalecane)

```
Vercel dashboard → Deployments → wybierz poprzedni successful → "Promote to Production"
```

Trwa ~10 sekund. Zero downtime.

### 4.2 Git revert (gdy nie ma poprzedniego deployu w Vercel)

```bash
git revert <bad-commit-sha>
git push origin main         # uruchomi nowy deploy
```

### 4.3 Migracje Supabase

**Nigdy** nie usuwaj kolumn / tabel rollbackiem aplikacji. Migracja musi być **backward-compatible**.
Jeśli migracja zepsuła schema:

```bash
# Connect to Supabase via psql i ręcznie napraw
psql "$DATABASE_URL"
# np. ALTER TABLE companies DROP COLUMN bad_col;
```

Następnie utwórz nową migrację `20260XXX_fix_<name>.sql` i wgraj.

---

## 5. Najczęstsze incydenty (top 10)

### 5.1 Stripe webhook nie wchodzi
**Symptomy:** subskrypcje nie aktywują się po płatności.
**Diagnoza:** `https://dashboard.stripe.com/webhooks` → kliknij endpoint → zakładka "Recent attempts".
**Naprawa:**
- 400/401 → źle skonfigurowany `STRIPE_WEBHOOK_SECRET`. Skopiuj z panelu, zaktualizuj env, redeploy.
- 500 → sprawdź Sentry. Najczęstszy powód: brak `company_slug` w `metadata` checkout session.
**Idempotencja:** webhook jest idempotentny — Stripe sam ponowi 3 razy w ciągu 3 dni.

### 5.2 Resend "domain not verified"
**Symptomy:** emaile nie wychodzą, brak ID w logach.
**Naprawa:** dashboard Resend → Domains → dodaj DKIM/SPF rekordy do DNS. Czekaj 15 min.

### 5.3 SMSAPI "insufficient funds"
**Symptomy:** SMS nie wychodzą.
**Naprawa:** doładuj konto na panel.smsapi.pl. Pojedynczy SMS ≈ 0.07 PLN.

### 5.4 Rate-limit za agresywny dla realnych użytkowników
**Symptomy:** klienci dostają 429 na `/api/lead`.
**Diagnoza:** sprawdź `RL_PRESETS` w `src/lib/security/rate-limit.ts`.
**Naprawa:** zwiększ `requestsPerWindow` w preset, deploy.

### 5.5 CSP blokuje skrypt third-party
**Symptomy:** w DevTools → console: `Refused to load script ... blocked by CSP`.
**Tryb:** aktualnie **Report-Only** (zbieramy raporty, nic nie blokujemy).
**Naprawa:** dodaj domenę do `buildCsp()` w `src/lib/security/csp.ts`, deploy.

### 5.6 Supabase RLS odrzuca legitymacyjny INSERT
**Symptomy:** `new row violates row-level security policy`.
**Diagnoza:** `SELECT * FROM pg_policies WHERE tablename = '<table>';`
**Naprawa:** kontekst auth → `SELECT auth.uid()` musi zwracać user id w callach z UI; w API server-side używaj `service_role` client.

### 5.7 Build fail po update Next.js
**Symptomy:** `next build` wywala się na typecheck.
**Naprawa:** sprawdź `CHANGELOG.md` Next.js (breaking changes). Czasem trzeba `npm install --legacy-peer-deps` (React 19 RC peer conflicts).

### 5.8 Sentry zalewa quotę
**Symptomy:** alert "monthly quota exceeded".
**Naprawa:** zmniejsz `SENTRY_TRACES_SAMPLE_RATE` (np. 0.1 → 0.01). Filtry błędów: w `sentry.client.config.ts` dodaj `beforeSend` z whitelist.

### 5.9 Cookie consent się "klei" — użytkownicy nie mogą odwołać
**Naprawa:** localStorage key `pp_cookie_consent` — instrukcja dla supportu: "wpisz w konsoli `localStorage.removeItem('pp_cookie_consent'); location.reload()`".

### 5.10 Plausible nie wysyła eventów
**Symptomy:** brak ruchu w dashboardzie pomimo wizyt.
**Diagnoza:** w DevTools → Network filter `plausible` — czy żądania wychodzą?
**Naprawa:** najczęściej `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` nie ustawione, lub użytkownik nie wyraził zgody analytics. Sprawdź `localStorage.getItem('pp_cookie_consent')`.

---

## 6. On-call playbook

### 6.1 Codzienne (dev/ops jedna osoba)
- 🌅 **09:00** — sprawdź Sentry dashboard (top 5 issues w 24h)
- 📊 **09:15** — Plausible: trafność (sesje, bounce, top pages)
- 💳 **09:30** — Stripe: failed payments? recurring failed → wyślij retry
- 📧 **10:00** — Resend dashboard: bounce rate < 2%?

### 6.2 Tygodniowe (poniedziałek)
- 🔐 Sprawdź `audit_log` (`SELECT * FROM audit_log WHERE created_at > now() - interval '7 days' AND action LIKE 'auth.%failed' ORDER BY created_at DESC LIMIT 50;`)
- 🧹 Wywołaj `SELECT cleanup_expired_otp();` (lub ustaw cron)
- 🧪 Re-run e2e: `npm run test:e2e`

### 6.3 Miesięczne
- 📜 Audyt RODO: eksportuj `audit_log` → archiwum 12-miesięczne
- 🔑 Rotacja sekretów: `WIDGET_SIGNING_SECRET`, Stripe webhook secret (jeśli wyciekło)
- 📦 `npm outdated` → bezpieczne aktualizacje (audyt CVE: `npm audit`)

---

## 7. Krytyczne metryki SLO

| Metryka | Cel | Akcja przy przekroczeniu |
|---|---|---|
| **Uptime** | ≥ 99.5% (3.6h/miesiąc) | Status page incident |
| **API p95 latency** | < 500ms | Profil w Sentry, dodaj cache |
| **LCP (Largest Contentful Paint)** | < 2.5s | Optymalizuj obrazy, defer skrypty |
| **Failed leads / day** | < 1% | Sprawdź `audit_log` reason=fail |
| **Failed payments / day** | < 5% | Powiadom marketing (UX) |
| **Bounce rate (Plausible)** | < 60% | A/B test landing |

---

## 8. Procedury bezpieczeństwa (incident response)

### 8.1 Wyciek danych (potencjalny)
1. **Natychmiast** zmień `SUPABASE_SERVICE_ROLE_KEY` w panelu Supabase → settings → API.
2. Rotuj `WIDGET_SIGNING_SECRET` (wymusza ponowne wystawienie tokenów widgetów).
3. Eksportuj `audit_log` od momentu podejrzanego — analiza forensyczna.
4. **W ciągu 72h**: powiadomienie UODO + osoby których dane wyciekły (RODO art. 33+34).
5. Komunikat na stronie + email do bazy users.

### 8.2 Konto admin skompromitowane
1. `UPDATE auth.users SET banned_until = '2099-01-01' WHERE email = '<email>';`
2. Force logout: `DELETE FROM auth.refresh_tokens WHERE user_id = '<uid>';`
3. Sprawdź `audit_log` → co ten user zrobił od ostatniego znanego "bezpiecznego" login.

### 8.3 DDoS / abuse
1. Włącz **Vercel Firewall** (lub Cloudflare proxy).
2. Włącz Upstash rate-limit jeśli było off (env: `UPSTASH_REDIS_REST_URL`/`TOKEN`).
3. Zwiększ `RL_PRESETS` agresywności w `rate-limit.ts`.

---

## 9. Backup & restore

**Supabase** robi automatyczne daily backups (retention zależy od planu).

Manual snapshot:
```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F).sql
# upload do offsite storage (S3 / Backblaze)
```

Restore (testowo):
```bash
createdb pp_restore_test
psql pp_restore_test < backup-2026-05-28.sql
# zweryfikuj liczbę firm, leadów, etc.
```

**Storage:** Supabase nie backuje plików w bucketach. Skrypt periodyczny:
```bash
# Sync 4 buckets → S3
supabase storage cp ss://avatars/ s3://pp-backup/avatars/ -r
supabase storage cp ss://companies/ s3://pp-backup/companies/ -r
supabase storage cp ss://obituaries/ s3://pp-backup/obituaries/ -r
supabase storage cp ss://docs/ s3://pp-backup/docs/ -r
```

---

## 10. Linki / kontakty

- **Repo:** https://github.com/<org>/polskie-pogrzeby
- **Vercel:** https://vercel.com/<team>/polskie-pogrzeby
- **Supabase:** https://app.supabase.com/project/<id>
- **Stripe:** https://dashboard.stripe.com/
- **Resend:** https://resend.com/dashboard
- **Sentry:** https://sentry.io/organizations/<org>/projects/polskie-pogrzeby/
- **Plausible:** https://plausible.io/polskiepogrzeby.pl
- **Status page:** (do wpięcia — UptimeRobot / BetterUptime)

**On-call:** docs/ON_CALL_SCHEDULE.md (rotacja zespołu)

---

## 11. Zmiany w tym dokumencie

| Data | Autor | Zmiana |
|---|---|---|
| 2026-05-28 | Agent D (Sprint 4) | Pierwsza wersja runbooka — pokrycie production-readiness |
