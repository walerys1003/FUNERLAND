import type { Metadata } from 'next';
import PorownajClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  softwareApplicationJsonLd,
  howToJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Porównywarka ofert pogrzebowych | PolskiePogrzeby.pl',
  description:
    'Porównaj 2–3 oferty zakładów pogrzebowych po jakości i cenie. Automatyczny ranking oparty na rzeczywistych parametrach.',
  alternates: { canonical: '/narzedzia/porownaj-oferty' },
  openGraph: {
    title: 'Porównywarka ofert pogrzebowych',
    description: 'Porównaj oferty — ranking jakości i ceny.',
    url: '/narzedzia/porownaj-oferty',
    type: 'website',
  },
};

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Porównywarka ofert pogrzebowych',
    description:
      'Wprowadź parametry 2–3 ofert zakładów pogrzebowych i otrzymaj automatyczny ranking jakości i ceny.',
    url: '/narzedzia/porownaj-oferty',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Porównywarka ofert', url: '/narzedzia/porownaj-oferty' },
    ],
  }),
  softwareApplicationJsonLd({
    name: 'Porównywarka ofert zakładów pogrzebowych',
    description:
      'Automatyczny ranking ofert: 40% cena + 40% jakość (opinie, weryfikacja) + 20% szybkość.',
    url: '/narzedzia/porownaj-oferty',
    applicationCategory: 'BusinessApplication',
  }),
  howToJsonLd({
    name: 'Jak porównać oferty zakładów pogrzebowych',
    description:
      'Krok po kroku: jak porównać 2–3 oferty i wybrać tę z najlepszym stosunkiem jakości do ceny.',
    totalTime: 'PT3M',
    url: '/narzedzia/porownaj-oferty',
    steps: [
      { name: 'Zbierz oferty', text: 'Poproś o szczegółową, pisemną wycenę co najmniej 2–3 zakłady pogrzebowe.' },
      { name: 'Wprowadź dane', text: 'Wpisz nazwę zakładu, cenę całkowitą, ocenę, weryfikację i czas reakcji.' },
      { name: 'Sprawdź ranking', text: 'Algorytm zważy parametry (40% cena + 40% jakość + 20% szybkość) i pokaże najlepszą ofertę.' },
      { name: 'Skontaktuj się', text: 'Wybierz polecaną ofertę i potwierdź warunki bezpośrednio z zakładem.' },
    ],
  }),
);

export default function Page() {
  return (
    <div className="bg-cream">
      <JsonLd data={jsonLd} />
      <div className="container-page pt-6">
        <Breadcrumbs
          items={[
            { name: 'Narzędzia', url: '/narzedzia' },
            { name: 'Porównywarka ofert', url: '/narzedzia/porownaj-oferty' },
          ]}
        />
      </div>
      <PorownajClient />
    </div>
  );
}
