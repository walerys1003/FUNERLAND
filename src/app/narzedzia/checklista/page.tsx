import type { Metadata } from 'next';
import ChecklistClient from './client';

export const metadata: Metadata = {
  title: 'Checklista pogrzebowa — co robić krok po kroku | PolskiePogrzeby.pl',
  description:
    'Kompletna checklista organizacji pogrzebu: pierwsze 24h, formalności USC i ZUS, ceremonia, sprawy spadkowe. Drukuj lub udostępniaj.',
  alternates: { canonical: '/narzedzia/checklista' },
};

export default function Page() {
  return <ChecklistClient />;
}
