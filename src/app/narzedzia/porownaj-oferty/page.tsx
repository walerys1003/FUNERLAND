import type { Metadata } from 'next';
import PorownajClient from './client';

export const metadata: Metadata = {
  title: 'Porównywarka ofert pogrzebowych | PolskiePogrzeby.pl',
  description:
    'Porównaj 2–3 oferty zakładów pogrzebowych po jakości i cenie. Automatyczny ranking oparty na rzeczywistych parametrach.',
  alternates: { canonical: '/narzedzia/porownaj-oferty' },
};

export default function Page() {
  return <PorownajClient />;
}
