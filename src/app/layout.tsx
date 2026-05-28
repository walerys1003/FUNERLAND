import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: 'Polskie Pogrzeby — Pożegnaj godnie. Bez presji. Bez ukrytych kosztów.',
  description:
    'Marketplace funeralny. Porównaj zweryfikowane firmy pogrzebowe w Twoim mieście, otrzymaj 3 oferty w 24 godziny, sprawdź realne koszty pogrzebu.',
  keywords: ['pogrzeb', 'zakład pogrzebowy', 'kremacja', 'kalkulator pogrzebu', 'zasiłek pogrzebowy'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-texture">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
