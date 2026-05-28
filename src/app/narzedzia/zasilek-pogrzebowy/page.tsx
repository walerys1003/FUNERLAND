import type { Metadata } from 'next';
import ZasilekPogrzebowyClient from './client';

export const metadata: Metadata = {
  title: 'Zasiłek pogrzebowy ZUS 2026 — kalkulator | PolskiePogrzeby.pl',
  description:
    'Sprawdź, czy przysługuje Ci zasiłek pogrzebowy z ZUS (4 000 zł). Wymagane dokumenty, terminy, wniosek Z-12. Dla rodziny i spoza rodziny.',
  alternates: { canonical: '/narzedzia/zasilek-pogrzebowy' },
};

export default function Page() {
  return <ZasilekPogrzebowyClient />;
}
