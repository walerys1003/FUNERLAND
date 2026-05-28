# Polskie Pogrzeby — Marketplace Funeralny

> Pożegnaj godnie. Bez presji. Bez ukrytych kosztów.

Marketplace łączący rodziny szukające usług pogrzebowych z zaufanymi firmami w Polsce. Zbudowany zgodnie z pełnym brief'em zawartym w dokumentach `Polskie_Pogrzeby_Raport_Finalny.pdf` i `Polskie_Pogrzeby_Prompty_Wdrozeniowe.pdf`.

## Stack techniczny

- **Next.js 15** (App Router) z React 19
- **TailwindCSS 3.4** z custom design tokens
- **TypeScript**
- **Lucide Icons** (stroke 1.4-1.6, outline)
- **Lora + Inter** (Google Fonts)

## Design system

| Token | Wartość |
|---|---|
| `cream` | `#F5F1EA` (tło główne) |
| `navy` | `#0F1B2D` (tekst, headery) |
| `accent-green` | `#2E4F3E` (CTA, trust) |
| `gold` | `#C9A65F` (gwiazdki, premium) |
| `border-soft` | `#E8E2D7` |
| Heading | Lora 600 |
| Body | Inter 400/500/600 |
| Radius | `12px` buttons / `24px` cards |
| Shadows | subtle 2-layer |

Estetyka: hybryda Apple/Aesop + skandynawski minimalizm. Brak gotyckich elementów, brak czarnych tonów, brak stockowych krzyży/świec.

## Strony zaimplementowane

### Strony publiczne (dla rodzin)
- `/` — Homepage z hero, trust statystykami, 3 krokami, kalkulatorem, listingiem firm, nekrologami, poradnikiem, B2B CTA
- `/[city]/[category]` — Listing firm w mieście (np. `/warszawa/zaklady-pogrzebowe`) z filtrami i mapą — **40 stron statycznych**
- `/firma/[slug]` — Profil firmy z cennikiem, opiniami, sticky lead-form — **6 firm**
- `/kalkulator` — Wieloetapowy kalkulator kosztów + breakdown z donut chart
- `/zapytanie` — Lead-gen form (4 kroki, RODO compliant)
- `/nekrologi` — Lista nekrologów z pakietem Premium
- `/poradnik` — Lista artykułów filarowych SEO
- `/panel-rodziny` — Konto rodziny: historia zapytań, otrzymane oferty

### Strony B2B
- `/dla-firm` — Pakiety (Basic / Standard / Pro / Premium) + tabela porównawcza + claim flow
- `/panel-firmy` — Dashboard z metrykami, wykres trendu, ranking miejski
- `/panel-firmy/leady` — Tabela leadów z pay-per-reveal
- `/panel-firmy/profil` — Edytor profilu z progress bar i ranking widgetem

### Strony administracyjne
- `/admin` — Panel admina z MRR chart, leady wg miast, gauge system health, moderacja opinii

**Łącznie: 76 statycznych stron wygenerowanych przy buildzie.**

## Lokalne uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000
# lub
npm run build && npm start
```

## Struktura projektu

```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css, icon.svg
│   ├── [city]/[category]/page.tsx     # SSG city/category listing
│   ├── firma/[slug]/page.tsx          # SSG company profile
│   ├── kalkulator/page.tsx            # client-side stepper
│   ├── zapytanie/page.tsx             # lead-gen form
│   ├── nekrologi/, poradnik/, dla-firm/
│   ├── panel-firmy/                   # B2B dashboard layout + routes
│   ├── panel-rodziny/                 # family dashboard
│   └── admin/                         # admin panel
├── components/
│   ├── site-header.tsx, site-footer.tsx, logo.tsx
│   ├── hero.tsx                       # homepage hero + 3 phones illustration
│   ├── trust-stats.tsx                # "Dlaczego rodziny nam ufają"
│   ├── three-steps.tsx                # 3 kroki do spokojnego pożegnania
│   ├── calculator-preview.tsx         # interactive cost breakdown
│   ├── company-card.tsx, stars.tsx, verified-badge.tsx
└── lib/data.ts                        # mock companies, obituaries, articles
```

## Dalsze kroki (zgodnie z briefem)

1. Podłączenie Supabase (DB schema już zdefiniowany w prompt #1)
2. Stripe + Przelewy24 dla subskrypcji
3. Resend (mailing) + SMSAPI.pl (SMS notyfikacje leadów)
4. Lead routing algorithm (scoring + plan-based slots)
5. Cold email outreach do 500 firm w 5 miastach pilotażowych
6. Programmatic SEO — 500+ stron (5 miast × 8 kategorii × dzielnice)
