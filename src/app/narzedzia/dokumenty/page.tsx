import type { Metadata } from 'next';
import DocumentsClient from './client';

export const metadata: Metadata = {
  title: 'Generator wzorów dokumentów pogrzebowych | PolskiePogrzeby.pl',
  description:
    'Gotowe wzory: wniosek o odprawę pośmiertną, zasiłek pogrzebowy ZUS Z-12, oświadczenie spadkowe. Wypełnij online i pobierz.',
  alternates: { canonical: '/narzedzia/dokumenty' },
};

export default function Page() {
  return <DocumentsClient />;
}
