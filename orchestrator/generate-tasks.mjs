// Generates a complete 500-task plan distributed across 6 agents
// Output: src/lib/tasks-plan.json (consumed by the orchestrator dashboard)

import fs from 'node:fs';
import path from 'node:path';

const cities = ['Warszawa', 'Kraków', 'Wrocław', 'Łódź', 'Lublin'];
const categories = [
  'zaklady-pogrzebowe', 'kremacja', 'kwiaciarnie-pogrzebowe',
  'kamieniarze', 'transport-zwlok', 'transmisje-online',
  'mistrzowie-ceremonii', 'cennik-pogrzebu'
];

const tasks = [];
let id = 1;

function addTask(agent, title, sub = '', priority = 'P1') {
  tasks.push({
    id: `T${String(id).padStart(4, '0')}`,
    agent,
    title,
    sub,
    priority,
    status: 'queued',
    startedAt: null,
    completedAt: null,
    durationMs: null,
    output: null,
  });
  id++;
}

// ============ AGENT 1 — BUILDER (120 tasks) ============
const builderTasks = [
  // Infrastructure setup (1-15)
  ['Inicjalizacja Next.js 15 + App Router', 'Setup', 'P0'],
  ['Konfiguracja TailwindCSS + design tokens', 'Setup', 'P0'],
  ['Instalacja shadcn/ui (customized)', 'Setup', 'P0'],
  ['Konfiguracja TypeScript strict mode', 'Setup', 'P0'],
  ['Setup ESLint + Prettier', 'Setup', 'P1'],
  ['Konfiguracja Vercel deployment', 'Setup', 'P0'],
  ['Setup .env.example z 22 zmiennymi', 'Setup', 'P0'],
  ['Instalacja Supabase client + auth-helpers', 'Setup', 'P0'],
  ['Setup Stripe SDK + webhook secret', 'Setup', 'P0'],
  ['Instalacja Resend SDK', 'Setup', 'P0'],
  ['Integracja SMSAPI.pl REST API', 'Setup', 'P0'],
  ['Setup OpenAI SDK (gpt-4o-mini)', 'Setup', 'P1'],
  ['Konfiguracja Plausible analytics', 'Setup', 'P1'],
  ['Setup Sentry error tracking', 'Setup', 'P2'],
  ['Konfiguracja next-sitemap', 'Setup', 'P1'],
  // Database schema (16-30)
  ['Schema: tabela cities (5 miast pilotażowych)', 'Database', 'P0'],
  ['Schema: tabela districts (dzielnice dla 5 miast)', 'Database', 'P0'],
  ['Schema: tabela categories (8 kategorii usług)', 'Database', 'P0'],
  ['Schema: tabela companies (30 pól + relacje)', 'Database', 'P0'],
  ['Schema: tabela company_categories (M:N)', 'Database', 'P0'],
  ['Schema: tabela leads + status enum', 'Database', 'P0'],
  ['Schema: tabela lead_responses (tracking)', 'Database', 'P0'],
  ['Schema: tabela reviews (verified only)', 'Database', 'P0'],
  ['Schema: tabela subscriptions (Stripe sync)', 'Database', 'P0'],
  ['Schema: tabela obituaries (UGC)', 'Database', 'P1'],
  ['Schema: tabela seo_pages (programmatic)', 'Database', 'P1'],
  ['RLS policies dla companies (owner-only edit)', 'Database', 'P0'],
  ['RLS policies dla leads (sender + assigned)', 'Database', 'P0'],
  ['RLS policies dla reviews (public read, owner reply)', 'Database', 'P0'],
  ['Indexes: companies(city_id,plan), leads(city_id,status)', 'Database', 'P0'],
  // Seed data (31-45)
  ['Seed: 5 miast pilotażowych z lat/lng', 'Seed', 'P0'],
  ['Seed: 20 dzielnic Warszawy', 'Seed', 'P1'],
  ['Seed: 18 dzielnic Krakowa', 'Seed', 'P1'],
  ['Seed: 15 dzielnic Wrocławia', 'Seed', 'P1'],
  ['Seed: 12 dzielnic Łodzi', 'Seed', 'P1'],
  ['Seed: 8 dzielnic Lublina', 'Seed', 'P1'],
  ['Seed: 8 kategorii usług z cenami lead', 'Seed', 'P0'],
  ['Seed: 30 dummy firm (po 6 na miasto)', 'Seed', 'P0'],
  ['Seed: 80 cmentarzy z OSM (5 miast)', 'Seed', 'P1'],
  ['Seed: 25 USC (adresy, godziny)', 'Seed', 'P1'],
  ['Seed: 50 parafii TOP po miastach', 'Seed', 'P2'],
  ['Seed: 100 dummy leadów (testing)', 'Seed', 'P1'],
  ['Seed: 200 dummy opinii (verified)', 'Seed', 'P1'],
  ['Seed: 40 nekrologów testowych', 'Seed', 'P2'],
  ['Seed: 30 SEO pages generated', 'Seed', 'P1'],
  // Frontend pages (46-60)
  ['Homepage z hero + 3 telefony illustration', 'Frontend', 'P0'],
  ['Trust stats section (847 firm, 12 350 rodzin)', 'Frontend', 'P0'],
  ['"Trzy kroki" section z animacją', 'Frontend', 'P0'],
  ['Listing /[city]/[category] z filtrami', 'Frontend', 'P0'],
  ['Profile /firma/[slug] z sticky lead form', 'Frontend', 'P0'],
  ['Kalkulator 6-krokowy + donut chart', 'Frontend', 'P0'],
  ['Lead-gen form /zapytanie (4 kroki RODO)', 'Frontend', 'P0'],
  ['Panel firmy: dashboard z metrykami', 'Frontend', 'P0'],
  ['Panel firmy: edytor profilu (progress 73%)', 'Frontend', 'P0'],
  ['Panel firmy: leady (pay-per-reveal)', 'Frontend', 'P0'],
  ['Panel firmy: billing (Stripe customer portal)', 'Frontend', 'P0'],
  ['Panel rodziny: historia zapytań i ofert', 'Frontend', 'P1'],
  ['Strona /dla-firm z 4 pakietami', 'Frontend', 'P0'],
  ['Nekrologi listing + szczegóły', 'Frontend', 'P1'],
  ['Admin panel: MRR, churn, moderacja', 'Frontend', 'P1'],
  // API routes (61-75)
  ['POST /api/lead — submit + routing + notify', 'API', 'P0'],
  ['POST /api/lead/reveal — pay 15zł, get phone', 'API', 'P0'],
  ['POST /api/claim — przejmij profil firmy', 'API', 'P0'],
  ['POST /api/claim/verify — SMS verification', 'API', 'P0'],
  ['POST /api/stripe/checkout — start subscription', 'API', 'P0'],
  ['POST /api/stripe/webhook — sync subscription', 'API', 'P0'],
  ['POST /api/stripe/portal — manage billing', 'API', 'P0'],
  ['POST /api/reviews — submit (after lead)', 'API', 'P0'],
  ['POST /api/reviews/verify — SMS code', 'API', 'P0'],
  ['POST /api/companies/[id] — update profile', 'API', 'P0'],
  ['POST /api/obituaries — submit nekrolog', 'API', 'P1'],
  ['POST /api/calculator/save — save result', 'API', 'P1'],
  ['POST /api/auth/login — Supabase Auth', 'API', 'P0'],
  ['POST /api/auth/register — company signup', 'API', 'P0'],
  ['GET /api/companies/search — full-text search', 'API', 'P1'],
  // Business logic (76-90)
  ['Lead routing: scoring algorithm', 'Logic', 'P0'],
  ['Lead routing: monthly slot enforcement', 'Logic', 'P0'],
  ['Lead routing: credit balance check', 'Logic', 'P0'],
  ['Lead notification: SMS template (160 chars)', 'Logic', 'P0'],
  ['Lead notification: email template (HTML)', 'Logic', 'P0'],
  ['Lead expiration: 24h auto-close', 'Logic', 'P1'],
  ['Verified reviews: link to lead_id', 'Logic', 'P0'],
  ['Verified reviews: anti-fraud detection', 'Logic', 'P1'],
  ['Verified reviews: company reply window', 'Logic', 'P1'],
  ['Calculator: 8 cost categories', 'Logic', 'P0'],
  ['Calculator: ZUS subsidy auto-deduct (4000 zł)', 'Logic', 'P0'],
  ['Calculator: city-specific multipliers', 'Logic', 'P1'],
  ['Pricing: 4 plans (Free/Standard/Pro/Premium)', 'Logic', 'P0'],
  ['Pricing: annual -20% discount', 'Logic', 'P0'],
  ['Pricing: trial 14 days no card', 'Logic', 'P0'],
  // Integrations (91-105)
  ['Stripe: products + prices setup', 'Integration', 'P0'],
  ['Stripe: webhook signature verification', 'Integration', 'P0'],
  ['Stripe: customer portal redirect', 'Integration', 'P0'],
  ['Stripe: invoice PDF generation', 'Integration', 'P1'],
  ['Przelewy24: alternative payment', 'Integration', 'P1'],
  ['Resend: domain verification (DKIM/SPF)', 'Integration', 'P0'],
  ['Resend: 5 email templates (transactional)', 'Integration', 'P0'],
  ['SMSAPI: sender name verification', 'Integration', 'P0'],
  ['SMSAPI: 3 SMS templates (lead, verify, reminder)', 'Integration', 'P0'],
  ['OpenAI: company description rewriter', 'Integration', 'P1'],
  ['OpenAI: lead-to-review summarizer', 'Integration', 'P2'],
  ['OpenAI: SEO meta description generator', 'Integration', 'P1'],
  ['OSM: cmentarze auto-import (Overpass API)', 'Integration', 'P1'],
  ['Google Maps: embed dla profili', 'Integration', 'P1'],
  ['Plausible: custom events tracking', 'Integration', 'P1'],
  // Testing & deploy (106-120)
  ['Unit tests: lead routing algorithm', 'Testing', 'P0'],
  ['Unit tests: scoring function', 'Testing', 'P0'],
  ['Integration tests: lead submission flow', 'Testing', 'P0'],
  ['Integration tests: claim flow', 'Testing', 'P0'],
  ['Integration tests: Stripe webhook', 'Testing', 'P0'],
  ['E2E tests: family → lead → response', 'Testing', 'P1'],
  ['E2E tests: company signup → claim → first lead', 'Testing', 'P1'],
  ['Lighthouse audit: target 95+ all metrics', 'Testing', 'P0'],
  ['Accessibility audit: WCAG AA', 'Testing', 'P1'],
  ['Load test: 100 concurrent leads', 'Testing', 'P2'],
  ['Security audit: RLS bypass test', 'Testing', 'P0'],
  ['Backup strategy: Supabase daily', 'DevOps', 'P0'],
  ['Monitoring: Vercel + Sentry alerts', 'DevOps', 'P0'],
  ['Deploy: staging environment', 'DevOps', 'P0'],
  ['Deploy: production + DNS + SSL', 'DevOps', 'P0'],
];
builderTasks.forEach(([t, s, p]) => addTask('builder', t, s, p));

// ============ AGENT 2 — DESIGNER (80 tasks) ============
const designerTasks = [
  // Design tokens (1-10)
  ['Design tokens: 7 kolorów + warianty', 'Tokens', 'P0'],
  ['Typography scale: H1/H2/H3/body/caption', 'Tokens', 'P0'],
  ['Spacing system: 8px base × 12 steps', 'Tokens', 'P0'],
  ['Border radius: 12px btn / 24px card', 'Tokens', 'P0'],
  ['Shadows: 3 levels (soft/card/lift)', 'Tokens', 'P0'],
  ['Z-index scale: dropdown/modal/toast', 'Tokens', 'P1'],
  ['Animation tokens: 200ms/300ms ease-out', 'Tokens', 'P1'],
  ['Focus rings: 2px accent-green/20%', 'Tokens', 'P0'],
  ['Dark mode tokens (future)', 'Tokens', 'P2'],
  ['Print stylesheet (dla PDF eksportu)', 'Tokens', 'P2'],
  // Components (11-30)
  ['Button: Primary (filled green) — 3 sizes', 'Components', 'P0'],
  ['Button: Secondary (outlined navy)', 'Components', 'P0'],
  ['Button: Ghost (text + underline)', 'Components', 'P0'],
  ['Button: Icon-only + tooltip', 'Components', 'P1'],
  ['Card: default (24px radius, soft shadow)', 'Components', 'P0'],
  ['Card: highlighted (border accent-green)', 'Components', 'P0'],
  ['Card: company listing variant', 'Components', 'P0'],
  ['Card: pricing variant z badge', 'Components', 'P0'],
  ['Input: text z floating label', 'Components', 'P0'],
  ['Input: phone z prefix +48', 'Components', 'P0'],
  ['Input: select z autocomplete', 'Components', 'P0'],
  ['Input: textarea z counter', 'Components', 'P0'],
  ['Input: toggle 24/7 switch', 'Components', 'P0'],
  ['Input: range slider (zakres cen)', 'Components', 'P1'],
  ['Search bar: hero (64px, autosuggest)', 'Components', 'P0'],
  ['Stepper: 6 kroków horizontal', 'Components', 'P0'],
  ['Modal: full-screen mobile, centered desktop', 'Components', 'P0'],
  ['Modal: confirm dialog (destrutive action)', 'Components', 'P1'],
  ['Toast: success/error/info', 'Components', 'P1'],
  ['Tooltip: hover z arrow', 'Components', 'P1'],
  // Custom icons (31-40)
  ['Ikona: Chłodnia (outline 1.5px)', 'Icons', 'P0'],
  ['Ikona: Trumna dębowa', 'Icons', 'P0'],
  ['Ikona: Urna ceramiczna', 'Icons', 'P0'],
  ['Ikona: Krematorium (komin)', 'Icons', 'P0'],
  ['Ikona: Ceremonia (mistrz)', 'Icons', 'P0'],
  ['Ikona: Transmisja online', 'Icons', 'P0'],
  ['Ikona: Transport zwłok', 'Icons', 'P0'],
  ['Ikona: Nagrobek/kamieniarz', 'Icons', 'P0'],
  ['Ikona: Świeca (subtle, nie kościelna)', 'Icons', 'P1'],
  ['Ikona: Drzewo/natura (empty state)', 'Icons', 'P1'],
  // Templates (41-60)
  ['Template: Homepage layout', 'Templates', 'P0'],
  ['Template: City listing page', 'Templates', 'P0'],
  ['Template: Company profile', 'Templates', 'P0'],
  ['Template: Calculator multi-step', 'Templates', 'P0'],
  ['Template: Lead form 4 kroki', 'Templates', 'P0'],
  ['Template: B2B dashboard', 'Templates', 'P0'],
  ['Template: B2B profile editor', 'Templates', 'P0'],
  ['Template: B2B leady table', 'Templates', 'P0'],
  ['Template: Family dashboard', 'Templates', 'P0'],
  ['Template: Admin overview', 'Templates', 'P1'],
  ['Template: Nekrolog single', 'Templates', 'P1'],
  ['Template: Poradnik artykuł', 'Templates', 'P1'],
  ['Template: Pricing /dla-firm', 'Templates', 'P0'],
  ['Template: 404 page', 'Templates', 'P1'],
  ['Template: Error 500 page', 'Templates', 'P2'],
  ['Template: Email transactional', 'Templates', 'P1'],
  ['Template: PDF kalkulator export', 'Templates', 'P2'],
  ['Template: Onboarding tour (5 steps)', 'Templates', 'P1'],
  ['Template: Empty state (no leads)', 'Templates', 'P1'],
  ['Template: Loading skeleton', 'Templates', 'P1'],
  // Photography & moodboard (61-70)
  ['Moodboard: 12 referencji (Aesop/Calm)', 'Photography', 'P1'],
  ['Photo guidelines: ciepłe światło', 'Photography', 'P1'],
  ['Photo banlist: krzyże/świece/gotyk', 'Photography', 'P1'],
  ['Hero photo: drzewo + zmierzch', 'Photography', 'P1'],
  ['City photo: panorama subtelna', 'Photography', 'P2'],
  ['Company photo: wnętrze (nie sala)', 'Photography', 'P2'],
  ['Calculator photo: ręce/dom', 'Photography', 'P2'],
  ['Testimonial photo: portret naturalny', 'Photography', 'P2'],
  ['Obituary photo: krajobraz', 'Photography', 'P2'],
  ['Brand photoshoot brief', 'Photography', 'P2'],
  // Micro-interactions (71-80)
  ['Hover: card lift -2px + shadow', 'Interactions', 'P1'],
  ['Hover: button bg darken', 'Interactions', 'P0'],
  ['Focus: input ring 2px green/20', 'Interactions', 'P0'],
  ['Scroll: smooth + reveal cards', 'Interactions', 'P1'],
  ['Loading: skeleton shimmer', 'Interactions', 'P1'],
  ['Transition: page fade-in 400ms', 'Interactions', 'P1'],
  ['Animation: number count-up (stats)', 'Interactions', 'P2'],
  ['Animation: stepper progress bar', 'Interactions', 'P1'],
  ['Animation: lead status badge pulse', 'Interactions', 'P2'],
  ['Animation: success checkmark draw', 'Interactions', 'P2'],
];
designerTasks.forEach(([t, s, p]) => addTask('designer', t, s, p));

// ============ AGENT 3 — CONTENT (80 tasks) ============
const articles = [
  'Ile naprawdę kosztuje pogrzeb w Polsce 2026',
  'Zasiłek pogrzebowy ZUS — kwoty, dokumenty, krok po kroku',
  'Jak wybrać zakład pogrzebowy — 7 kryteriów',
  'Sprowadzenie zwłok z zagranicy',
  'Co zrobić gdy śmierć w szpitalu',
  'Pogrzeb świecki/humanistyczny',
  'Kremacja w Polsce — koszty, krematoria, procedura',
  'Lista dokumentów potrzebnych do pogrzebu',
];
articles.forEach((title, i) => {
  const num = i + 1;
  addTask('content', `Artykuł #${num}: ${title}`, 'Outline', 'P0');
  addTask('content', `Artykuł #${num}: TL;DR + spis treści`, 'Intro', 'P0');
  addTask('content', `Artykuł #${num}: Sekcje H2/H3 (5-8)`, 'Body', 'P0');
  addTask('content', `Artykuł #${num}: Tabela z liczbami`, 'Body', 'P0');
  addTask('content', `Artykuł #${num}: FAQ Schema (5 pytań)`, 'Schema', 'P0');
  addTask('content', `Artykuł #${num}: PDF checklist (lead magnet)`, 'Magnet', 'P1');
  addTask('content', `Artykuł #${num}: Wewnętrzne linkowanie (3-5)`, 'SEO', 'P0');
  addTask('content', `Artykuł #${num}: Meta title + description`, 'SEO', 'P0');
  addTask('content', `Artykuł #${num}: 3-5 obrazów + alt text`, 'Media', 'P1');
  addTask('content', `Artykuł #${num}: CTA kontekstowy`, 'CTA', 'P0');
});

// ============ AGENT 4 — OUTREACH (60 tasks) ============
const outreachTasks = [
  // Cold emails (1-20)
  ['Email #1 (dzień 0): Subject + 3 warianty A/B', 'Email', 'P0'],
  ['Email #1: Preheader (max 90 chars)', 'Email', 'P0'],
  ['Email #1: Body (max 150 słów)', 'Email', 'P0'],
  ['Email #1: P.S. + CTA link', 'Email', 'P0'],
  ['Email #2 (dzień 3): Reminder + social proof', 'Email', 'P0'],
  ['Email #2: Body z "47 firm w {city}"', 'Email', 'P0'],
  ['Email #2: Personalizacja {first_name}', 'Email', 'P0'],
  ['Email #3 (dzień 7): Edukacja + wartość', 'Email', 'P0'],
  ['Email #3: "3 powody dlaczego małe zakłady"', 'Email', 'P0'],
  ['Email #3: Case study (anonimowy)', 'Email', 'P1'],
  ['Email #4 (dzień 14): Breakup last call', 'Email', 'P0'],
  ['Email #4: "Kasować profil?"', 'Email', 'P0'],
  ['Email #4: Final CTA + opt-out', 'Email', 'P0'],
  ['Variables system: {first_name} {company} {city}', 'Email', 'P0'],
  ['HTML template: plain text + minimal style', 'Email', 'P0'],
  ['Spam compliance: CAN-SPAM + RODO', 'Email', 'P0'],
  ['Unsubscribe link: 1-click opt-out', 'Email', 'P0'],
  ['Tracking: open rate + reply rate', 'Email', 'P1'],
  ['Bounce handling: clean list', 'Email', 'P1'],
  ['Send schedule: Tue/Thu 10:00-14:00', 'Email', 'P1'],
  // SMS (21-30)
  ['SMS #1 (dla firm bez emaila): 160 chars', 'SMS', 'P0'],
  ['SMS #2: reminder w +3 dni', 'SMS', 'P0'],
  ['SMS #3: last call +7 dni', 'SMS', 'P0'],
  ['SMS: opt-out keyword "STOP"', 'SMS', 'P0'],
  ['SMS: sender name "PolskiePogr"', 'SMS', 'P0'],
  ['SMS: link skracarka (claim/{token})', 'SMS', 'P0'],
  ['SMS: A/B test 3 wersje CTA', 'SMS', 'P1'],
  ['SMS: scheduling 10:00-19:00', 'SMS', 'P1'],
  ['SMS: cost tracking (0.15zł/sms)', 'SMS', 'P1'],
  ['SMS: white-list test 10 numerów', 'SMS', 'P0'],
  // Phone scripts (31-45)
  ['Skrypt rozmowy: hook (15 sekund)', 'Phone', 'P0'],
  ['Skrypt: value proposition (30 sekund)', 'Phone', 'P0'],
  ['Skrypt: zamknięcie (15 sekund)', 'Phone', 'P0'],
  ['Obiekcja #1: "Mam już stronę"', 'Phone', 'P0'],
  ['Obiekcja #2: "Ile to kosztuje?"', 'Phone', 'P0'],
  ['Obiekcja #3: "Nie wierzę w internet"', 'Phone', 'P0'],
  ['Obiekcja #4: "Konkurencja zobaczy dane"', 'Phone', 'P0'],
  ['Obiekcja #5: "Skąd Pan ma mój numer?"', 'Phone', 'P0'],
  ['Tonacja: spokojna, ekspercka', 'Phone', 'P0'],
  ['Pacing: 130-150 słów/min', 'Phone', 'P1'],
  ['Cold call list: TOP 100 Warszawa', 'Phone', 'P0'],
  ['Cold call list: TOP 100 Kraków', 'Phone', 'P0'],
  ['CRM integration: HubSpot Free / Airtable', 'Phone', 'P1'],
  ['Call recording compliance', 'Phone', 'P1'],
  ['Follow-up: 24h po call', 'Phone', 'P0'],
  // Acquisition database (46-60)
  ['Database: 500 firm + NIP scraping (CEIDG)', 'Database', 'P0'],
  ['Database: emails z Google Maps reviews', 'Database', 'P0'],
  ['Database: telefony z Panorama Firm', 'Database', 'P0'],
  ['Database: właściciel/decision-maker (LinkedIn)', 'Database', 'P1'],
  ['Database: tagging by city/category', 'Database', 'P0'],
  ['Database: deliverability scoring', 'Database', 'P1'],
  ['Database: GDPR-compliant lawful basis', 'Database', 'P0'],
  ['Outreach tool: Smartlead / Lemlist setup', 'Tools', 'P1'],
  ['Domain warming: 14 dni przed wysyłką', 'Tools', 'P0'],
  ['Dedicated IP / cold email domain', 'Tools', 'P1'],
  ['Reply handling: 4 templaty odpowiedzi', 'Reply', 'P0'],
  ['Reply handling: zainteresowany → demo', 'Reply', 'P0'],
  ['Reply handling: "później" → nurturing', 'Reply', 'P1'],
  ['Reply handling: "nie" → opt-out + tag', 'Reply', 'P0'],
  ['Reporting: weekly outreach dashboard', 'Reply', 'P1'],
];
outreachTasks.forEach(([t, s, p]) => addTask('outreach', t, s, p));

// ============ AGENT 5 — SEO (100 tasks) ============
// 40 stron city × category
cities.forEach((city) => {
  categories.forEach((cat) => {
    addTask('seo', `Strona: /${city.toLowerCase()}/${cat}`, 'Page generation', 'P0');
  });
});
// Pozostałe 60 tasków SEO
const seoTasks = [
  ['H1 rotation: 5 wariantów per slug', 'Templates', 'P0'],
  ['TL;DR generator: 2-3 zdania per page', 'Templates', 'P0'],
  ['Local context: cmentarze per miasto', 'Templates', 'P0'],
  ['Local context: USC adresy', 'Templates', 'P0'],
  ['Local context: parafie TOP 5', 'Templates', 'P1'],
  ['Price table generator: zakres cen', 'Templates', 'P0'],
  ['FAQ generator: 5-7 pytań per page', 'Templates', 'P0'],
  ['Internal linking: 8 linków per page', 'Templates', 'P0'],
  ['Schema.org: LocalBusiness na firmie', 'Schema', 'P0'],
  ['Schema.org: FAQPage na artykule', 'Schema', 'P0'],
  ['Schema.org: BreadcrumbList', 'Schema', 'P0'],
  ['Schema.org: Review aggregateRating', 'Schema', 'P0'],
  ['Schema.org: Service per category', 'Schema', 'P1'],
  ['sitemap.xml: dynamic generation', 'Technical', 'P0'],
  ['sitemap.xml: priority + changefreq', 'Technical', 'P0'],
  ['sitemap-index.xml: split by type', 'Technical', 'P1'],
  ['robots.txt: allow/disallow', 'Technical', 'P0'],
  ['Canonical URLs: kanonicalizacja', 'Technical', 'P0'],
  ['hreflang: pl-PL', 'Technical', 'P1'],
  ['Open Graph: 60 chars title + image', 'Technical', 'P0'],
  ['Twitter cards: summary_large_image', 'Technical', 'P1'],
  ['Meta description: 155 chars target', 'Technical', 'P0'],
  ['Image alt: descriptive (10-15 słów)', 'Technical', 'P0'],
  ['Image sitemap: dla zdjęć firm', 'Technical', 'P1'],
  ['Lazy loading: priority above-fold', 'Technical', 'P0'],
  ['Core Web Vitals: LCP < 2.5s', 'Performance', 'P0'],
  ['Core Web Vitals: CLS < 0.1', 'Performance', 'P0'],
  ['Core Web Vitals: INP < 200ms', 'Performance', 'P0'],
  ['Font optimization: preload + display swap', 'Performance', 'P0'],
  ['Image optimization: AVIF + WebP', 'Performance', 'P0'],
  // Keywords (30+ frazy)
  ['Keyword research: "ile kosztuje pogrzeb"', 'Keywords', 'P0'],
  ['Keyword research: "zasiłek pogrzebowy 2026"', 'Keywords', 'P0'],
  ['Keyword research: "zakład pogrzebowy {city}"', 'Keywords', 'P0'],
  ['Keyword research: "kremacja {city}"', 'Keywords', 'P0'],
  ['Keyword research: "transport zwłok"', 'Keywords', 'P0'],
  ['Keyword research: long-tail (50 fraz)', 'Keywords', 'P1'],
  ['Keyword research: "jak wybrać firmę"', 'Keywords', 'P0'],
  ['Keyword research: "kalkulator kosztów"', 'Keywords', 'P0'],
  ['Keyword research: "pogrzeb świecki"', 'Keywords', 'P1'],
  ['Keyword research: "cmentarz {city}"', 'Keywords', 'P1'],
  // Google Search Console / Analytics
  ['Google Search Console: weryfikacja domeny', 'GSC', 'P0'],
  ['Google Search Console: sitemap submit', 'GSC', 'P0'],
  ['Google Search Console: Core Web Vitals monitor', 'GSC', 'P0'],
  ['Bing Webmaster Tools: setup', 'GSC', 'P2'],
  ['Plausible: goal tracking', 'Analytics', 'P0'],
  ['UTM standardization: source/medium/campaign', 'Analytics', 'P1'],
  // Link building
  ['Backlinks: katalog firm hospicjum', 'Backlinks', 'P1'],
  ['Backlinks: ZUS partnerstwo (link z portalu)', 'Backlinks', 'P1'],
  ['Backlinks: stowarzyszenia pogrzebowe', 'Backlinks', 'P2'],
  ['Backlinks: lokalne portale miejskie', 'Backlinks', 'P2'],
  // Content programmatic
  ['Programmatic: cennik-pogrzebu per city', 'Programmatic', 'P1'],
  ['Programmatic: cmentarze per city', 'Programmatic', 'P1'],
  ['Programmatic: krematoria per voivodeship', 'Programmatic', 'P2'],
  ['Programmatic: parafie per city', 'Programmatic', 'P2'],
  ['Anti-duplication: unique % checker (>70%)', 'Programmatic', 'P0'],
  ['Anti-thin content: min 600 słów per page', 'Programmatic', 'P0'],
  // Authority
  ['E-E-A-T: author bio każdego artykułu', 'Authority', 'P0'],
  ['E-E-A-T: ekspert konsultacje (legalny)', 'Authority', 'P1'],
  ['E-E-A-T: "last updated" widoczne', 'Authority', 'P0'],
  ['E-E-A-T: review proces (editor)', 'Authority', 'P1'],
];
seoTasks.forEach(([t, s, p]) => addTask('seo', t, s, p));

// ============ AGENT 6 — GTM (60 tasks) ============
const gtmTasks = [
  // Pre-launch (14 dni)
  ['Pre-launch: domain + DNS + SSL', 'Pre-launch', 'P0'],
  ['Pre-launch: legal — Regulamin', 'Pre-launch', 'P0'],
  ['Pre-launch: legal — Polityka Prywatności', 'Pre-launch', 'P0'],
  ['Pre-launch: legal — RODO klauzule', 'Pre-launch', 'P0'],
  ['Pre-launch: legal — cookie banner (Plausible cookie-less)', 'Pre-launch', 'P1'],
  ['Pre-launch: legal — umowa B2B', 'Pre-launch', 'P0'],
  ['Pre-launch: email do testów (5 firm beta)', 'Pre-launch', 'P0'],
  ['Pre-launch: feedback z 5 firm beta', 'Pre-launch', 'P0'],
  ['Pre-launch: bugfix sprint (48h)', 'Pre-launch', 'P0'],
  ['Pre-launch: Lighthouse 95+ confirmation', 'Pre-launch', 'P0'],
  ['Pre-launch: backup + disaster recovery', 'Pre-launch', 'P0'],
  ['Pre-launch: status page (status.polskiepogrzeby.pl)', 'Pre-launch', 'P2'],
  ['Pre-launch: support email + telefon', 'Pre-launch', 'P0'],
  ['Pre-launch: Google Search Console verified', 'Pre-launch', 'P0'],
  // Launch day
  ['Launch day: feature flag → 100%', 'Launch', 'P0'],
  ['Launch day: cold email batch #1 (100 firm)', 'Launch', 'P0'],
  ['Launch day: PR — wysyłka do 5 mediów', 'Launch', 'P0'],
  ['Launch day: social media — LinkedIn post', 'Launch', 'P1'],
  ['Launch day: Product Hunt submission', 'Launch', 'P1'],
  ['Launch day: monitoring 24h', 'Launch', 'P0'],
  // 30-day GTM
  ['Tydzień 1: outreach 100 firm dziennie', 'GTM', 'P0'],
  ['Tydzień 1: A/B test landing page', 'GTM', 'P1'],
  ['Tydzień 2: PR follow-up + 3 wywiady', 'GTM', 'P1'],
  ['Tydzień 2: content publishing — 2 artykuły/tyg', 'GTM', 'P0'],
  ['Tydzień 3: Google Ads pilot (budżet 500zł)', 'GTM', 'P1'],
  ['Tydzień 3: TikTok edukacyjny (5 wideo)', 'GTM', 'P2'],
  ['Tydzień 4: partnerstwo z hospicjum', 'GTM', 'P1'],
  ['Tydzień 4: retencja — pierwsi paying customers', 'GTM', 'P0'],
  // Analytics & KPI
  ['KPI: leadów / tydzień (target 50)', 'KPI', 'P0'],
  ['KPI: konwersja lead→paying (target 8%)', 'KPI', 'P0'],
  ['KPI: MRR (target 10 000 zł / 90 dni)', 'KPI', 'P0'],
  ['KPI: CAC (target < 200 zł)', 'KPI', 'P0'],
  ['KPI: churn miesięczny (target < 5%)', 'KPI', 'P0'],
  ['KPI: ranking SEO TOP 10 (target 8 fraz)', 'KPI', 'P1'],
  ['KPI: Lighthouse score 95+ (utrzymanie)', 'KPI', 'P1'],
  ['Dashboard: real-time MRR ticker', 'Dashboard', 'P0'],
  ['Dashboard: leads heatmap (city × hour)', 'Dashboard', 'P1'],
  ['Dashboard: cohort retention chart', 'Dashboard', 'P1'],
  ['Dashboard: funnel visualization', 'Dashboard', 'P1'],
  // Acquisition channels
  ['Channel: SEO (organic, 70% target)', 'Channels', 'P0'],
  ['Channel: cold outreach (B2B 20%)', 'Channels', 'P0'],
  ['Channel: paid (Google Ads 5%)', 'Channels', 'P1'],
  ['Channel: referral (rodziny 5%)', 'Channels', 'P1'],
  ['Channel: partnerships (hospicja, ZUS)', 'Channels', 'P2'],
  // Retention & expansion
  ['Email drip: 7-dniowy onboarding firmy', 'Retention', 'P0'],
  ['NPS survey: po pierwszym lead won', 'Retention', 'P1'],
  ['Upgrade prompts: Standard → Pro after 5 leads', 'Retention', 'P0'],
  ['Win-back: churned firmy 30 days later', 'Retention', 'P1'],
  ['Referral program: 1 mc gratis za polecenie', 'Retention', 'P1'],
  // Risk & compliance
  ['Ryzyko: konkurencja FUNER reagująca', 'Risk', 'P1'],
  ['Ryzyko: niska liczba leadów początkowo', 'Risk', 'P1'],
  ['Ryzyko: bad PR z branży funeralnej', 'Risk', 'P2'],
  ['Compliance: RODO audit zewnętrzny', 'Risk', 'P1'],
  ['Compliance: KNF / UOKiK monitoring', 'Risk', 'P2'],
  ['Etyka: brak presji na rodziny w żałobie', 'Risk', 'P0'],
  ['Etyka: transparentność cen 100%', 'Risk', 'P0'],
  // Expansion
  ['Expansion: dodanie miasta #6 (Poznań) Q2', 'Expansion', 'P2'],
  ['Expansion: dodanie miasta #7 (Gdańsk) Q2', 'Expansion', 'P2'],
  ['Expansion: nowa kategoria — opieka nad grobem', 'Expansion', 'P2'],
  ['Expansion: B2C — sprzedaż urn/trumien', 'Expansion', 'P2'],
];
gtmTasks.forEach(([t, s, p]) => addTask('gtm', t, s, p));

// Verify counts
const counts = tasks.reduce((acc, t) => {
  acc[t.agent] = (acc[t.agent] || 0) + 1;
  return acc;
}, {});

console.log('Generated tasks:', tasks.length);
console.log('Distribution:', counts);

const outDir = path.join(process.cwd(), 'src/lib');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'tasks-plan.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), total: tasks.length, counts, tasks }, null, 2)
);
console.log('Written to src/lib/tasks-plan.json');
