import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Calculator,
  Banknote,
  PiggyBank,
  Scale,
  ListChecks,
  FileText,
  MessageSquareQuote,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Narzędzia i kalkulatory pogrzebowe | PolskiePogrzeby.pl',
  description:
    'Bezpłatne kalkulatory i narzędzia: koszt pogrzebu, zasiłek ZUS, kredyt, porównanie ofert, checklisty formalności. Wszystko, czego potrzebujesz w jednym miejscu.',
  alternates: { canonical: '/narzedzia' },
  openGraph: {
    title: 'Narzędzia i kalkulatory pogrzebowe',
    description: 'Bezpłatne narzędzia online — bez logowania, bez reklam.',
    url: '/narzedzia',
    type: 'website',
  },
};

const tools = [
  {
    href: '/narzedzia/koszt-pogrzebu',
    icon: Calculator,
    title: 'Kalkulator kosztu pogrzebu',
    description:
      'Oszacuj całkowity koszt pogrzebu na podstawie miasta, rodzaju ceremonii i wybranych usług.',
    time: '~2 min',
    badge: 'Popularne',
  },
  {
    href: '/narzedzia/zasilek-pogrzebowy',
    icon: Banknote,
    title: 'Kalkulator zasiłku pogrzebowego ZUS',
    description:
      'Sprawdź, czy przysługuje Ci zasiłek z ZUS (4 000 zł) i jakie dokumenty są potrzebne.',
    time: '~1 min',
  },
  {
    href: '/narzedzia/kredyt-pogrzebowy',
    icon: PiggyBank,
    title: 'Kalkulator rat / kredytu',
    description:
      'Oblicz miesięczną ratę kredytu na pokrycie kosztów pogrzebu — różne kwoty i okresy.',
    time: '~1 min',
  },
  {
    href: '/narzedzia/porownaj-oferty',
    icon: Scale,
    title: 'Porównywarka ofert',
    description:
      'Porównaj 2–3 oferty zakładów pogrzebowych — automatyczne ranking jakości i ceny.',
    time: '~3 min',
  },
  {
    href: '/narzedzia/checklista',
    icon: ListChecks,
    title: 'Checklista formalności',
    description:
      'Krok po kroku: co zrobić w pierwszych 24h, jakie dokumenty zebrać, gdzie się udać.',
    time: '~5 min',
    badge: 'Najważniejsze',
  },
  {
    href: '/narzedzia/dokumenty',
    icon: FileText,
    title: 'Generator dokumentów',
    description:
      'Wzory wniosków: odprawa pośmiertna, ZUS, oświadczenie spadkowe. Wypełnij i pobierz.',
    time: '~3 min',
  },
  {
    href: '/narzedzia/mowa-pogrzebowa',
    icon: MessageSquareQuote,
    title: 'Generator mowy pożegnalnej',
    description:
      'Pomoc w napisaniu kilku słów na ceremonii — religijnej, świeckiej lub osobistej.',
    time: '~5 min',
    badge: 'Nowość',
  },
];

export default function ToolsHubPage() {
  return (
    <div className="bg-cream min-h-[calc(100vh-68px)]">
      {/* Hero */}
      <section className="bg-navy text-white py-14 md:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-white/70 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Narzędzia
            </div>
            <h1 className="font-heading text-[36px] md:text-[48px] leading-tight">
              Bezpłatne kalkulatory i&nbsp;wzory dokumentów
            </h1>
            <p className="mt-4 text-[16px] text-white/85 leading-relaxed">
              Wszystko, czego potrzebujesz, by zorganizować pogrzeb — bez stresu, bez ukrytych
              kosztów. Każde narzędzie działa w&nbsp;Twojej przeglądarce, bez konieczności
              logowania.
            </p>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="py-12 md:py-16">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="card card-hover p-6 group focus:outline-none focus:ring-2 focus:ring-accent-green/40"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center">
                    <t.icon className="w-5 h-5" />
                  </div>
                  {t.badge && (
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-semibold uppercase tracking-wider">
                      {t.badge}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-heading text-[19px] leading-tight">{t.title}</h2>
                <p className="mt-2 text-[13.5px] text-text-secondary leading-relaxed">
                  {t.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-[12.5px]">
                  <span className="text-text-muted">{t.time}</span>
                  <span className="inline-flex items-center gap-1 text-accent-green font-semibold group-hover:gap-2 transition-all">
                    Otwórz <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="container-page max-w-3xl">
          <h2 className="font-heading text-[24px]">Najczęstsze pytania</h2>
          <div className="mt-5 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="text-accent-green group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] text-text-secondary leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const FAQ = [
  {
    q: 'Czy korzystanie z kalkulatorów jest płatne?',
    a: 'Nie. Wszystkie narzędzia są w 100% bezpłatne, bez konieczności logowania ani podawania danych kontaktowych. Działają lokalnie w Twojej przeglądarce.',
  },
  {
    q: 'Jak dokładne są wyceny?',
    a: 'Kalkulatory bazują na średnich cenach 2026 w Polsce i mnożnikach miejskich. Wynik traktuj jako szacunek — ostateczna cena zależy od konkretnej oferty zakładu pogrzebowego.',
  },
  {
    q: 'Czy mogę pobrać dokumenty w PDF?',
    a: 'Tak — każdy wygenerowany dokument można pobrać jako plik tekstowy lub wydrukować przez funkcję drukowania przeglądarki (Ctrl+P → "Zapisz jako PDF").',
  },
  {
    q: 'Skąd dane o zasiłku pogrzebowym?',
    a: 'Aktualne przepisy ZUS — kwota 4 000 zł obowiązuje od 2011 roku. Dla osób spoza rodziny kwota jest ograniczona do wysokości udokumentowanych kosztów.',
  },
];
