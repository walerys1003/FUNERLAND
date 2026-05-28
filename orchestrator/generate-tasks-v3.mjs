#!/usr/bin/env node
/**
 * Phase 3 Task Generator — Path to Production
 * Output: src/lib/tasks-plan-v3.json
 *
 * Distribution (1000 tasks):
 *   builder: 170, designer: 90, content: 70, outreach: 50, seo: 90,
 *   gtm: 50, search: 80, marketplace: 140, ai: 90, devops: 110, qa: 60
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tasks = [];
let nextId = 1;

function add(agent, title, sub, priority = 'P1', deliverable = '') {
  tasks.push({
    id: `T3-${String(nextId++).padStart(4, '0')}`,
    agent,
    title,
    sub,
    priority,
    deliverable,
    status: 'queued',
    startedAt: null,
    completedAt: null,
    durationMs: null,
    output: null,
  });
}

function repeat(agent, items) {
  for (const [title, sub, priority, deliverable] of items) {
    add(agent, title, sub, priority, deliverable);
  }
}

// =================== AGENT 1 — BUILDER (170) ===================
const builderAuth = [
  ['Supabase Auth: email+password sign-up', 'Form + validation + welcome email', 'P0', 'src/app/(auth)/rejestracja/page.tsx'],
  ['Supabase Auth: sign-in', 'Email/password login form', 'P0', 'src/app/(auth)/logowanie/page.tsx'],
  ['Supabase Auth: magic link', 'Passwordless OTP via email', 'P0', 'src/app/(auth)/magic-link/page.tsx'],
  ['Supabase Auth: Google OAuth', 'Sign in with Google flow', 'P0', 'src/app/(auth)/callback/route.ts'],
  ['Supabase Auth: Facebook OAuth', 'Sign in with FB flow', 'P1', 'OAuth provider config'],
  ['2FA TOTP setup', 'Authenticator app integration', 'P1', '/panel-firmy/ustawienia/2fa'],
  ['Password reset flow', 'Email link → set new password', 'P0', '/reset-hasla/[token]'],
  ['Email verification flow', 'Confirm email click → activate account', 'P0', '/weryfikacja-email/[token]'],
  ['Account deletion (GDPR)', 'Right to be forgotten', 'P0', '/panel-rodziny/ustawienia/usun-konto'],
  ['Account data export (GDPR)', 'Download all my data as JSON/CSV', 'P0', '/api/me/export'],
  ['Middleware: protect /panel-*', 'Redirect to /logowanie if not authed', 'P0', 'src/middleware.ts'],
  ['Middleware: protect /admin', 'Role check: user.role === admin', 'P0', 'src/middleware.ts'],
  ['Session refresh in SSR', 'Auto-refresh expired tokens', 'P0', 'lib/supabase/server.ts'],
  ['User profile API', 'GET/PUT /api/me', 'P0', '/api/me/route.ts'],
  ['Role-based access control (RBAC)', 'user | company_owner | admin | super_admin', 'P0', 'lib/auth/rbac.ts'],
  ['Audit log trigger', 'INSERT/UPDATE/DELETE → audit_log table', 'P0', 'supabase/audit.sql'],
];

const builderPanels = [
  ['Panel Firmy: główny dashboard', 'KPI tygodnia: leady, wyświetlenia, konwersja', 'P0', '/panel-firmy/page.tsx'],
  ['Panel Firmy: leady — lista', 'Tabela z filtrami, statusami', 'P0', '/panel-firmy/leady/page.tsx'],
  ['Panel Firmy: lead detail', 'Pełne dane + przycisk unlock', 'P0', '/panel-firmy/leady/[id]/page.tsx'],
  ['Panel Firmy: profil edit', 'Wszystkie pola + zdjęcia', 'P0', '/panel-firmy/profil/page.tsx'],
  ['Panel Firmy: galeria zdjęć', 'Drag&drop, Supabase Storage', 'P0', 'components/panel/PhotoUploader.tsx'],
  ['Panel Firmy: cennik', 'Edycja widełek per usługa', 'P0', '/panel-firmy/cennik/page.tsx'],
  ['Panel Firmy: godziny otwarcia', 'Weekly schedule + 24h toggle', 'P1', '/panel-firmy/godziny/page.tsx'],
  ['Panel Firmy: certyfikaty', 'Upload PDF + verify', 'P1', '/panel-firmy/certyfikaty/page.tsx'],
  ['Panel Firmy: zespół (multi-user)', 'Owner + employees + roles', 'P1', '/panel-firmy/zespol/page.tsx'],
  ['Panel Firmy: zaproszenia członków', 'Send invite by email', 'P1', '/panel-firmy/zespol/zaproszenie'],
  ['Panel Firmy: recenzje', 'Lista + odpowiedzi', 'P0', '/panel-firmy/recenzje/page.tsx'],
  ['Panel Firmy: odpowiedź na recenzję', '1 odpowiedź per review', 'P1', 'API /api/reviews/[id]/reply'],
  ['Panel Firmy: billing — plan', 'Aktualny plan + zmiana + anuluj', 'P0', '/panel-firmy/billing/page.tsx'],
  ['Panel Firmy: billing — faktury', 'Historia + download PDF', 'P0', '/panel-firmy/billing/faktury'],
  ['Panel Firmy: billing — metoda płatności', 'Karta + zmiana', 'P0', '/panel-firmy/billing/karta'],
  ['Panel Firmy: statystyki', 'Wykresy: leady/tyg, konwersja, źródła', 'P1', '/panel-firmy/statystyki/page.tsx'],
  ['Panel Firmy: ustawienia notyfikacji', 'Email/SMS per kategoria', 'P1', '/panel-firmy/ustawienia/notyfikacje'],
  ['Panel Firmy: onboarding wizard', '5-step pierwsze wejście', 'P0', '/panel-firmy/onboarding/page.tsx'],
  ['Panel Firmy: kalendarz dostępności', 'Block/unblock dat', 'P1', '/panel-firmy/kalendarz/page.tsx'],
  ['Panel Firmy: messaging inbox', 'Wiadomości od rodzin', 'P1', '/panel-firmy/wiadomosci/page.tsx'],
];

const builderFamily = [
  ['Panel Rodziny: dashboard', 'Aktywne zapytania + oferty', 'P0', '/panel-rodziny/page.tsx'],
  ['Panel Rodziny: zapytania lista', 'Z statusami', 'P0', '/panel-rodziny/zapytania/page.tsx'],
  ['Panel Rodziny: zapytanie detail', '3 oferty w jednym widoku', 'P0', '/panel-rodziny/zapytania/[id]/page.tsx'],
  ['Panel Rodziny: porównywarka ofert', 'Side-by-side 3 firm', 'P0', 'components/family/OfferComparison.tsx'],
  ['Panel Rodziny: messaging', 'Czat z firmą via Supabase Realtime', 'P0', '/panel-rodziny/wiadomosci/page.tsx'],
  ['Panel Rodziny: recenzje — wystaw', '5-step form', 'P0', '/panel-rodziny/recenzje/wystaw/[bookingId]'],
  ['Panel Rodziny: dokumenty storage', 'Akt zgonu + ZUS + faktury', 'P1', '/panel-rodziny/dokumenty/page.tsx'],
  ['Panel Rodziny: multi-funeral', 'Wsparcie wielu pożegnań', 'P2', 'DB: family_members + funerals join'],
  ['Panel Rodziny: powiadomienia', 'Push/email gdy firma odpowie', 'P0', 'lib/notifications/dispatcher.ts'],
  ['Panel Rodziny: zapisz jako bliska', 'Tag relacji + retain dane', 'P2', 'DB column families.relations'],
];

const builderAdmin = [
  ['Panel Admin: dashboard globalny', 'MRR, churn, NPS, uptime', 'P0', '/admin/page.tsx'],
  ['Panel Admin: firmy lista', 'Filter, search, bulk actions', 'P0', '/admin/firmy/page.tsx'],
  ['Panel Admin: firma weryfikacja', 'NIP/KRS/doc check workflow', 'P0', '/admin/firmy/[id]/weryfikacja'],
  ['Panel Admin: firma ban/unban', 'Block + reason', 'P0', 'API /api/admin/companies/[id]/ban'],
  ['Panel Admin: leady lista', 'Wszystkie leady + manual routing', 'P0', '/admin/leady/page.tsx'],
  ['Panel Admin: recenzje moderacja', 'Pending queue + approve/reject', 'P0', '/admin/recenzje/page.tsx'],
  ['Panel Admin: użytkownicy', 'Full list + role mgmt', 'P0', '/admin/uzytkownicy/page.tsx'],
  ['Panel Admin: transakcje', 'Wszystkie płatności + refunds', 'P0', '/admin/transakcje/page.tsx'],
  ['Panel Admin: refund flow', 'Stripe refund + reason', 'P1', 'API /api/admin/refund'],
  ['Panel Admin: content CMS', 'Markdown editor + publish', 'P1', '/admin/content/page.tsx'],
  ['Panel Admin: SEO meta', 'Per-page title/desc editor', 'P1', '/admin/seo/page.tsx'],
  ['Panel Admin: redirects', '301/302 rules', 'P1', '/admin/redirects/page.tsx'],
  ['Panel Admin: broadcast SMS', 'Bulk SMS to firms or families', 'P2', '/admin/broadcast/sms'],
  ['Panel Admin: broadcast email', 'Bulk email z templates', 'P2', '/admin/broadcast/email'],
  ['Panel Admin: audit log viewer', 'Filter + search audit_log', 'P1', '/admin/audyt/page.tsx'],
  ['Panel Admin: feature flags', 'Toggle features per env', 'P2', '/admin/flagi/page.tsx'],
  ['Panel Admin: ai analytics', 'Conversations, tokens, costs', 'P2', '/admin/ai-analytics'],
  ['Panel Admin: search analytics', 'Top queries, zero-results', 'P1', '/admin/search-analytics'],
];

const builderBilling = [
  ['Stripe Checkout: subscription init', 'Create session for plan', 'P0', 'API /api/checkout/subscription'],
  ['Stripe Checkout: lead-unlock', 'One-time 49 PLN', 'P0', 'API /api/checkout/lead-unlock'],
  ['Stripe Checkout: obituary-premium', 'One-time 49 PLN', 'P0', 'API /api/checkout/obituary'],
  ['Stripe Customer Portal', 'Self-service portal link', 'P0', 'API /api/billing/portal'],
  ['Przelewy24: init transaction', 'POST /api/p24/init', 'P0', 'API /api/p24/init/route.ts'],
  ['Przelewy24: notify webhook', 'POST /api/p24/notify (status update)', 'P0', 'API /api/p24/notify/route.ts'],
  ['Przelewy24: verify hash', 'SHA-384 hash verification', 'P0', 'lib/p24/verify.ts'],
  ['BLIK flow via Przelewy24', 'Code prompt → settle', 'P0', 'components/billing/BlikDialog.tsx'],
  ['Page: /billing/sukces', 'Confirmation + next steps', 'P0', '/billing/sukces/page.tsx'],
  ['Page: /billing/blad', 'Error + retry', 'P0', '/billing/blad/page.tsx'],
  ['Page: /billing/anulowane', 'Cancelled checkout', 'P0', '/billing/anulowane/page.tsx'],
  ['Invoice PDF generator', 'Server-side React-PDF', 'P0', 'lib/billing/invoice-pdf.ts'],
  ['Invoice numbering: PL VAT', 'FV/YYYY/MM/NNN format', 'P0', 'lib/billing/numbering.ts'],
  ['JPK_VAT XML export', 'Monthly aggregation', 'P1', '/admin/billing/jpk-vat'],
  ['Subscription cancellation flow', 'Soft cancel + win-back', 'P0', '/panel-firmy/billing/anuluj'],
  ['Subscription upgrade/downgrade', 'Prorate via Stripe', 'P0', 'API /api/billing/change-plan'],
  ['Failed payment dunning', 'Retry 3× + notify', 'P0', 'workers/dunning.mjs'],
  ['Refund automation', 'Auto-refund w polityce 14 dni', 'P1', 'lib/billing/refund.ts'],
];

const builderSecurity = [
  ['CSRF tokens dla form POST', 'next-csrf middleware', 'P0', 'lib/security/csrf.ts'],
  ['Rate limit /api/lead', 'Upstash Redis: 5/min/IP', 'P0', 'lib/security/ratelimit.ts'],
  ['Rate limit /api/ai/chat', '20/min/session', 'P0', 'lib/security/ratelimit.ts'],
  ['Rate limit /api/booking', '5/min/IP', 'P0', 'lib/security/ratelimit.ts'],
  ['Cloudflare Turnstile na /zapytanie', 'Bot protection', 'P0', 'components/forms/TurnstileField.tsx'],
  ['Cloudflare Turnstile na /api/lead', 'Server-side verify', 'P0', 'lib/security/turnstile.ts'],
  ['CSP headers config', 'next.config.mjs', 'P0', 'next.config.mjs'],
  ['HSTS header', 'max-age=31536000; includeSubDomains; preload', 'P0', 'next.config.mjs'],
  ['X-Frame-Options DENY', 'Prevent clickjacking', 'P0', 'next.config.mjs'],
  ['Permissions-Policy', 'Restrict camera/mic/geo', 'P0', 'next.config.mjs'],
  ['XSS sanitization', 'DOMPurify dla user content', 'P0', 'lib/security/sanitize.ts'],
  ['SQL injection prevention audit', 'All raw queries use params', 'P0', 'audit script'],
  ['Honeypot fields w forms', 'Hidden field for bots', 'P1', 'components/forms/Honeypot.tsx'],
  ['File upload validation', 'Magic bytes + size + type', 'P0', 'lib/security/upload.ts'],
  ['Webhook signature verify (Stripe)', 'STRIPE_WEBHOOK_SECRET', 'P0', 'api/stripe-webhook hardening'],
  ['Webhook signature verify (P24)', 'SHA-384 + IP allowlist', 'P0', 'api/p24/notify hardening'],
];

repeat('builder', [...builderAuth, ...builderPanels, ...builderFamily, ...builderAdmin, ...builderBilling, ...builderSecurity]);

while (tasks.filter((t) => t.agent === 'builder').length < 170) {
  const i = tasks.filter((t) => t.agent === 'builder').length;
  add('builder', `Builder polish #${i + 1}`, 'Refactoring, performance, edge cases', 'P2', '');
}

// =================== AGENT 2 — DESIGNER (90) ===================
const designerComponents = [
  ['DataTable component', 'Sortable, filterable, paginated', 'P0', 'components/ui/DataTable.tsx'],
  ['Drawer component', 'Slide-in from right', 'P0', 'components/ui/Drawer.tsx'],
  ['Modal component', 'Centered + backdrop blur', 'P0', 'components/ui/Modal.tsx'],
  ['Tabs component', 'Underline + content swap', 'P0', 'components/ui/Tabs.tsx'],
  ['Stats card', 'Number + delta + sparkline', 'P0', 'components/ui/StatsCard.tsx'],
  ['Chart wrapper (recharts)', 'Line/Bar/Pie standardized', 'P1', 'components/ui/Chart.tsx'],
  ['Stepper component', 'Multi-step indicator', 'P0', 'components/ui/Stepper.tsx'],
  ['Toast notifications', 'Sonner integration', 'P0', 'components/ui/Toaster.tsx'],
  ['Skeleton loaders', 'Per route + per component', 'P0', 'components/ui/Skeleton.tsx'],
  ['Empty state component', 'Icon + msg + CTA', 'P0', 'components/ui/EmptyState.tsx'],
  ['Error boundary', 'Friendly fallback UI', 'P0', 'components/ui/ErrorBoundary.tsx'],
  ['Confirmation dialog', '"Czy na pewno" z reason field', 'P0', 'components/ui/ConfirmDialog.tsx'],
  ['Avatar component', 'Image/initials fallback', 'P1', 'components/ui/Avatar.tsx'],
  ['Badge variants', '8 wariantów stanów', 'P0', 'components/ui/Badge.tsx'],
  ['Tooltip', 'Hover delay + position smart', 'P1', 'components/ui/Tooltip.tsx'],
  ['Popover', 'Click-to-show + anchor', 'P1', 'components/ui/Popover.tsx'],
  ['Date picker', 'PL locale + min/max', 'P0', 'components/ui/DatePicker.tsx'],
  ['Time picker', '15-min intervals', 'P0', 'components/ui/TimePicker.tsx'],
  ['File uploader', 'Drag&drop + preview', 'P0', 'components/ui/FileUploader.tsx'],
  ['Rich text editor', 'Tiptap dla content/admin', 'P1', 'components/ui/RichEditor.tsx'],
  ['Rating input', '5 stars clickable', 'P0', 'components/ui/RatingInput.tsx'],
  ['Multi-select', 'Chips with remove', 'P1', 'components/ui/MultiSelect.tsx'],
  ['Autocomplete combobox', 'Async search', 'P0', 'components/ui/Combobox.tsx'],
  ['Pagination', 'Pager + page-size', 'P0', 'components/ui/Pagination.tsx'],
  ['Breadcrumbs', 'Schema.org JSON-LD ready', 'P0', 'components/ui/Breadcrumbs.tsx'],
];

const designerAnims = [
  ['Animation: fade-in on scroll', 'Framer Motion + IntersectionObserver', 'P1', 'lib/animations/fadeIn.ts'],
  ['Animation: stagger children', 'Lista pojawia się po kolei', 'P1', 'lib/animations/stagger.ts'],
  ['Animation: parallax hero', 'Y-offset on scroll', 'P2', 'components/hero parallax'],
  ['Animation: number counter', 'Animated counting up', 'P1', 'components/ui/Counter.tsx'],
  ['Animation: skeleton shimmer', 'CSS shimmer effect', 'P1', 'tailwind keyframes'],
  ['Animation: page transitions', 'Smooth opacity swap', 'P2', 'template.tsx'],
  ['Animation: button hover lift', 'Subtle Y-up + shadow', 'P1', 'globals.css'],
  ['Animation: card hover scale', '1.02× transform', 'P1', 'globals.css'],
  ['Animation: progress bar fill', 'Width transition', 'P1', 'components/ui/Progress.tsx'],
  ['Animation: success checkmark', 'SVG path animate', 'P1', 'components/ui/SuccessIcon.tsx'],
];

const designerA11y = [
  ['A11y: keyboard nav all forms', 'Tab order + Enter submit', 'P0', 'audit + fix'],
  ['A11y: focus visible all elements', 'Custom focus ring', 'P0', 'globals.css'],
  ['A11y: ARIA labels all icons', 'aria-label="Zamknij" etc.', 'P0', 'audit + fix'],
  ['A11y: contrast 4.5:1 audit', 'WCAG AA compliance', 'P0', 'tokens fix'],
  ['A11y: skip to content link', 'Visible on Tab', 'P0', 'layout.tsx'],
  ['A11y: form errors aria-live', 'Screen reader announces', 'P0', 'components/ui/FormField'],
  ['A11y: modal focus trap', 'Tab cycles within modal', 'P0', 'components/ui/Modal'],
  ['A11y: reduced motion support', 'prefers-reduced-motion', 'P1', 'CSS @media'],
  ['Dark mode: tokens', 'CSS variables for both modes', 'P1', 'globals.css'],
  ['Dark mode: toggle component', 'System/light/dark trio', 'P1', 'components/ui/ThemeToggle.tsx'],
  ['Dark mode: persist preference', 'localStorage + cookie', 'P1', 'lib/theme.ts'],
  ['Dark mode: 50 component audit', 'All UI works in dark', 'P1', 'visual review'],
];

repeat('designer', [...designerComponents, ...designerAnims, ...designerA11y]);
while (tasks.filter((t) => t.agent === 'designer').length < 90) {
  const i = tasks.filter((t) => t.agent === 'designer').length;
  add('designer', `Designer polish #${i + 1}`, 'Visual QA, microcopy, spacing', 'P2', '');
}

// =================== AGENT 3 — CONTENT (70) ===================
const contentArticles = [
  ['Artykuł: Akt zgonu — gdzie i jak uzyskać', '2500 słów, FAQ, checklist', 'P0', 'src/content/articles/akt-zgonu-jak-uzyskac.md'],
  ['Artykuł: Wybór trumny — przewodnik', 'Materiały, ceny, eco', 'P0', 'src/content/articles/wybor-trumny.md'],
  ['Artykuł: Pogrzeb w obrządku prawosławnym', 'Specyfika + ceremonie', 'P1', 'src/content/articles/pogrzeb-prawoslawny.md'],
  ['Artykuł: Pogrzeb w obrządku żydowskim', 'Halacha + ceremonie', 'P1', 'src/content/articles/pogrzeb-zydowski.md'],
  ['Artykuł: Pogrzeb muzułmański', 'Janazah + zasady', 'P1', 'src/content/articles/pogrzeb-muzulmanski.md'],
  ['Artykuł: Co zrobić, gdy śmierć w domu', 'Karetka, lekarz, formalności', 'P0', 'src/content/articles/smierc-w-domu.md'],
  ['Artykuł: Transmisja online pogrzebu', 'Jak zorganizować, koszty', 'P1', 'src/content/articles/transmisja-online.md'],
  ['Artykuł: Cmentarze w Polsce — typy', 'Komunalny vs. wyznaniowy', 'P1', 'src/content/articles/typy-cmentarzy.md'],
  ['Artykuł: Mowa pożegnalna — jak napisać', 'Struktura + przykłady', 'P1', 'src/content/articles/mowa-pozegnalna.md'],
  ['Artykuł: Nekrolog — jak napisać', 'Wzory + tipy', 'P1', 'src/content/articles/jak-napisac-nekrolog.md'],
  ['Artykuł: Stypa — tradycja i organizacja', 'Catering, sala, koszty', 'P1', 'src/content/articles/stypa.md'],
  ['Artykuł: Pogrzeb dziecka — wsparcie', 'Empatyczny przewodnik', 'P1', 'src/content/articles/pogrzeb-dziecka.md'],
];

const contentFaq = [
  ['FAQ: 10 pytań o zasiłek pogrzebowy', 'Każde pytanie 100-200 słów', 'P0', 'src/content/faq/zasilek.md'],
  ['FAQ: 10 pytań o kremację', 'Z linkami do artykułu', 'P0', 'src/content/faq/kremacja.md'],
  ['FAQ: 10 pytań o wybór zakładu', 'Co sprawdzić, na co uważać', 'P0', 'src/content/faq/wybor-zakladu.md'],
  ['FAQ: 10 pytań o ceny pogrzebu', 'Co składa się na koszt', 'P0', 'src/content/faq/ceny.md'],
  ['FAQ: 10 pytań o formalności', 'Akty, US, ZUS', 'P0', 'src/content/faq/formalnosci.md'],
];

const contentGlossary = [
  ['Glossary: 20 haseł A-Ć', 'Akt zgonu, balsamacja, cyrkonia...', 'P1', 'src/content/glossary/a-c.md'],
  ['Glossary: 20 haseł D-K', 'Domówiny, ekshumacja, katafalk...', 'P1', 'src/content/glossary/d-k.md'],
  ['Glossary: 20 haseł L-P', 'Mauzoleum, nekrolog, pochówek...', 'P1', 'src/content/glossary/l-p.md'],
  ['Glossary: 20 haseł R-Ż', 'Sarkofag, transport, wieniec...', 'P1', 'src/content/glossary/r-z.md'],
  ['Glossary indeks alfabetyczny', '/poradnik/slownik strona', 'P1', 'src/app/poradnik/slownik/page.tsx'],
];

const contentVideo = [
  ['Video script: Jak zorganizować pogrzeb (90s)', 'Voiceover + storyboard', 'P1', 'content/video/01-organizacja.md'],
  ['Video script: Czym jest zasiłek pogrzebowy (90s)', 'Z animacją kwoty', 'P1', 'content/video/02-zasilek.md'],
  ['Video script: Kremacja vs tradycja (120s)', 'Side-by-side', 'P1', 'content/video/03-kremacja.md'],
  ['Video script: Jak wybrać zakład (90s)', '5 kroków checklist', 'P1', 'content/video/04-wybor.md'],
  ['Video script: Dokumenty potrzebne (90s)', 'Lista + B-roll', 'P1', 'content/video/05-dokumenty.md'],
  ['Video script: Pogrzeb dziecka — wsparcie (120s)', 'Empatyczny ton', 'P2', 'content/video/06-dziecko.md'],
  ['Video script: Mowa pożegnalna — porady (90s)', 'Cytaty + advice', 'P2', 'content/video/07-mowa.md'],
];

const contentLeadMagnets = [
  ['Lead magnet: Lista dokumentów PDF', 'Do pobrania po podaniu email', 'P0', 'public/downloads/lista-dokumentow.pdf'],
  ['Lead magnet: Checklist pogrzebowy PDF', '60-pkt checklist', 'P0', 'public/downloads/checklist-pogrzebowy.pdf'],
  ['Lead magnet: Wzory mów pożegnalnych PDF', '5 wzorów', 'P1', 'public/downloads/mowy-wzory.pdf'],
  ['Lead magnet: Wzory nekrologów PDF', '10 wzorów', 'P1', 'public/downloads/nekrologi-wzory.pdf'],
  ['Lead magnet: Kalkulator kosztów Excel', 'Pobierz spreadsheet', 'P2', 'public/downloads/kalkulator.xlsx'],
];

const contentEmail = [
  ['Email template: welcome (rodzina)', 'MJML → HTML', 'P0', 'emails/templates/welcome-family.mjml'],
  ['Email template: welcome (firma)', 'MJML → HTML', 'P0', 'emails/templates/welcome-company.mjml'],
  ['Email template: lead confirmation', 'Numer + co dalej', 'P0', 'emails/templates/lead-confirm.mjml'],
  ['Email template: lead received (firma)', 'Nowy lead z linkiem', 'P0', 'emails/templates/lead-received.mjml'],
  ['Email template: booking confirmation', 'Numer + szczegóły', 'P0', 'emails/templates/booking-confirm.mjml'],
  ['Email template: booking reminder 24h', 'Cron 24h przed', 'P0', 'emails/templates/booking-reminder.mjml'],
  ['Email template: payment success', 'Faktura attached', 'P0', 'emails/templates/payment-success.mjml'],
  ['Email template: payment failed', 'Retry CTA', 'P0', 'emails/templates/payment-failed.mjml'],
  ['Email template: password reset', 'Link 24h ważny', 'P0', 'emails/templates/pwd-reset.mjml'],
  ['Email template: account verify', 'Click to activate', 'P0', 'emails/templates/verify-email.mjml'],
  ['Email template: review request', 'Po booking 7 dni', 'P1', 'emails/templates/review-request.mjml'],
  ['Email template: NPS survey', '1-question + open feedback', 'P1', 'emails/templates/nps.mjml'],
  ['Email template: weekly digest (firma)', 'Statystyki tygodnia', 'P1', 'emails/templates/weekly-digest.mjml'],
  ['Email template: win-back', 'Po 30 dni inactive', 'P2', 'emails/templates/winback.mjml'],
  ['Email template: subscription renewal', '7 dni przed odnowieniem', 'P1', 'emails/templates/renewal.mjml'],
];

const contentMicrocopy = [
  ['Microcopy: 50 CTA buttons', 'Spójne tonem, max 3 słowa', 'P1', 'lib/copy/ctas.ts'],
  ['Microcopy: 30 error messages', 'Empatyczne, actionable', 'P1', 'lib/copy/errors.ts'],
  ['Microcopy: 30 empty states', 'Z CTA i hint', 'P1', 'lib/copy/empty.ts'],
  ['Microcopy: 30 success messages', 'Confirmation copy', 'P1', 'lib/copy/success.ts'],
  ['Microcopy: 50 form labels', 'Inputs + placeholders', 'P1', 'lib/copy/forms.ts'],
  ['Microcopy: tone of voice guide', '10-page brand voice doc', 'P1', 'docs/brand-voice.md'],
];

repeat('content', [...contentArticles, ...contentFaq, ...contentGlossary, ...contentVideo, ...contentLeadMagnets, ...contentEmail, ...contentMicrocopy]);
while (tasks.filter((t) => t.agent === 'content').length < 70) {
  const i = tasks.filter((t) => t.agent === 'content').length;
  add('content', `Content polish #${i + 1}`, 'Editing, SEO optimization, internal linking', 'P2', '');
}

// =================== AGENT 4 — OUTREACH (50) ===================
const outreachTasks = [
  ['Drip email 1/10: Welcome (Day 0)', 'Confirmation + first value', 'P0', 'outreach/drip/01-welcome.md'],
  ['Drip email 2/10: Quick win (Day 2)', 'Setup w 10 min', 'P0', 'outreach/drip/02-quick-win.md'],
  ['Drip email 3/10: Social proof (Day 5)', 'Case study krótko', 'P0', 'outreach/drip/03-social-proof.md'],
  ['Drip email 4/10: Feature spotlight (Day 9)', 'Pokaż 1 ficzer', 'P1', 'outreach/drip/04-feature.md'],
  ['Drip email 5/10: Customer story (Day 14)', 'Pełen case', 'P1', 'outreach/drip/05-story.md'],
  ['Drip email 6/10: Educational (Day 21)', 'Branża insights', 'P1', 'outreach/drip/06-edu.md'],
  ['Drip email 7/10: Webinar invite (Day 30)', 'Live demo zaproszenie', 'P1', 'outreach/drip/07-webinar.md'],
  ['Drip email 8/10: Testimonial (Day 45)', 'Quote + photo', 'P1', 'outreach/drip/08-testimonial.md'],
  ['Drip email 9/10: Trial → paid (Day 60)', 'Upgrade CTA', 'P0', 'outreach/drip/09-upgrade.md'],
  ['Drip email 10/10: Loyalty (Day 90)', 'Thank you + advocacy ask', 'P1', 'outreach/drip/10-loyalty.md'],
  ['Partner outreach: PSP (Polskie Stow.)', 'Letter + meeting request', 'P1', 'outreach/partners/psp.md'],
  ['Partner outreach: KOP (Krajowy Ośr.)', 'Letter + collab pitch', 'P1', 'outreach/partners/kop.md'],
  ['Partner outreach: ZUS', 'Edu collaboration', 'P2', 'outreach/partners/zus.md'],
  ['Partner outreach: Caritas', 'Charity partnership', 'P2', 'outreach/partners/caritas.md'],
  ['PR: One-pager press kit', 'Pdf z key facts', 'P1', 'outreach/pr/one-pager.md'],
  ['PR: Press release — launch', 'Polski + EN wersja', 'P0', 'outreach/pr/launch-press-release.md'],
  ['PR: Press release — milestone 100 firm', 'Reusable template', 'P1', 'outreach/pr/100-companies.md'],
  ['PR: Founder bio (PL + EN)', 'Bio + headshot guidelines', 'P1', 'outreach/pr/founder-bio.md'],
  ['PR: FAQ for journalists', '15 anticipated questions', 'P1', 'outreach/pr/journo-faq.md'],
  ['PR: Media list 50 outlets', 'Lokalne + branżowe + ogólne', 'P1', 'outreach/pr/media-list.csv'],
  ['Influencer outreach: 20 mikro-PL', 'TikTok + IG senior community', 'P2', 'outreach/influencer/list.csv'],
  ['Influencer pitch template', '3 warianty', 'P2', 'outreach/influencer/pitch.md'],
  ['ICP cold list: 1000 zakładów', 'NIP + email + decision-maker', 'P0', 'outreach/icp/cold-list-1000.csv'],
  ['ICP enrichment: Hunter.io', 'Find emails automatically', 'P0', 'outreach/icp/enrichment-script.mjs'],
  ['ICP scoring formula', 'Wielkość + lokalizacja + reviews', 'P1', 'outreach/icp/scoring.md'],
  ['LinkedIn calendar Q1', '36 postów (3/tydz × 12 tyg.)', 'P1', 'outreach/linkedin/calendar-q1.md'],
  ['LinkedIn post #1: Launch announcement', 'CEO post + employee amplify', 'P0', 'outreach/linkedin/posts/01.md'],
  ['LinkedIn post #2-12: Series', '11 więcej postów', 'P1', 'outreach/linkedin/posts/'],
  ['SMS drip: 5-msg sequence', '160 chars each', 'P1', 'outreach/sms-drip/'],
  ['Cold call playbook v2', 'Updated z nowymi obiekcjami', 'P1', 'outreach/playbook-v2.md'],
  ['Webinar slide deck', '20 slides — "Jak zdobyć 5 leadów/m-c"', 'P1', 'outreach/webinar/deck.pdf'],
  ['Webinar landing page', '/webinar/leady page', 'P1', '/app/webinar/leady/page.tsx'],
  ['Sales collateral: Pricing 1-pager', 'Compare 4 plany', 'P0', 'outreach/sales/pricing.pdf'],
  ['Sales collateral: ROI calculator', 'Per-firm input → savings', 'P1', 'outreach/sales/roi-calc.xlsx'],
  ['Sales collateral: Case study PDF', '"Cracovia Pogrzeb +320% leadów"', 'P0', 'outreach/sales/case-cracovia.pdf'],
  ['Sales collateral: Onboarding deck', '15 slides nowi klienci', 'P1', 'outreach/sales/onboarding.pdf'],
  ['Referral program rules', 'Polecaj = 1 m-c gratis', 'P1', 'outreach/referral/rules.md'],
  ['Referral program email seq', '3 emaile aktywujące', 'P1', 'outreach/referral/emails/'],
  ['Public roadmap page', 'Trello/Notion public', 'P2', '/roadmap/page.tsx'],
  ['Changelog page', '/changelog auto-from-git', 'P2', '/changelog/page.tsx'],
];

repeat('outreach', outreachTasks);
while (tasks.filter((t) => t.agent === 'outreach').length < 50) {
  const i = tasks.filter((t) => t.agent === 'outreach').length;
  add('outreach', `Outreach polish #${i + 1}`, 'Iterations, A/B subject lines', 'P2', '');
}

// =================== AGENT 5 — SEO (90) ===================
const seoTasks = [
  ['Schema.org: FuneralHome per /firma', 'Already done — validate w GSC', 'P0', 'audit'],
  ['Schema.org: FAQPage per artykuł', '5 FAQ z każdego artykułu', 'P0', 'src/lib/seo/json-ld.ts'],
  ['Schema.org: HowTo per "jak..."', '5-step structured', 'P0', 'wybrane artykuły'],
  ['Schema.org: Review per recenzja', 'AggregateRating per firma', 'P0', 'firma/[slug] page'],
  ['Schema.org: Service per kategoria', 'Per category page', 'P0', '[city]/[category]'],
  ['Schema.org: Event per nekrolog premium', 'Ceremony as Event', 'P1', 'nekrologi/[slug]'],
  ['Schema.org: BreadcrumbList global', 'Already done — verify', 'P0', 'audit'],
  ['Schema.org: SearchAction', 'Already done — verify', 'P0', 'layout'],
  ['Schema validation Q1', 'Run Rich Results Test', 'P0', 'GSC manual'],
  ['Schema validation Q2', 'Repeat for new pages', 'P1', 'GSC manual'],
  ['OG image generator API', '/api/og?title=...', 'P0', 'src/app/api/og/route.ts'],
  ['OG image: artykuły', 'Per article auto-gen', 'P0', 'integrate w metadata'],
  ['OG image: firma profiles', 'Per company auto-gen', 'P0', 'integrate w metadata'],
  ['OG image: city pages', 'Per city dynamic', 'P0', 'integrate w metadata'],
  ['OG image: nekrologi', 'Per obituary tasteful', 'P1', 'integrate w metadata'],
  ['Twitter card meta', 'Per page summary_large_image', 'P1', 'metadata'],
  ['Hreflang PL → PL-PL', 'Verify default', 'P0', 'layout'],
  ['Hreflang EN expansion ready', 'i18n config for future', 'P2', 'next.config'],
  ['Canonical URLs all pages', 'Prevent duplicate content', 'P0', 'audit'],
  ['Internal linking audit', 'Każda strona min 3 links in', 'P0', 'Screaming Frog'],
  ['Internal linking: article → related', '5 related per artykuł', 'P0', 'poradnik/[slug]'],
  ['Internal linking: city → companies', 'Lista firm w mieście', 'P0', '[city] page'],
  ['Internal linking: category → cities', 'Cross-link cities', 'P0', '[category] hub'],
  ['Sitemap split: 1 per type', 'sitemap-articles.xml, sitemap-companies.xml...', 'P1', 'sitemap.ts'],
  ['Sitemap priorities', 'Adjust priority + changefreq', 'P0', 'sitemap.ts'],
  ['Sitemap submit GSC', 'After deploy', 'P0', 'manual'],
  ['Sitemap submit Bing', 'After deploy', 'P0', 'manual'],
  ['Robots.txt: block staging', 'NoIndex preview deployments', 'P0', 'robots.ts'],
  ['Core Web Vitals audit', 'LCP/CLS/INP per page', 'P0', 'PageSpeed Insights'],
  ['CWV: fix LCP <2.5s', 'Optimize hero image', 'P0', 'next/image'],
  ['CWV: fix CLS <0.1', 'Reserve space dla images', 'P0', 'aspect-ratio CSS'],
  ['CWV: fix INP <200ms', 'Reduce JS bundles', 'P0', 'code splitting'],
  ['Lighthouse Performance ≥90', 'All public pages', 'P0', 'audit + fix'],
  ['Lighthouse Accessibility ≥95', 'All public pages', 'P0', 'audit + fix'],
  ['Lighthouse Best Practices ≥95', 'All public pages', 'P0', 'audit + fix'],
  ['Lighthouse SEO ≥95', 'All public pages', 'P0', 'audit + fix'],
  ['AMP version: artykuły', 'Optional AMP for top 10', 'P2', '/poradnik/[slug].amp.tsx'],
  ['Local SEO: GBP API integration', 'Auto-create Google Business profiles', 'P1', 'lib/seo/gbp.ts'],
  ['Local SEO: NAP consistency check', 'Audit 20 dirs', 'P1', 'manual + tool'],
  ['Local SEO: Panorama Firm sync', 'Bulk upload', 'P2', 'lib/seo/panoramafirm.ts'],
  ['Local SEO: schema LocalBusiness all firms', 'Per firma', 'P0', 'firma/[slug]'],
  ['Backlink monitoring: Ahrefs', 'Weekly report', 'P1', 'manual setup'],
  ['Backlink outreach: HARO', '5 pitches/tydz.', 'P1', 'process doc'],
  ['Backlink outreach: branżowe', 'Gazeta Funeralna etc.', 'P1', 'list 20 sites'],
  ['Brand mention tracking', 'Google Alerts + Mention.com', 'P1', 'manual setup'],
  ['Disavow toxic backlinks', 'Quarterly review', 'P2', 'GSC tool'],
  ['Page speed budget', 'Define limits per page type', 'P0', 'docs/perf-budget.md'],
  ['Page speed monitoring', 'WebPageTest scheduled', 'P1', 'scheduled tests'],
  ['Image optimization', 'Sharp + WebP/AVIF', 'P0', 'next.config'],
  ['Image lazy loading audit', 'All images loading="lazy"', 'P0', 'audit'],
  ['Font optimization', 'Subset + preload', 'P0', 'next/font config'],
  ['Critical CSS inline', 'Above-the-fold only', 'P1', 'beasties/critters'],
  ['JS bundle analysis', 'Identify large deps', 'P0', '@next/bundle-analyzer'],
  ['Code splitting per route', 'Dynamic imports', 'P0', 'audit'],
  ['Prefetch top routes', 'Link prefetch=true', 'P1', 'audit'],
  ['CDN: Cloudflare cache rules', 'Static 1yr, HTML 1h', 'P0', 'Cloudflare config'],
  ['Cache headers all routes', 'Cache-Control: public, max-age', 'P0', 'next.config'],
  ['Stale-While-Revalidate', 'Where appropriate', 'P1', 'audit'],
  ['Service Worker cache', 'Workbox precaching', 'P1', 'public/sw.js'],
  ['PWA manifest', 'icons + theme color', 'P1', 'public/manifest.json'],
  ['Apple touch icons', 'iOS Safari', 'P1', 'public/apple-touch-icon.png'],
  ['Favicon set', '16/32/48/192/512', 'P0', 'public/'],
  ['Open Graph fallback image', 'Brand default', 'P0', 'public/og-default.png'],
];

repeat('seo', seoTasks);
while (tasks.filter((t) => t.agent === 'seo').length < 90) {
  const i = tasks.filter((t) => t.agent === 'seo').length;
  add('seo', `SEO polish #${i + 1}`, 'Long-tail keyword tracking, content gaps', 'P2', '');
}

// =================== AGENT 6 — GTM (50) ===================
const gtmTasks = [
  ['Plausible install + verify', 'Self-hosted setup', 'P0', 'add script'],
  ['Plausible custom events: lead_submitted', 'Track form completion', 'P0', 'lib/analytics.ts'],
  ['Plausible custom events: booking_completed', 'Track funnel', 'P0', 'lib/analytics.ts'],
  ['Plausible custom events: search_performed', 'Track queries', 'P1', 'lib/analytics.ts'],
  ['Plausible custom events: ai_chat_opened', 'Engagement', 'P1', 'lib/analytics.ts'],
  ['Plausible goals + funnels', 'Conversion paths', 'P0', 'Plausible UI'],
  ['PostHog feature flags', 'A/B testing infra', 'P1', 'lib/posthog.ts'],
  ['A/B test #1: Hero CTA copy', '"Zapytaj" vs "Sprawdź ceny"', 'P1', 'PostHog'],
  ['A/B test #2: CTA color', 'Green vs Gold', 'P1', 'PostHog'],
  ['A/B test #3: Form length', 'Long vs Short zapytanie', 'P1', 'PostHog'],
  ['A/B test #4: Pricing display', 'Show price vs "Zapytaj"', 'P1', 'PostHog'],
  ['A/B test #5: Social proof position', 'Above vs Below CTA', 'P1', 'PostHog'],
  ['UTM tracking middleware', 'Capture + persist 30 dni', 'P0', 'middleware.ts'],
  ['Attribution model', 'First-touch + Last-touch', 'P1', 'lib/attribution.ts'],
  ['Cohort dashboard', 'Weekly cohorts retention', 'P1', '/admin/cohorts/page.tsx'],
  ['NPS automation', 'After booking + 7 dni', 'P0', 'workers/nps-trigger.mjs'],
  ['NPS dashboard', 'Score + verbatims', 'P1', '/admin/nps/page.tsx'],
  ['Referral program: code generation', 'Per-firm referral code', 'P1', 'lib/referral.ts'],
  ['Referral program: tracking', 'Track conversions', 'P1', 'DB: referrals table'],
  ['Referral program: rewards', '1 m-c gratis per polecone', 'P1', 'workers/referral-reward.mjs'],
  ['Loyalty: 12-month milestone', 'Auto-upgrade reward', 'P2', 'workers/loyalty.mjs'],
  ['Win-back: 30-day inactive', 'Email sequence', 'P1', 'workers/winback.mjs'],
  ['Win-back: 90-day churned', 'Special offer', 'P2', 'workers/winback.mjs'],
  ['Heatmap: top 5 pages', 'PostHog session recording', 'P1', 'PostHog'],
  ['Funnel analysis: zapytanie flow', 'Drop-off per step', 'P0', 'PostHog'],
  ['Funnel analysis: booking flow', 'Drop-off per step', 'P0', 'PostHog'],
  ['Customer.io integration', 'Behavioral emails', 'P2', 'lib/customer-io.ts'],
  ['Customer segmentation', 'High-LTV vs Churn-risk', 'P1', 'DB views'],
  ['Promo codes system', 'Apply at checkout', 'P1', 'lib/promo.ts'],
  ['Limited-time offers', 'Banner + countdown', 'P2', 'components/PromoBanner.tsx'],
  ['Affiliate program', 'Track + pay 10% commission', 'P2', 'lib/affiliate.ts'],
  ['Onboarding email sequence', '5 emaile w 14 dni', 'P0', 'covered by content agent'],
  ['Activation milestones', 'Track first lead, first booking', 'P1', 'lib/milestones.ts'],
  ['Re-engagement campaigns', 'Dormant users', 'P2', 'workers/reengage.mjs'],
  ['Pricing page A/B test', '4 plans vs 3 plans', 'P2', 'PostHog'],
  ['Exit-intent popup', 'On /zapytanie before bounce', 'P2', 'components/ExitIntent.tsx'],
  ['Live chat (Crisp/Intercom)', 'Alternative to AI chat dla complex', 'P2', 'integrate'],
  ['In-app NPS triggers', 'After 5 leads', 'P1', 'lib/nps.ts'],
  ['Survey: feature requests', 'Quarterly', 'P2', 'workers/survey.mjs'],
  ['Survey: pricing willingness', 'Van Westendorp', 'P2', 'analysis'],
];

repeat('gtm', gtmTasks);
while (tasks.filter((t) => t.agent === 'gtm').length < 50) {
  const i = tasks.filter((t) => t.agent === 'gtm').length;
  add('gtm', `GTM polish #${i + 1}`, 'Tactical iterations, copy tests', 'P2', '');
}

// =================== AGENT 7 — SEARCH (80) ===================
const searchTasks = [
  ['Meilisearch: prod instance setup', 'Coolify deploy', 'P0', 'infra/coolify'],
  ['Meilisearch: master + admin keys', 'Generate + store w env', 'P0', '.env.production'],
  ['Meilisearch: index companies setup', 'Schema + settings', 'P0', 'workers/meili-init.mjs'],
  ['Meilisearch: index articles setup', 'Schema + settings', 'P0', 'workers/meili-init.mjs'],
  ['Meilisearch: index cities setup', 'Autocomplete', 'P0', 'workers/meili-init.mjs'],
  ['Meilisearch: trigger sync on company update', 'Supabase webhook → enqueue', 'P0', 'supabase/triggers.sql'],
  ['Meilisearch: trigger sync on review update', 'Update rating', 'P0', 'supabase/triggers.sql'],
  ['Meilisearch: sync worker production', 'BullMQ queue', 'P0', 'workers/meili-sync.mjs'],
  ['Meilisearch: backup snapshots daily', 'Auto-snapshot', 'P1', 'cron'],
  ['Geo search: PostGIS lat/lng index', 'CREATE INDEX USING gist', 'P0', 'supabase/schema.sql'],
  ['Geo search: _geo in Meilisearch', 'GeoPoint filter', 'P0', 'index settings'],
  ['Geo search: distance filter', '_geoRadius(lat, lng, 30000)', 'P0', '/api/search'],
  ['Geo search: sort by distance', '_geoPoint:asc', 'P0', '/api/search'],
  ['Geo search: "near me" geolocation', 'navigator.geolocation', 'P1', 'components/search/NearMe.tsx'],
  ['Autocomplete: search-as-you-type', 'debounced 200ms', 'P0', 'components/search/Autocomplete.tsx'],
  ['Autocomplete: highlight matches', '<mark> in results', 'P1', 'components/search/Autocomplete.tsx'],
  ['Autocomplete: recent searches', 'localStorage 10 last', 'P1', 'components/search/RecentSearches.tsx'],
  ['Autocomplete: popular searches', 'Top 10 z search_logs', 'P1', 'API /api/search/popular'],
  ['Autocomplete: keyboard nav', 'Arrow up/down + Enter', 'P1', 'components/search/Autocomplete.tsx'],
  ['Filter facets: rating range', '4★+ / 3★+ / All', 'P0', 'components/search/Filters.tsx'],
  ['Filter facets: budget range', 'Slider 0-15000 zł', 'P0', 'components/search/Filters.tsx'],
  ['Filter facets: services multi', 'Checkboxes', 'P0', 'components/search/Filters.tsx'],
  ['Filter facets: 24h availability', 'Boolean', 'P0', 'components/search/Filters.tsx'],
  ['Filter facets: verified only', 'Boolean', 'P0', 'components/search/Filters.tsx'],
  ['Filter facets: counts per facet', 'Number in brackets', 'P1', 'Meilisearch facets API'],
  ['Filter URL state', '?city=warszawa&rating=4', 'P0', 'useSearchParams'],
  ['Filter shareable links', 'Copy current filters URL', 'P1', 'components/search/ShareFilters.tsx'],
  ['Sort: relevance (default)', 'Already default', 'P0', 'config'],
  ['Sort: rating desc', 'rating:desc', 'P0', '/api/search'],
  ['Sort: price asc', 'priceFrom:asc', 'P0', '/api/search'],
  ['Sort: distance asc', '_geoPoint:asc', 'P0', '/api/search'],
  ['Sort: most reviewed', 'reviewsCount:desc', 'P1', '/api/search'],
  ['Sort: newest', 'createdAt:desc', 'P1', '/api/search'],
  ['Map view: Leaflet + OSM', 'Free + open', 'P1', 'components/search/MapView.tsx'],
  ['Map view: markers cluster', 'leaflet.markercluster', 'P1', 'components/search/MapView.tsx'],
  ['Map view: popup per marker', 'Mini-card preview', 'P1', 'components/search/MapView.tsx'],
  ['Map view: sync z list', 'Hover list → highlight marker', 'P1', 'lib/search/map-sync.ts'],
  ['Map view: voivodeship overlay', 'Boundaries SVG', 'P2', 'public/voivodeships.geojson'],
  ['Search analytics: log queries', 'INSERT into search_logs', 'P0', 'API /api/search'],
  ['Search analytics: zero-result rate', 'Dashboard widget', 'P0', '/admin/search-analytics'],
  ['Search analytics: top queries', 'Daily/weekly/monthly', 'P0', '/admin/search-analytics'],
  ['Search analytics: CTR per result', 'Track clicks → result position', 'P1', 'API /api/search/click'],
  ['Synonyms: 200+ par PL', 'Expanded synonyms dict', 'P0', 'index settings'],
  ['Synonyms: regional (Małopolska, Śląsk)', 'Lokalne nazewnictwo', 'P1', 'index settings'],
  ['Misspell correction: Levenshtein', 'Default Meili typo', 'P0', 'config'],
  ['Misspell correction: PL polish chars', 'Treat ą=a, ć=c', 'P1', 'tokenizer'],
  ['Stop words PL', 'Already added — verify list', 'P0', 'index settings'],
  ['Boost: verified companies', '+10 score', 'P0', 'ranking rules'],
  ['Boost: high rating (4.5+)', '+5 score', 'P1', 'ranking rules'],
  ['Boost: completed bookings count', 'Popularity', 'P2', 'custom ranking'],
  ['Personalization: prefer city of user', 'Session-based', 'P2', 'lib/search/personalize.ts'],
  ['Search history per user', 'For logged-in', 'P2', 'DB: user_search_history'],
  ['Saved searches', 'Email notify on new match', 'P2', 'workers/saved-searches.mjs'],
  ['Search recommendations', '"Inni szukali też"', 'P2', 'collab filtering'],
  ['Voice search', 'Web Speech API → query', 'P2', 'components/search/VoiceSearch.tsx'],
  ['Visual search (future)', 'Upload zdjęcie → match', 'P2', 'roadmap'],
  ['Search performance budget', 'p95 <100ms', 'P0', 'monitoring'],
  ['Search load test', 'k6 100 RPS', 'P1', 'covered by QA agent'],
  ['Search cache: Redis 60s TTL', 'For popular queries', 'P1', 'lib/search/cache.ts'],
  ['Search anti-abuse: rate limit', '60/min/IP', 'P0', 'middleware'],
  ['Search empty state: suggestions', 'Did you mean / popular', 'P0', 'components/search/EmptyResults.tsx'],
  ['Search SEO: indexable categories', 'Static + sitemap', 'P0', 'covered by SEO agent'],
  ['Search SEO: indexable cities', 'Static + sitemap', 'P0', 'covered by SEO agent'],
];

repeat('search', searchTasks);
while (tasks.filter((t) => t.agent === 'search').length < 80) {
  const i = tasks.filter((t) => t.agent === 'search').length;
  add('search', `Search polish #${i + 1}`, 'Query tuning, synonym improvements', 'P2', '');
}

// =================== AGENT 8 — MARKETPLACE (140) ===================
const marketplaceCalendar = [
  ['Calendar: availability schema', 'company_availability table', 'P0', 'supabase/schema.sql'],
  ['Calendar: block/unblock day', 'API /api/availability', 'P0', 'API'],
  ['Calendar: recurring blocks', 'Every Sunday closed etc.', 'P1', 'API'],
  ['Calendar: weekly schedule editor', '/panel-firmy/kalendarz UI', 'P0', 'page'],
  ['Calendar: month view', 'Grid 7×5', 'P0', 'components/calendar/MonthView.tsx'],
  ['Calendar: day view', 'Hour slots', 'P0', 'components/calendar/DayView.tsx'],
  ['Calendar: bookings overlay', 'Show existing bookings', 'P0', 'components/calendar/'],
  ['Calendar: conflict detection', 'Prevent overlap', 'P0', 'lib/calendar/conflicts.ts'],
  ['Calendar: timezone PL', 'Europe/Warsaw', 'P0', 'lib/calendar/tz.ts'],
  ['Calendar: realtime updates', 'Supabase Realtime channel', 'P1', 'hooks/useAvailability.ts'],
  ['Calendar: iCal export', 'Per company .ics feed', 'P1', 'API /api/companies/[slug]/calendar.ics'],
  ['Calendar: Google Calendar OAuth', 'Two-way sync', 'P2', 'lib/google-calendar.ts'],
  ['Calendar: Apple Calendar subscribe', 'webcal:// URL', 'P2', 'docs'],
  ['Calendar: Outlook integration', 'Microsoft Graph', 'P2', 'lib/outlook.ts'],
  ['Calendar: bulk import slots', 'CSV upload', 'P2', '/panel-firmy/kalendarz/import'],
];

const marketplaceBooking = [
  ['Booking: persist to Supabase', 'INSERT into bookings', 'P0', 'API /api/booking'],
  ['Booking: generate number FRMT', 'PP-YYYYMMDD-XXXX', 'P0', 'lib/booking/numbering.ts'],
  ['Booking: send email confirmation', 'Resend transactional', 'P0', 'workers/booking-email.mjs'],
  ['Booking: send SMS confirmation', 'SMSAPI 160 chars', 'P0', 'workers/booking-sms.mjs'],
  ['Booking: notify company email', 'Real-time alert', 'P0', 'workers/'],
  ['Booking: notify company SMS', 'If urgent', 'P0', 'workers/'],
  ['Booking: status workflow', 'new → confirmed → completed → reviewed', 'P0', 'DB state machine'],
  ['Booking: modify (date/time)', 'Edit before T-24h', 'P0', '/panel-rodziny/zapytania/[id]/edytuj'],
  ['Booking: cancel z reason', '/panel-rodziny/anuluj/[id]', 'P0', 'page + API'],
  ['Booking: refund logic', 'Per policy 14 dni', 'P1', 'lib/booking/refund.ts'],
  ['Booking: reminder 24h before', 'Email + SMS', 'P0', 'workers/reminder-24h.mjs'],
  ['Booking: reminder 1h before', 'SMS only', 'P0', 'workers/reminder-1h.mjs'],
  ['Booking: webhook to company', 'Per-company config URL', 'P1', 'lib/webhooks.ts'],
  ['Booking: attachment upload', 'Zdjęcia + dokumenty', 'P1', 'Supabase Storage'],
  ['Booking: post-completion follow-up', 'Recenzja request po 7 dni', 'P1', 'workers/review-request.mjs'],
  ['Booking: multi-step undo', 'Save draft + resume', 'P2', 'localStorage + DB'],
  ['Booking: copy from previous', '"Like last time" shortcut', 'P2', 'feature'],
  ['Booking: bulk for funeral home', 'Plan multiple usługi at once', 'P1', '/panel-firmy/new-booking-bulk'],
];

const marketplaceMessaging = [
  ['Messaging: schema messages + threads', 'DB tables', 'P0', 'supabase/schema.sql'],
  ['Messaging: send message API', 'POST /api/messages', 'P0', 'API'],
  ['Messaging: list threads API', 'GET /api/threads', 'P0', 'API'],
  ['Messaging: realtime channel', 'Supabase Realtime subscribe', 'P0', 'hooks/useMessages.ts'],
  ['Messaging: typing indicator', 'Presence channel', 'P1', 'hooks/useTyping.ts'],
  ['Messaging: read receipts', 'updated_at + read_at', 'P1', 'API'],
  ['Messaging: unread counter', 'Real-time badge', 'P1', 'components/MessagesBadge.tsx'],
  ['Messaging: attachments', 'File upload to Supabase Storage', 'P1', 'API'],
  ['Messaging: search w wątku', 'Filter messages w thread', 'P2', 'components/messaging/Search.tsx'],
  ['Messaging: archive thread', 'Hide from list', 'P2', 'API'],
  ['Messaging: report message', 'Flag for moderation', 'P1', 'API'],
  ['Messaging: anti-spam filter', 'Profanity + URL detection', 'P0', 'lib/messaging/filter.ts'],
  ['Messaging: notifications email', 'Daily digest if unread', 'P1', 'workers/messages-digest.mjs'],
  ['Messaging: push notifications', 'Web Push API', 'P1', 'lib/push.ts'],
  ['Messaging: emoji picker', 'Lazy load', 'P2', 'components/messaging/EmojiPicker.tsx'],
];

const marketplaceObituaries = [
  ['Obituary premium: payment flow', 'Stripe one-time 49 zł', 'P0', 'API /api/checkout/obituary'],
  ['Obituary premium: vanity URL', '/pamiec/[slug] alternative', 'P1', 'src/app/pamiec/[slug]/page.tsx'],
  ['Obituary premium: ad-free', 'No display ads even if free', 'P0', 'metadata flag'],
  ['Obituary premium: longer retention', 'forever vs 1 rok dla free', 'P0', 'cleanup cron'],
  ['Obituary: video embed', 'YouTube/Vimeo iframe', 'P1', 'components/obituary/VideoEmbed.tsx'],
  ['Obituary: photo gallery', 'Lightbox modal', 'P0', 'components/obituary/Gallery.tsx'],
  ['Obituary: map ceremony location', 'Leaflet mini-map', 'P1', 'components/obituary/CeremonyMap.tsx'],
  ['Obituary: light a candle (RSVP-style)', 'Add memory + name', 'P0', 'API /api/obituaries/[slug]/candles'],
  ['Obituary: condolences thread', 'Moderated comments', 'P0', 'API /api/obituaries/[slug]/condolences'],
  ['Obituary: condolence moderation', 'Admin approve queue', 'P0', '/admin/recenzje/kondolencje'],
  ['Obituary: share buttons', 'FB, WA, Email, Copy', 'P0', 'components/obituary/Share.tsx'],
  ['Obituary: privacy levels', 'Public / link-only / private', 'P1', 'DB field + UI'],
  ['Obituary: family memorial book', 'Print-ready PDF', 'P2', 'API /api/obituaries/[slug]/pdf'],
  ['Obituary: livestream link', 'External URL field', 'P1', 'profile field'],
  ['Obituary: charity donation link', 'In lieu of flowers', 'P1', 'profile field'],
  ['Obituary: timeline of life', 'Year-by-year events', 'P2', 'components/obituary/Timeline.tsx'],
  ['Obituary: audio tribute', 'Voice message upload', 'P2', 'feature'],
  ['Obituary: anniversary reminder', 'Annual email to family', 'P2', 'workers/anniversary.mjs'],
];

const marketplaceReviews = [
  ['Review: 5-step form', 'Rating + opis + plusy/minusy + zdjęcia + RODO', 'P0', '/panel-rodziny/recenzje/wystaw'],
  ['Review: verified badge', 'Linked to booking_id', 'P0', 'DB + UI'],
  ['Review: helpfulness votes', '👍 / 👎 per review', 'P1', 'API /api/reviews/[id]/vote'],
  ['Review: company response', '1 reply per review', 'P0', 'API /api/reviews/[id]/reply'],
  ['Review: photo upload', 'Up to 5 photos', 'P1', 'Supabase Storage'],
  ['Review: pros/cons fields', 'Structured plusy/minusy', 'P1', 'DB + UI'],
  ['Review: filter w profilu', '5★ / 4★ / 3★ / 2★ / 1★', 'P0', 'components/firma/ReviewFilters.tsx'],
  ['Review: sort', 'Najnowsze / Top / Critical', 'P0', 'components/firma/ReviewSort.tsx'],
  ['Review: anti-fake detection', 'Fingerprinting + behavioral', 'P0', 'lib/reviews/antifake.ts'],
  ['Review: flag for moderation', 'User reports', 'P0', 'API /api/reviews/[id]/flag'],
  ['Review: moderation queue', '/admin/recenzje/moderacja', 'P0', 'page'],
  ['Review: auto-flag toxic', 'Profanity + threats', 'P0', 'lib/moderation/toxicity.ts'],
  ['Review: edit window', '14 dni od wystawienia', 'P1', 'API'],
  ['Review: delete (RODO)', 'Right to be forgotten', 'P0', 'API + UI'],
  ['Review: aggregate rating recalc', 'Trigger on insert/update/delete', 'P0', 'supabase/triggers.sql'],
  ['Review: snippet for SEO', 'Quote in firma meta', 'P1', 'metadata'],
  ['Review: request email automation', '7 dni po booking', 'P0', 'workers/review-request.mjs'],
  ['Review: SMS reminder', 'Jeśli no email response', 'P1', 'workers/'],
  ['Review: rich snippet test', 'Google Rich Results valid', 'P0', 'covered by SEO'],
  ['Review: schema.org Review per item', 'JSON-LD', 'P0', 'lib/seo/json-ld.ts'],
];

const marketplaceLeads = [
  ['Lead: unlock flow Stripe', 'Pay 49 zł → reveal contact', 'P0', '/panel-firmy/leady/[id]/unlock'],
  ['Lead: routing algorithm v2', 'Score-based + load balancing', 'P0', 'lib/lead/routing.ts'],
  ['Lead: 3-companies suggestion', 'AI + rule-based hybrid', 'P0', 'API /api/lead/suggest'],
  ['Lead: company opt-out per city', 'Pause receiving leads', 'P1', 'DB + UI'],
  ['Lead: company quota', 'Plan-based limits', 'P0', 'lib/lead/quota.ts'],
  ['Lead: refund on no-show', 'Auto-refund jeśli ghosted', 'P1', 'workers/lead-noshow.mjs'],
  ['Lead: quality scoring', 'ML-ish: complete form, real phone', 'P0', 'lib/lead/scoring.ts'],
  ['Lead: duplicate detection', 'Same family, multi-submit', 'P1', 'lib/lead/dedup.ts'],
  ['Lead: assign manager', 'Per region team', 'P2', 'feature'],
  ['Lead: archive after 30 dni', 'Move to cold', 'P1', 'cron'],
  ['Lead: re-route if no response', 'After 2h → next company', 'P0', 'workers/lead-route-retry.mjs'],
  ['Lead: status sync (won/lost)', 'Firma updates → analytics', 'P0', 'API + UI'],
];

const marketplaceMisc = [
  ['Marketplace: 5 categories landing pages', 'Already done /marketplace + per-cat', 'P0', 'verify'],
  ['Marketplace: cross-category packages', '"Kompleksowo" deal', 'P1', '/marketplace/pakiety'],
  ['Marketplace: featured firms', 'Algorytm + slot for paid', 'P1', '/marketplace/wyrozniono'],
  ['Marketplace: new arrivals', 'Latest verified firms', 'P2', '/marketplace/nowe'],
  ['Marketplace: top rated', 'Best of week/month', 'P1', '/marketplace/najwyzej-oceniane'],
  ['Marketplace: compare 3 firms', 'Side-by-side feature matrix', 'P1', '/porownaj?ids=a,b,c'],
  ['Marketplace: save to favorites', 'Logged-in users', 'P2', 'DB: user_favorites'],
  ['Marketplace: recently viewed', 'Session + DB', 'P2', 'lib/recently-viewed.ts'],
];

repeat('marketplace', [
  ...marketplaceCalendar,
  ...marketplaceBooking,
  ...marketplaceMessaging,
  ...marketplaceObituaries,
  ...marketplaceReviews,
  ...marketplaceLeads,
  ...marketplaceMisc,
]);
while (tasks.filter((t) => t.agent === 'marketplace').length < 140) {
  const i = tasks.filter((t) => t.agent === 'marketplace').length;
  add('marketplace', `Marketplace polish #${i + 1}`, 'Edge cases, error handling', 'P2', '');
}

// =================== AGENT 9 — AI (90) ===================
const aiTasks = [
  ['AI: streaming responses (SSE)', 'EventStream from OpenAI', 'P0', 'API /api/ai/chat/stream'],
  ['AI: client-side SSE consumer', 'Update UI as tokens arrive', 'P0', 'components/ai/chat-widget'],
  ['AI: stop generation button', 'AbortController', 'P1', 'components/ai/chat-widget'],
  ['AI: regenerate response', 'Retry last user msg', 'P1', 'components/ai/chat-widget'],
  ['AI: multi-turn memory', 'ai_sessions + ai_messages tables', 'P0', 'supabase/schema'],
  ['AI: persist conversations', 'Save after each msg', 'P0', 'API /api/ai/chat'],
  ['AI: load conversation history', 'Resume on next visit', 'P1', 'API /api/ai/sessions/[id]'],
  ['AI: conversation list panel', 'Sidebar w widget', 'P2', 'components/ai/ConversationsList.tsx'],
  ['AI: pgvector extension', 'CREATE EXTENSION vector', 'P0', 'supabase/schema'],
  ['AI: embeddings table', 'document_embeddings', 'P0', 'supabase/schema'],
  ['AI: embedding generator worker', 'Articles + companies → vectors', 'P0', 'workers/embed.mjs'],
  ['AI: OpenAI embeddings API', 'text-embedding-3-small', 'P0', 'lib/ai/embeddings.ts'],
  ['AI: semantic search articles', 'Vector similarity', 'P1', 'API /api/search/semantic'],
  ['AI: RAG for chat', 'Retrieve top 3 articles + send to LLM', 'P0', 'lib/ai/rag.ts'],
  ['AI: function calling', 'Tools: search_companies, generate_obituary, calc_costs', 'P0', 'lib/ai/tools.ts'],
  ['AI: function generate_obituary', 'Returns markdown', 'P0', 'lib/ai/tools/obituary.ts'],
  ['AI: function search_companies', 'Calls /api/ai/match', 'P0', 'lib/ai/tools/match.ts'],
  ['AI: function calculate_costs', 'Returns cost estimate', 'P0', 'lib/ai/tools/calc.ts'],
  ['AI: function send_to_companies', 'Triggers /api/lead', 'P0', 'lib/ai/tools/lead.ts'],
  ['AI: voice input Web Speech API', 'Mic button → speech-to-text', 'P1', 'components/ai/VoiceInput.tsx'],
  ['AI: voice output (ElevenLabs)', 'Optional read responses', 'P2', 'components/ai/VoiceOutput.tsx'],
  ['AI: language detection', 'PL / EN / UA auto', 'P1', 'lib/ai/lang-detect.ts'],
  ['AI: prompt per language', 'Translated system prompts', 'P1', 'lib/ai/prompts.ts'],
  ['AI: Ukrainian welcome', 'UA prompts dla migrantów', 'P2', 'lib/ai/prompts-ua.ts'],
  ['AI: English fallback', 'For expats', 'P2', 'lib/ai/prompts-en.ts'],
  ['AI: sentiment detection', 'gniew/smutek → empathy mode', 'P0', 'lib/ai/sentiment.ts'],
  ['AI: crisis detection enhanced', 'NLP-based, not just keywords', 'P0', 'lib/ai/crisis.ts'],
  ['AI: human handoff', 'Escalate to support', 'P1', 'API /api/ai/handoff'],
  ['AI: cost tracking per session', 'Tokens × price', 'P0', 'lib/ai/cost.ts'],
  ['AI: cost dashboard admin', '/admin/ai-analytics', 'P1', 'page'],
  ['AI: rate limit per user', 'Daily quota', 'P0', 'lib/ai/quota.ts'],
  ['AI: model fallback', 'gpt-4o-mini → claude haiku if down', 'P1', 'lib/ai/fallback.ts'],
  ['AI: response caching', 'Common questions cached', 'P1', 'lib/ai/cache.ts'],
  ['AI: prompt injection prevention', 'Sanitize inputs', 'P0', 'lib/ai/security.ts'],
  ['AI: PII redaction', 'Remove phone/email from logs', 'P0', 'lib/ai/pii.ts'],
  ['AI: feedback thumbs up/down', 'Per response', 'P0', 'API /api/ai/feedback'],
  ['AI: feedback analytics', 'Identify bad responses', 'P1', '/admin/ai-feedback'],
  ['AI: A/B test prompts', 'Variant per session', 'P2', 'lib/ai/ab-prompts.ts'],
  ['AI: chain-of-thought option', 'Internal reasoning', 'P2', 'lib/ai/cot.ts'],
  ['AI: chat widget themes', 'Light / dark / brand', 'P1', 'components/ai/ChatWidget'],
  ['AI: chat widget position', 'Bottom-right / inline', 'P1', 'props'],
  ['AI: chat widget on /firma profile', 'Pre-fill firma context', 'P1', 'props'],
  ['AI: AI-powered match suggestions', 'Beyond rule-based', 'P1', 'lib/ai/match-enhanced.ts'],
  ['AI: smart form pre-fill', 'Suggest from previous data', 'P2', 'components/forms/AIPreFill.tsx'],
  ['AI: image generation (dezery)', 'Memorial collage from photos', 'P3', 'feature roadmap'],
  ['AI: video generation', 'Tribute video from photos + audio', 'P3', 'feature roadmap'],
  ['AI: SEO meta generator', 'Auto-meta for new content', 'P2', 'lib/ai/seo-gen.ts'],
  ['AI: review summary', '"Co mówią klienci" summary', 'P1', 'API /api/firma/[slug]/review-summary'],
  ['AI: FAQ generator per firma', 'Auto-FAQ from profile', 'P1', 'lib/ai/faq-gen.ts'],
  ['AI: dark mode chat UI', 'CSS variables', 'P2', 'components/ai/ChatWidget'],
  ['AI: chat export PDF', 'Save conversation', 'P2', 'API /api/ai/export-pdf'],
  ['AI: legal disclaimer', '"Not legal advice"', 'P0', 'components/ai/Disclaimer.tsx'],
  ['AI: GDPR export per session', 'Download my chat data', 'P0', 'API /api/ai/me/export'],
];

repeat('ai', aiTasks);
while (tasks.filter((t) => t.agent === 'ai').length < 90) {
  const i = tasks.filter((t) => t.agent === 'ai').length;
  add('ai', `AI polish #${i + 1}`, 'Prompt tuning, response quality', 'P2', '');
}

// =================== AGENT 10 — DEVOPS (110) ===================
const devopsSecurity = [
  ['Next.js CSP headers', 'next.config.mjs headers()', 'P0', 'next.config.mjs'],
  ['Next.js HSTS header', 'max-age=63072000; includeSubDomains; preload', 'P0', 'next.config.mjs'],
  ['Next.js X-Frame-Options DENY', 'Prevent clickjacking', 'P0', 'next.config.mjs'],
  ['Next.js X-Content-Type-Options', 'nosniff', 'P0', 'next.config.mjs'],
  ['Next.js Referrer-Policy', 'strict-origin-when-cross-origin', 'P0', 'next.config.mjs'],
  ['Next.js Permissions-Policy', 'Disable unused features', 'P0', 'next.config.mjs'],
  ['Upstash Redis setup', 'Production rate limiting', 'P0', 'lib/redis.ts'],
  ['Cloudflare Turnstile keys', 'Site key + secret', 'P0', '.env.production'],
  ['Cloudflare Bot Fight Mode', 'Enable w panelu', 'P0', 'Cloudflare config'],
  ['Cloudflare WAF rules', 'OWASP managed rules', 'P0', 'Cloudflare config'],
  ['Cloudflare Rate Limiting rules', 'Per-IP limits', 'P0', 'Cloudflare config'],
  ['Cloudflare Page Rules', 'Cache static + bypass dynamic', 'P0', 'Cloudflare config'],
  ['Cloudflare SSL: Full Strict', 'Verify origin cert', 'P0', 'Cloudflare config'],
  ['Cloudflare DNSSEC enable', 'Authoritative DNS sec', 'P1', 'Cloudflare config'],
  ['Container security scan: Trivy', 'In CI per image', 'P0', '.github/workflows/security.yml'],
  ['Dependency vulnerability scan', 'npm audit + Snyk', 'P0', '.github/workflows/security.yml'],
  ['Secrets scan: gitleaks', 'In CI', 'P0', '.github/workflows/security.yml'],
  ['SAST: CodeQL', 'GitHub native', 'P1', '.github/workflows/codeql.yml'],
  ['Penetration test: OWASP Top 10', 'External firm Q1', 'P0', 'docs/pentest-plan.md'],
  ['2FA enforcement: admin role', 'Require TOTP for admins', 'P0', 'middleware'],
  ['Secrets rotation procedure', 'Quarterly + on breach', 'P0', 'docs/secrets-rotation.md'],
  ['Secrets vault: Doppler or Vault', 'Production secrets mgmt', 'P1', 'infra'],
  ['DKIM/SPF/DMARC verify', 'For polskiepogrzeby.pl', 'P0', 'DNS config'],
  ['Email DMARC report monitoring', 'Postmark or own', 'P1', 'integration'],
  ['Backup encryption at rest', 'AES-256', 'P0', 'MinIO config'],
  ['Backup encryption in transit', 'TLS', 'P0', 'config'],
];

const devopsMonitoring = [
  ['Sentry: errors integration', 'Frontend + backend', 'P0', '@sentry/nextjs'],
  ['Sentry: performance', 'Tracing + slow queries', 'P0', 'config'],
  ['Sentry: sourcemaps upload', 'In CI', 'P0', 'sentry-cli'],
  ['Sentry: release tracking', 'Per deploy version', 'P0', 'CI'],
  ['Sentry: alerts rules', 'Slack on critical', 'P0', 'Sentry UI'],
  ['Sentry: user context', 'PII safe', 'P0', 'lib/sentry.ts'],
  ['Grafana: dashboard "app"', 'Latency, throughput, errors', 'P1', 'infra/grafana/dashboards/'],
  ['Grafana: dashboard "postgres"', 'Queries, connections, locks', 'P1', 'infra/grafana/dashboards/'],
  ['Grafana: dashboard "meilisearch"', 'Index size, search latency', 'P1', 'infra/grafana/dashboards/'],
  ['Grafana: dashboard "redis"', 'Memory, hit rate', 'P1', 'infra/grafana/dashboards/'],
  ['Grafana: dashboard "business"', 'Leads, bookings, revenue', 'P1', 'infra/grafana/dashboards/'],
  ['Prometheus: scrape config', 'All services exposed metrics', 'P1', 'infra/prometheus.yml'],
  ['Loki: log aggregation', 'All containers → Loki', 'P1', 'docker-compose'],
  ['Loki: log retention 30 dni', 'Config policy', 'P1', 'loki config'],
  ['Uptime Kuma: monitors 10', 'All critical endpoints', 'P0', 'Uptime Kuma UI'],
  ['Uptime Kuma: PagerDuty escalation', 'P0 calls', 'P1', 'integration'],
  ['Uptime Kuma: status page public', 'status.polskiepogrzeby.pl', 'P0', 'config'],
  ['Real User Monitoring (RUM)', 'web-vitals → Plausible custom events', 'P1', 'lib/rum.ts'],
  ['Synthetic monitoring', 'Checkly hourly E2E', 'P2', 'Checkly setup'],
  ['Log alerts: 5xx rate >5%', 'Loki alerts', 'P0', 'Loki rules'],
  ['Log alerts: critical errors', 'Sentry filter rules', 'P0', 'Sentry UI'],
  ['Slow query detector', 'pg_stat_statements', 'P1', 'pg_extension'],
  ['Connection pool monitoring', 'PgBouncer stats', 'P1', 'integration'],
  ['Disk usage alerts >80%', 'Server-level monitoring', 'P0', 'Node Exporter'],
  ['Memory alerts >85%', 'Per-container', 'P0', 'cAdvisor'],
];

const devopsBackup = [
  ['Backup Postgres: daily 03:00', 'pg_dump → MinIO', 'P0', 'cron'],
  ['Backup Postgres: weekly offsite', 'Backblaze B2 sync', 'P0', 'cron + rclone'],
  ['Backup MinIO: weekly snapshot', 'Mirror to B2', 'P0', 'cron'],
  ['Backup Meilisearch: daily', 'Dump → MinIO', 'P0', 'cron'],
  ['Backup retention policy', '7 daily + 4 weekly + 6 monthly', 'P0', 'docs'],
  ['Backup encryption', 'GPG before upload', 'P0', 'cron script'],
  ['Backup verify: auto-restore test', 'Weekly fresh container', 'P0', 'workflows/backup-test.yml'],
  ['Backup alerting: failure notify', 'PagerDuty on missed', 'P0', 'monitoring'],
  ['DR runbook', 'Step-by-step recovery', 'P0', 'docs/disaster-recovery.md'],
  ['DR test: quarterly', 'Full restore drill', 'P0', 'runbook'],
  ['RTO target: <1h', 'Measured in drill', 'P0', 'docs'],
  ['RPO target: <24h', 'Backup frequency', 'P0', 'docs'],
  ['Multi-region read replicas', 'Optional for HA', 'P2', 'infra'],
  ['Database failover', 'Patroni or pg auto', 'P2', 'infra'],
];

const devopsCI = [
  ['CI: typecheck', 'tsc --noEmit', 'P0', 'workflows/ci.yml'],
  ['CI: lint', 'ESLint + Prettier check', 'P0', 'workflows/ci.yml'],
  ['CI: build', 'next build', 'P0', 'workflows/ci.yml'],
  ['CI: test unit', 'vitest run', 'P0', 'workflows/ci.yml'],
  ['CI: test integration', 'API tests', 'P0', 'workflows/ci.yml'],
  ['CI: test E2E', 'Playwright headless', 'P0', 'workflows/ci-e2e.yml'],
  ['CI: bundle size check', 'size-limit', 'P1', 'workflows/'],
  ['CI: Lighthouse score check', 'Min 90 perf', 'P1', 'workflows/'],
  ['CI: deploy on push main', 'Coolify webhook', 'P0', 'workflows/'],
  ['CI: preview on PR', 'Coolify preview env', 'P1', 'workflows/'],
  ['CI: cache deps', 'Cache node_modules', 'P0', 'workflows/'],
  ['CI: matrix Node 22 + 20', 'Future-proof', 'P2', 'workflows/'],
  ['Pre-commit hooks', 'husky + lint-staged', 'P1', '.husky/'],
  ['Commit message lint', 'commitlint + conventional', 'P1', 'commitlint.config'],
  ['Branch protection rules', 'Require PR review + CI pass', 'P0', 'GitHub settings'],
  ['Auto-merge dependabot', 'Patch updates only', 'P2', 'workflows/'],
  ['Renovate config', 'Better deps mgmt', 'P2', 'renovate.json'],
];

const devopsLoad = [
  ['k6: smoke test 1 RPS', 'Sanity check', 'P0', 'tests/load/smoke.js'],
  ['k6: average load 50 RPS', 'Steady state', 'P0', 'tests/load/average.js'],
  ['k6: stress 500 RPS', 'Find breaking point', 'P0', 'tests/load/stress.js'],
  ['k6: spike 1000 RPS', 'Sudden surge', 'P0', 'tests/load/spike.js'],
  ['k6: soak 12h at 50 RPS', 'Memory leaks?', 'P1', 'tests/load/soak.js'],
  ['k6: API /lead 100 RPS', 'Form submissions', 'P0', 'tests/load/lead.js'],
  ['k6: API /search 200 RPS', 'Heavy search', 'P0', 'tests/load/search.js'],
  ['k6: results dashboard', 'Grafana visualization', 'P1', 'integration'],
];

const devopsMisc = [
  ['Cloudflare R2 alternative to MinIO', 'Lower cost option', 'P2', 'infra/r2.md'],
  ['Cloudflare Workers edge functions', 'For low-latency', 'P2', 'workers/'],
  ['Edge runtime opt-in', 'Some routes', 'P2', 'runtime config'],
  ['Image CDN Cloudflare Images', 'Alternative', 'P2', 'infra'],
  ['Database connection pooling', 'PgBouncer config', 'P0', 'docker-compose'],
  ['Connection limit raise', '200 max_connections', 'P0', 'postgres config'],
  ['Statement timeout', '30s default', 'P0', 'postgres config'],
  ['Vacuum + analyze schedule', 'autovacuum tuning', 'P1', 'postgres config'],
  ['Index audit', 'Find unused, missing', 'P1', 'pg_stat_user_indexes'],
  ['Query performance audit', 'EXPLAIN slow queries', 'P0', 'pg_stat_statements'],
  ['Subdomain setup', 'api/admin/status', 'P1', 'DNS'],
  ['Email subdomain', 'mail.polskiepogrzeby.pl', 'P0', 'DNS + Resend'],
  ['Status page Cachet/Statuspage.io', 'Public incident comms', 'P1', 'integration'],
];

repeat('devops', [...devopsSecurity, ...devopsMonitoring, ...devopsBackup, ...devopsCI, ...devopsLoad, ...devopsMisc]);
while (tasks.filter((t) => t.agent === 'devops').length < 110) {
  const i = tasks.filter((t) => t.agent === 'devops').length;
  add('devops', `DevOps polish #${i + 1}`, 'Infra hardening, cost optimization', 'P2', '');
}

// =================== AGENT 11 — QA (60) ===================
const qaTasks = [
  ['Vitest config + setup', 'vitest.config.ts', 'P0', 'config'],
  ['Vitest: test articles.ts', 'parseFrontmatter, getArticle, renderMarkdown', 'P0', 'tests/lib/articles.test.ts'],
  ['Vitest: test json-ld.ts', 'All schema generators', 'P0', 'tests/lib/json-ld.test.ts'],
  ['Vitest: test marketplace/categories.ts', 'Config integrity', 'P0', 'tests/lib/categories.test.ts'],
  ['Vitest: test ai/prompts.ts', 'Crisis detection, off-topic', 'P0', 'tests/lib/prompts.test.ts'],
  ['Vitest: test search/meilisearch.ts', 'Mock fallback works', 'P0', 'tests/lib/meilisearch.test.ts'],
  ['Vitest: test seo/sitemap', 'URL generation', 'P0', 'tests/lib/sitemap.test.ts'],
  ['Vitest: test security/ratelimit', 'Increments + resets', 'P0', 'tests/lib/ratelimit.test.ts'],
  ['Vitest: test billing/numbering', 'Invoice number format', 'P0', 'tests/lib/numbering.test.ts'],
  ['Vitest: test booking/conflicts', 'Overlap detection', 'P0', 'tests/lib/conflicts.test.ts'],
  ['Vitest: 80% coverage gate', 'fail CI if below', 'P1', 'vitest.config'],
  ['Integration: API /api/lead', 'Valid + invalid + RODO', 'P0', 'tests/api/lead.test.ts'],
  ['Integration: API /api/claim', 'NIP checksum', 'P0', 'tests/api/claim.test.ts'],
  ['Integration: API /api/booking', 'All validation paths', 'P0', 'tests/api/booking.test.ts'],
  ['Integration: API /api/search', 'Filters + sort', 'P0', 'tests/api/search.test.ts'],
  ['Integration: API /api/ai/chat', 'Crisis + mock mode', 'P0', 'tests/api/ai-chat.test.ts'],
  ['Integration: API /api/ai/match', 'Scoring logic', 'P0', 'tests/api/ai-match.test.ts'],
  ['Integration: API /api/health', '200 OK', 'P0', 'tests/api/health.test.ts'],
  ['Integration: API /api/stripe-webhook', 'Signature verify', 'P0', 'tests/api/stripe.test.ts'],
  ['Integration: API /api/reviews/verify', 'Token + spam', 'P0', 'tests/api/reviews.test.ts'],
  ['Playwright config', 'playwright.config.ts', 'P0', 'config'],
  ['E2E: visitor → /', 'Homepage loads', 'P0', 'tests/e2e/home.spec.ts'],
  ['E2E: visitor → /firma/[slug]', 'Company profile', 'P0', 'tests/e2e/firma.spec.ts'],
  ['E2E: visitor → /zapytanie → submit', 'Lead flow happy path', 'P0', 'tests/e2e/lead-flow.spec.ts'],
  ['E2E: visitor → /zapytanie → invalid', 'Validation errors', 'P0', 'tests/e2e/lead-invalid.spec.ts'],
  ['E2E: visitor → /szukaj', 'Search + filters', 'P0', 'tests/e2e/search.spec.ts'],
  ['E2E: visitor → /rezerwacja/[cat] → submit', 'Booking happy path', 'P0', 'tests/e2e/booking.spec.ts'],
  ['E2E: visitor → /kalkulator', 'Cost calculator', 'P1', 'tests/e2e/calc.spec.ts'],
  ['E2E: visitor → /poradnik/[slug]', 'Article reads', 'P1', 'tests/e2e/article.spec.ts'],
  ['E2E: visitor → /marketplace', 'Categories grid', 'P1', 'tests/e2e/marketplace.spec.ts'],
  ['E2E: user → register → verify → login', 'Full auth flow', 'P0', 'tests/e2e/auth.spec.ts'],
  ['E2E: company → claim profile', 'NIP verification', 'P0', 'tests/e2e/claim.spec.ts'],
  ['E2E: company → unlock lead', 'Stripe sandbox', 'P0', 'tests/e2e/unlock.spec.ts'],
  ['E2E: family → leave review', '5-step form', 'P0', 'tests/e2e/review.spec.ts'],
  ['E2E: AI chat → basic conversation', 'Mock mode', 'P0', 'tests/e2e/ai-chat.spec.ts'],
  ['E2E: AI chat → crisis detection', 'Safety response', 'P0', 'tests/e2e/ai-crisis.spec.ts'],
  ['E2E: admin → moderate review', 'Approve/reject', 'P0', 'tests/e2e/admin-moderate.spec.ts'],
  ['Accessibility: axe-core in Playwright', '0 violations per page', 'P0', 'tests/a11y/'],
  ['Accessibility: keyboard-only nav test', 'All paths reachable', 'P0', 'tests/a11y/keyboard.spec.ts'],
  ['Accessibility: screen reader test', 'VoiceOver/NVDA paths', 'P1', 'manual + doc'],
  ['Visual regression: Percy/Chromatic', 'Top 20 pages snapshot', 'P1', 'config + workflow'],
  ['Visual regression: PR diff bot', 'Auto-comment diffs', 'P1', 'workflows/'],
  ['Mutation testing: Stryker', 'Catch ineffective tests', 'P2', 'stryker.conf'],
  ['Snapshot testing UI components', 'jsdom + vitest', 'P1', 'tests/components/'],
  ['Test factory: TestUser/TestCompany', 'DRY test data', 'P0', 'tests/factories/'],
  ['Test factory: TestLead/TestBooking', 'DRY test data', 'P0', 'tests/factories/'],
  ['MSW mocks: Stripe API', 'For local tests', 'P0', 'tests/mocks/stripe.ts'],
  ['MSW mocks: OpenAI API', 'For local tests', 'P0', 'tests/mocks/openai.ts'],
  ['MSW mocks: Resend API', 'For local tests', 'P0', 'tests/mocks/resend.ts'],
  ['MSW mocks: SMSAPI', 'For local tests', 'P0', 'tests/mocks/smsapi.ts'],
  ['Test DB setup script', 'Fresh DB per test run', 'P0', 'tests/setup-db.ts'],
  ['Test data seeding', 'Reusable seeds for E2E', 'P0', 'tests/fixtures/'],
  ['Coverage badge in README', 'codecov.io', 'P1', 'README.md'],
  ['Performance test: WebPageTest API', 'Scheduled runs', 'P2', 'workflows/'],
  ['Smoke tests on prod', 'After deploy verify critical', 'P0', 'workflows/post-deploy-smoke.yml'],
];

repeat('qa', qaTasks);
while (tasks.filter((t) => t.agent === 'qa').length < 60) {
  const i = tasks.filter((t) => t.agent === 'qa').length;
  add('qa', `QA polish #${i + 1}`, 'Edge cases, flaky test fixes', 'P2', '');
}

// =================== CAP TO 1000 + RENUMBER ===================
const LIMITS = {
  builder: 170, designer: 90, content: 70, outreach: 50, seo: 90,
  gtm: 50, search: 80, marketplace: 140, ai: 90, devops: 110, qa: 60,
};

const capped = [];
const seen = Object.fromEntries(Object.keys(LIMITS).map((k) => [k, 0]));
for (const t of tasks) {
  if (seen[t.agent] < LIMITS[t.agent]) {
    capped.push(t);
    seen[t.agent]++;
  }
}
capped.forEach((t, i) => { t.id = `T3-${String(i + 1).padStart(4, '0')}`; });
tasks.length = 0;
tasks.push(...capped);

const counts = Object.fromEntries(
  Object.keys(LIMITS).map((k) => [k, tasks.filter((t) => t.agent === k).length])
);

const out = {
  generatedAt: new Date().toISOString(),
  phase: 3,
  description: 'Phase 3 — Path to Production. 1000 tasks across 11 agents.',
  total: tasks.length,
  counts,
  tasks,
};

const outPath = resolve(process.cwd(), 'src/lib/tasks-plan-v3.json');
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Generated Phase 3 tasks:', tasks.length);
console.log('Distribution:', counts);
console.log('Written to', outPath);
