import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ChatWidget from '@/components/ai/chat-widget';
import { ToastProvider } from '@/components/ui/toast';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-card focus:outline-none"
        >
          Przejdź do treści
        </a>
        <ToastProvider>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <ChatWidget />
        </ToastProvider>
      </body>
    </html>
  );
}
