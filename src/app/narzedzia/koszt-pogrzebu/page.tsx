import type { Metadata } from 'next';
import KosztPogrzebuClient from './client';

export const metadata: Metadata = {
  title: 'Kalkulator kosztu pogrzebu 2026 | PolskiePogrzeby.pl',
  description:
    'Oszacuj koszt pogrzebu w Twoim mieście — tradycyjny, kremacja lub ekologiczny. Trumna, ceremonia, kwiaty, stypa. Aktualne ceny 2026.',
  alternates: { canonical: '/narzedzia/koszt-pogrzebu' },
};

export default function Page() {
  return <KosztPogrzebuClient />;
}
