import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ChatWidget from '@/components/ai/chat-widget';
import { ToastProvider } from '@/components/ui/toast';
import WebVitals from '@/components/perf/web-vitals';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { PlausibleScript } from '@/components/analytics/plausible';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Polskie Pogrzeby — Pożegnaj godnie. Bez presji. Bez ukrytych kosztów.',
    template: '%s | PolskiePogrzeby.pl',
  },
  description:
    'Marketplace funeralny. Porównaj zweryfikowane firmy pogrzebowe w Twoim mieście, otrzymaj 3 oferty w 24 godziny, sprawdź realne koszty pogrzebu.',
  keywords: [
    'pogrzeb',
    'zakład pogrzebowy',
    'kremacja',
    'kalkulator pogrzebu',
    'zasiłek pogrzebowy',
    'usługi pogrzebowe',
    'koszt pogrzebu',
  ],
  authors: [{ name: 'PolskiePogrzeby.pl' }],
  creator: 'PolskiePogrzeby.pl',
  publisher: 'PolskiePogrzeby.pl',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: { 'pl-PL': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE_URL,
    siteName: 'PolskiePogrzeby.pl',
    title: 'Polskie Pogrzeby — Pożegnaj godnie',
    description:
      'Marketplace funeralny. Porównaj zweryfikowane firmy pogrzebowe w Twoim mieście, otrzymaj 3 oferty w 24 godziny.',
    images: [
      {
        url: '/api/og?title=Po%C5%BCegnaj%20godnie&type=default',
        width: 1200,
        height: 630,
        alt: 'PolskiePogrzeby.pl — Pożegnaj godnie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polskie Pogrzeby — Pożegnaj godnie',
    description:
      'Marketplace funeralny. Porównaj zweryfikowane firmy pogrzebowe w Twoim mieście.',
    images: ['/api/og?title=Po%C5%BCegnaj%20godnie&type=default'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  category: 'lifestyle',
};

export const viewport = {
  themeColor: '#0F2A44',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
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
          <WebVitals />
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <ChatWidget />
          <CookieConsent />
          <PlausibleScript />
        </ToastProvider>
      </body>
    </html>
  );
}
