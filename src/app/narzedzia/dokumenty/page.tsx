import type { Metadata } from 'next';
import DocumentsClient from './client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  itemListJsonLd,
  howToJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Generator wzorów dokumentów pogrzebowych | PolskiePogrzeby.pl',
  description:
    'Gotowe wzory: wniosek o odprawę pośmiertną, zasiłek pogrzebowy ZUS Z-12, oświadczenie spadkowe. Wypełnij online i pobierz.',
  alternates: { canonical: '/narzedzia/dokumenty' },
  openGraph: {
    title: 'Generator wzorów dokumentów pogrzebowych',
    description: 'Z-12, odprawa pośmiertna, oświadczenie spadkowe.',
    url: '/narzedzia/dokumenty',
    type: 'website',
  },
};

const DOCS = [
  {
    name: 'Wniosek ZUS Z-12 o zasiłek pogrzebowy',
    url: '/narzedzia/dokumenty?doc=zus-z12',
    description: 'Oficjalny wniosek do ZUS o wypłatę zasiłku pogrzebowego 4 000 zł.',
  },
  {
    name: 'Wniosek o odprawę pośmiertną',
    url: '/narzedzia/dokumenty?doc=odprawa-posmiertna',
    description: 'Wniosek do pracodawcy o wypłatę odprawy po zmarłym pracowniku.',
  },
  {
    name: 'Oświadczenie spadkowe',
    url: '/narzedzia/dokumenty?doc=spadek',
    description: 'Wzór oświadczenia o przyjęciu lub odrzuceniu spadku.',
  },
];

const jsonLd = combineJsonLd(
  webPageJsonLd({
    name: 'Generator wzorów dokumentów pogrzebowych',
    description:
      'Gotowe wzory wniosków i oświadczeń związanych z pogrzebem i spadkiem — wypełnij i pobierz w kilka minut.',
    url: '/narzedzia/dokumenty',
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Narzędzia', url: '/narzedzia' },
      { name: 'Dokumenty', url: '/narzedzia/dokumenty' },
    ],
  }),
  itemListJsonLd({
    name: 'Dostępne wzory dokumentów',
    items: DOCS,
  }),
  howToJsonLd({
    name: 'Jak wygenerować dokument pogrzebowy',
    description: 'Krok po kroku: jak wypełnić i pobrać gotowy wzór dokumentu.',
    totalTime: 'PT3M',
    url: '/narzedzia/dokumenty',
    steps: [
      { name: 'Wybierz dokument', text: 'Z listy wybierz potrzebny wzór (np. ZUS Z-12, odprawa pośmiertna).' },
      { name: 'Wypełnij dane', text: 'Wprowadź dane osobowe wnioskodawcy i zmarłego oraz wymagane szczegóły.' },
      { name: 'Pobierz dokument', text: 'Kliknij "Pobierz" — zapisz plik tekstowy lub wydrukuj.' },
      { name: 'Złóż dokument', text: 'Zanieś wypełniony i podpisany dokument do właściwego urzędu lub instytucji.' },
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
            { name: 'Dokumenty', url: '/narzedzia/dokumenty' },
          ]}
        />
      </div>
      <DocumentsClient />
    </div>
  );
}
