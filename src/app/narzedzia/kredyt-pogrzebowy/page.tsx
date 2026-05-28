import type { Metadata } from 'next';
import KredytClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  softwareApplicationJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Kalkulator kredytu na pogrzeb | PolskiePogrzeby.pl',
  description:
    'Oblicz miesięczną ratę kredytu lub pożyczki na pokrycie kosztów pogrzebu. Wybierz kwotę, okres i oprocentowanie. Szybkie i bez logowania.',
  alternates: { canonical: '/narzedzia/kredyt-pogrzebowy' },
  openGraph: {
    title: 'Kalkulator kredytu na pogrzeb',
    description: 'Oblicz miesięczną ratę — bezpłatnie, bez logowania.',
    url: '/narzedzia/kredyt-pogrzebowy',
    type: 'website',
  },
};

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Kalkulator kredytu pogrzebowego',
    description:
      'Bezpłatny kalkulator rat — oblicz miesięczną ratę kredytu na pokrycie kosztów pogrzebu.',
    url: '/narzedzia/kredyt-pogrzebowy',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Kalkulator kredytu', url: '/narzedzia/kredyt-pogrzebowy' },
    ],
  }),
  softwareApplicationJsonLd({
    name: 'Kalkulator rat kredytu pogrzebowego',
    description:
      'Oblicz miesięczną ratę kredytu lub pożyczki na pokrycie kosztów pogrzebu. Wybierz kwotę, okres i oprocentowanie.',
    url: '/narzedzia/kredyt-pogrzebowy',
    applicationCategory: 'FinanceApplication',
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
            { name: 'Kalkulator kredytu', url: '/narzedzia/kredyt-pogrzebowy' },
          ]}
        />
      </div>
      <KredytClient />
    </div>
  );
}
