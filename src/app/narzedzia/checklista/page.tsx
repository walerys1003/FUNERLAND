import type { Metadata } from 'next';
import ChecklistClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  howToJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Checklista pogrzebowa — co robić krok po kroku | PolskiePogrzeby.pl',
  description:
    'Kompletna checklista organizacji pogrzebu: pierwsze 24h, formalności USC i ZUS, ceremonia, sprawy spadkowe. Drukuj lub udostępniaj.',
  alternates: { canonical: '/narzedzia/checklista' },
  openGraph: {
    title: 'Checklista pogrzebowa — krok po kroku',
    description: 'Pierwsze 24h, formalności, ceremonia, spadek.',
    url: '/narzedzia/checklista',
    type: 'website',
  },
};

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Checklista organizacji pogrzebu',
    description:
      'Kompletna lista zadań do wykonania krok po kroku — od pierwszych 24h aż po sprawy spadkowe.',
    url: '/narzedzia/checklista',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Checklista', url: '/narzedzia/checklista' },
    ],
  }),
  howToJsonLd({
    name: 'Jak zorganizować pogrzeb — checklista krok po kroku',
    description:
      'Pełna procedura organizacji pogrzebu w Polsce: pierwsze 24 godziny, formalności urzędowe, ceremonia i sprawy po pogrzebie.',
    totalTime: 'PT7D',
    url: '/narzedzia/checklista',
    supply: [
      'Karta zgonu (od lekarza)',
      'Dowód osobisty zmarłego',
      'Skrócony odpis aktu zgonu (USC)',
      'Dokumenty potwierdzające pokrewieństwo',
    ],
    steps: [
      { name: 'Pierwsze 24 godziny', text: 'Stwierdzenie zgonu przez lekarza, transport ciała, wybór zakładu pogrzebowego.' },
      { name: 'Formalności urzędowe', text: 'USC — uzyskanie aktu zgonu, ZUS — wniosek o zasiłek pogrzebowy 4 000 zł.' },
      { name: 'Organizacja ceremonii', text: 'Wybór miejsca pochówku, trumny lub urny, kwiatów, mowy pożegnalnej, daty i godziny.' },
      { name: 'Ceremonia', text: 'Msza/uroczystość świecka, kondukt, pochówek lub kremacja, stypa.' },
      { name: 'Sprawy po pogrzebie', text: 'Spadek (notariusz lub sąd), zamknięcie rachunków, anulowanie dokumentów, decyzje dotyczące grobu.' },
    ],
  }),
);

export default function Page() {
  return (
    <div className="bg-cream">
      <JsonLd data={jsonLd} />
      <div className="container-page pt-6 print:hidden">
        <Breadcrumbs
          items={[
            { name: 'Narzędzia', url: '/narzedzia' },
            { name: 'Checklista', url: '/narzedzia/checklista' },
          ]}
        />
      </div>
      <ChecklistClient />
    </div>
  );
}
