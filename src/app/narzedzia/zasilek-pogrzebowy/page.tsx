import type { Metadata } from 'next';
import ZasilekPogrzebowyClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  softwareApplicationJsonLd,
  faqJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Zasiłek pogrzebowy ZUS 2026 — kalkulator | PolskiePogrzeby.pl',
  description:
    'Sprawdź, czy przysługuje Ci zasiłek pogrzebowy z ZUS (4 000 zł). Wymagane dokumenty, terminy, wniosek Z-12. Dla rodziny i spoza rodziny.',
  alternates: { canonical: '/narzedzia/zasilek-pogrzebowy' },
  openGraph: {
    title: 'Zasiłek pogrzebowy ZUS 2026',
    description: 'Sprawdź czy przysługuje Ci zasiłek 4 000 zł.',
    url: '/narzedzia/zasilek-pogrzebowy',
    type: 'website',
  },
};

const FAQ = [
  {
    question: 'Ile wynosi zasiłek pogrzebowy w 2026 roku?',
    answer:
      'Zasiłek pogrzebowy z ZUS wynosi 4 000 zł i jest to kwota ryczałtowa, niezmienna od 2011 roku. Wniosek o zasiłek można złożyć w terminie 12 miesięcy od dnia śmierci.',
  },
  {
    question: 'Kto może otrzymać zasiłek pogrzebowy ZUS?',
    answer:
      'Zasiłek przysługuje członkom rodziny zmarłego (małżonek, dzieci, rodzice, rodzeństwo) oraz innym osobom, które pokryły koszty pogrzebu (w tym pracodawcy, gminie, zakładowi pogrzebowemu) — w tym drugim przypadku do wysokości udokumentowanych kosztów.',
  },
  {
    question: 'Jakie dokumenty są potrzebne do wniosku?',
    answer:
      'Wniosek ZUS Z-12, skrócony odpis aktu zgonu, oryginały rachunków/faktur potwierdzających poniesione koszty pogrzebu, dowód osobisty wnioskodawcy, dokument potwierdzający pokrewieństwo.',
  },
  {
    question: 'Jak długo czeka się na wypłatę zasiłku?',
    answer:
      'ZUS ma 30 dni na rozpatrzenie wniosku i wypłatę zasiłku. Najszybciej (zazwyczaj w 7–14 dni) zasiłek jest wypłacany, gdy wniosek złoży bezpośrednio zakład pogrzebowy działający w imieniu rodziny.',
  },
];

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Zasiłek pogrzebowy ZUS — kalkulator',
    description:
      'Sprawdź uprawnienia do zasiłku pogrzebowego ZUS 4 000 zł, wymagane dokumenty i terminy.',
    url: '/narzedzia/zasilek-pogrzebowy',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Zasiłek pogrzebowy ZUS', url: '/narzedzia/zasilek-pogrzebowy' },
    ],
  }),
  softwareApplicationJsonLd({
    name: 'Kalkulator zasiłku pogrzebowego ZUS',
    description: 'Sprawdź, czy przysługuje Ci zasiłek pogrzebowy z ZUS w wysokości 4 000 zł.',
    url: '/narzedzia/zasilek-pogrzebowy',
    applicationCategory: 'FinanceApplication',
  }),
  faqJsonLd(FAQ),
);

export default function Page() {
  return (
    <div className="bg-cream">
      <JsonLd data={jsonLd} />
      <div className="container-page pt-6">
        <Breadcrumbs
          items={[
            { name: 'Narzędzia', url: '/narzedzia' },
            { name: 'Zasiłek pogrzebowy ZUS', url: '/narzedzia/zasilek-pogrzebowy' },
          ]}
        />
      </div>
      <ZasilekPogrzebowyClient />
    </div>
  );
}
