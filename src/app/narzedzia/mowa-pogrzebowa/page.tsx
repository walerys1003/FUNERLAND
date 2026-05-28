import type { Metadata } from 'next';
import SpeechClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  howToJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Generator mowy pogrzebowej — szablony i wzory | PolskiePogrzeby.pl',
  description:
    'Pomoc w napisaniu mowy pożegnalnej — religijnej, świeckiej lub osobistej. Wprowadź kilka informacji o zmarłym i otrzymaj gotową strukturę.',
  alternates: { canonical: '/narzedzia/mowa-pogrzebowa' },
  openGraph: {
    title: 'Generator mowy pogrzebowej',
    description: 'Szablon mowy pożegnalnej — religijnej, świeckiej, osobistej.',
    url: '/narzedzia/mowa-pogrzebowa',
    type: 'website',
  },
};

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Generator mowy pogrzebowej',
    description:
      'Bezpłatne narzędzie pomagające napisać mowę pożegnalną — w tonie religijnym, świeckim lub osobistym.',
    url: '/narzedzia/mowa-pogrzebowa',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Mowa pogrzebowa', url: '/narzedzia/mowa-pogrzebowa' },
    ],
  }),
  howToJsonLd({
    name: 'Jak napisać mowę pożegnalną',
    description:
      'Krok po kroku: jak przygotować mowę pogrzebową, która godnie pożegna zmarłą osobę.',
    totalTime: 'PT5M',
    url: '/narzedzia/mowa-pogrzebowa',
    steps: [
      { name: 'Wprowadź podstawowe informacje', text: 'Podaj imię i nazwisko zmarłego, relację oraz najważniejsze fakty z życia.' },
      { name: 'Wybierz ton', text: 'Religijny, świecki lub osobisty — narzędzie dostosuje strukturę i słownictwo.' },
      { name: 'Dodaj wspomnienia', text: 'Krótkie anegdoty, cechy charakteru, dorobek, pasje — to one nadają mowie autentyczność.' },
      { name: 'Wygeneruj i edytuj', text: 'Otrzymasz gotowy szkielet mowy. Przeczytaj na głos, dopasuj długość (3–5 minut to optimum).' },
      { name: 'Przećwicz wystąpienie', text: 'Przeczytaj kilka razy na głos, zaznacz pauzy. Miej kopię papierową na ceremonii.' },
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
            { name: 'Mowa pogrzebowa', url: '/narzedzia/mowa-pogrzebowa' },
          ]}
        />
      </div>
      <SpeechClient />
    </div>
  );
}
