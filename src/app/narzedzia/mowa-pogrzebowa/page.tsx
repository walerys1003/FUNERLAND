import type { Metadata } from 'next';
import SpeechClient from './client';

export const metadata: Metadata = {
  title: 'Generator mowy pogrzebowej — szablony i wzory | PolskiePogrzeby.pl',
  description:
    'Pomoc w napisaniu mowy pożegnalnej — religijnej, świeckiej lub osobistej. Wprowadź kilka informacji o zmarłym i otrzymaj gotową strukturę.',
  alternates: { canonical: '/narzedzia/mowa-pogrzebowa' },
};

export default function Page() {
  return <SpeechClient />;
}
