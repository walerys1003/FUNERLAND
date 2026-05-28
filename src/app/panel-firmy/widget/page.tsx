import Link from 'next/link';
import { Lock, Code2, Sparkles, Copy, Eye, CheckCircle2 } from 'lucide-react';
import { getServerUser, getUserCompanies, AUTH_CONFIGURED } from '@/lib/auth/session';
import { companies as ALL_COMPANIES } from '@/lib/data';
import { generateWidgetToken, buildEmbedSnippet, buildIframeSnippet, type WidgetVariant } from '@/lib/widget/token';
import WidgetGenerator from './widget-generator';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Widget dla strony — Panel firmy' };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

const VARIANTS: { key: WidgetVariant; label: string; description: string }[] = [
  { key: 'card', label: 'Karta', description: 'Pełna karta z logo, oceną i przyciskami CTA. Polecane dla strony "Kontakt".' },
  { key: 'banner', label: 'Banner', description: 'Wąski poziomy banner z CTA. Idealne do stopki lub paska bocznego.' },
  { key: 'compact', label: 'Kompaktowy', description: 'Minimalna wersja — nazwa + ocena + link. Pasuje wszędzie.' },
  { key: 'reviews', label: 'Opinie', description: 'Karta z ostatnimi opiniami klientów. Buduje zaufanie.' },
];

export default async function PanelWidgetPage() {
  // Resolve company
  const user = AUTH_CONFIGURED ? await getServerUser() : null;
  const userCompanies = AUTH_CONFIGURED ? await getUserCompanies() : [];
  const firstUserCompany = userCompanies[0];
  // Lookup full company record (with plan, features etc.) from seed data using slug
  const ownedFull = firstUserCompany
    ? ALL_COMPANIES.find((c) => c.slug === firstUserCompany.slug)
    : undefined;
  const demoCompany = ALL_COMPANIES.find((c) => c.plan === 'premium') || ALL_COMPANIES[0];
  const company = ownedFull || demoCompany;

  const isPremium = company.plan === 'premium';

  // Generate tokens for each variant — even when not premium, used in preview
  const tokensByVariant = VARIANTS.reduce<Record<string, string>>((acc, v) => {
    acc[v.key] = generateWidgetToken({ companySlug: company.slug, variant: v.key });
    return acc;
  }, {});

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] md:text-[32px] text-navy leading-tight">
            Widget dla strony WWW
          </h1>
          <p className="text-text-secondary text-[13.5px] mt-2 max-w-2xl">
            Wklej fragment kodu na własną stronę i pokaż klientom oceny oraz weryfikację z
            PolskiePogrzeby.pl. Klikalna karta przenosi do Państwa profilu — buduje zaufanie
            i przekierowuje ruch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Plan Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3 h-3" /> Wymagany plan Premium
            </span>
          )}
        </div>
      </div>

      {!isPremium && (
        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-[18px] text-navy">Funkcja Premium</h2>
              <p className="text-[13.5px] text-text-secondary mt-1">
                Embeddable widget jest dostępny w planie <strong>Premium</strong>. Otrzymują
                Państwo długoterminowy token, możliwość ograniczenia domen, statystyki kliknięć
                oraz 4 warianty wizualne. Aktualny plan: <strong>{company.plan}</strong>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/cennik"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-navy text-white rounded-lg text-[13px] font-medium hover:bg-navy-deep"
                >
                  Sprawdź plan Premium →
                </Link>
                <Link
                  href="/panel-firmy"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white text-navy border border-stone-300 rounded-lg text-[13px] font-medium hover:bg-stone-50"
                >
                  Wróć do pulpitu
                </Link>
              </div>
              <p className="text-[11.5px] text-text-muted mt-3">
                Poniżej znajdą Państwo demo widgetów — można wypróbować jak będą wyglądać po
                aktywacji planu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generator UI — interactive client component */}
      <div className={`mt-8 ${!isPremium ? 'opacity-90 pointer-events-auto' : ''}`}>
        <WidgetGenerator
          companySlug={company.slug}
          companyName={company.name}
          baseUrl={SITE_URL}
          tokensByVariant={tokensByVariant}
          variants={VARIANTS}
          isPremium={isPremium}
        />
      </div>

      {/* Help section */}
      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-border-soft rounded-2xl p-5">
          <Code2 className="w-5 h-5 text-navy mb-2" />
          <h3 className="font-heading text-[14.5px] text-navy">Jak zainstalować?</h3>
          <ol className="text-[13px] text-text-secondary mt-2 space-y-1 list-decimal list-inside">
            <li>Wybierz wariant widgetu wyżej.</li>
            <li>Skopiuj fragment kodu (JS lub iframe).</li>
            <li>Wklej w sekcji &lt;body&gt; swojej strony.</li>
          </ol>
        </div>
        <div className="bg-white border border-border-soft rounded-2xl p-5">
          <Eye className="w-5 h-5 text-navy mb-2" />
          <h3 className="font-heading text-[14.5px] text-navy">Co widzą klienci?</h3>
          <p className="text-[13px] text-text-secondary mt-2">
            Ocena, liczba opinii, znaczek weryfikacji oraz przycisk prowadzący do profilu na
            PolskiePogrzeby.pl. Wszystko aktualizowane na bieżąco — nie trzeba ręcznie nic
            podmieniać.
          </p>
        </div>
        <div className="bg-white border border-border-soft rounded-2xl p-5">
          <Lock className="w-5 h-5 text-navy mb-2" />
          <h3 className="font-heading text-[14.5px] text-navy">Bezpieczeństwo</h3>
          <p className="text-[13px] text-text-secondary mt-2">
            Token jest podpisany kluczem HMAC-SHA256. W planie Premium można ograniczyć
            domeny, na których widget się załaduje (allowed_origins).
          </p>
        </div>
      </div>

      <div className="mt-8 text-[11px] text-text-muted">
        Konto: <strong>{user?.fullName || 'demo'}</strong> · Firma: <strong>{company.name}</strong> · Plan: <strong>{company.plan}</strong>
      </div>
    </div>
  );
}
