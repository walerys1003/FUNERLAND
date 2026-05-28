import type { Metadata } from 'next';
import KosztPogrzebuClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  softwareApplicationJsonLd,
  howToJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Kalkulator kosztu pogrzebu 2026 | PolskiePogrzeby.pl',
  description:
    'Oszacuj koszt pogrzebu w Twoim mieście — tradycyjny, kremacja lub ekologiczny. Trumna, ceremonia, kwiaty, stypa. Aktualne ceny 2026.',
  alternates: { canonical: '/narzedzia/koszt-pogrzebu' },
  openGraph: {
    title: 'Kalkulator kosztu pogrzebu 2026',
    description: 'Oszacuj koszt pogrzebu — bezpłatnie, bez logowania.',
    url: '/narzedzia/koszt-pogrzebu',
    type: 'website',
  },
};

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Kalkulator kosztu pogrzebu',
    description:
      'Bezpłatny kalkulator szacujący całkowity koszt pogrzebu w oparciu o miasto, rodzaj ceremonii i wybrane usługi.',
    url: '/narzedzia/koszt-pogrzebu',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Kalkulator kosztu pogrzebu', url: '/narzedzia/koszt-pogrzebu' },
    ],
  }),
  softwareApplicationJsonLd({
    name: 'Kalkulator kosztu pogrzebu',
    description: 'Oszacuj koszt pogrzebu w swoim mieście — tradycyjny, kremacja lub ekologiczny.',
    url: '/narzedzia/koszt-pogrzebu',
    applicationCategory: 'FinanceApplication',
  }),
  howToJsonLd({
    name: 'Jak oszacować koszt pogrzebu',
    description:
      'Krok po kroku: jak skorzystać z kalkulatora i oszacować całkowity koszt pogrzebu w Polsce.',
    totalTime: 'PT2M',
    url: '/narzedzia/koszt-pogrzebu',
    estimatedCost: { value: 8000, currency: 'PLN' },
    steps: [
      { name: 'Wybierz miasto', text: 'Wskaż miejscowość, w której ma się odbyć ceremonia — wpływa to na ceny usług.' },
      { name: 'Wybierz rodzaj ceremonii', text: 'Tradycyjny pochówek, kremacja lub pogrzeb ekologiczny.' },
      { name: 'Dodaj usługi', text: 'Trumna lub urna, dekoracje, kwiaty, kondukt, stypa.' },
      { name: 'Sprawdź szacunek', text: 'Otrzymasz kwotę całkowitą oraz po odliczeniu zasiłku ZUS 4 000 zł.' },
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
            { name: 'Kalkulator kosztu pogrzebu', url: '/narzedzia/koszt-pogrzebu' },
          ]}
        />
      </div>
      <KosztPogrzebuClient />
    </div>
  );
}
