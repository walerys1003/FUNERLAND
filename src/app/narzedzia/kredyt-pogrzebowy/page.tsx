import type { Metadata } from 'next';
import KredytClient from './client';

export const metadata: Metadata = {
  title: 'Kalkulator kredytu na pogrzeb | PolskiePogrzeby.pl',
  description:
    'Oblicz miesięczną ratę kredytu lub pożyczki na pokrycie kosztów pogrzebu. Wybierz kwotę, okres i oprocentowanie. Szybkie i bez logowania.',
  alternates: { canonical: '/narzedzia/kredyt-pogrzebowy' },
};

export default function Page() {
  return <KredytClient />;
}
