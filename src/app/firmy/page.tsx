import type { Metadata } from 'next';
import { Suspense } from 'react';
import BrowseClient from '@/components/marketplace/browse-client';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import { webPageJsonLd, itemListJsonLd, combineJsonLd } from '@/lib/seo/json-ld';
import { companies } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

export const metadata: Metadata = {
  title: 'Wszystkie firmy pogrzebowe · Filtruj, porównuj, znajdź najlepszą · Polskie Pogrzeby',
  description:
    'Pełna baza zweryfikowanych firm pogrzebowych w Polsce. Filtruj po mieście, cenie, ocenie i udogodnieniach. Porównaj nawet 4 firmy obok siebie. Mapa miast i lista z opiniami rodzin.',
  alternates: { canonical: `${BASE_URL}/firmy` },
  openGraph: {
    title: 'Firmy pogrzebowe — porównaj zweryfikowane oferty',
    description: 'Pełna baza firm. Filtruj, sortuj, porównuj.',
    url: `${BASE_URL}/firmy`,
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent('Wszystkie firmy pogrzebowe')}&subtitle=${encodeURIComponent('Filtruj · Porównuj · Znajdź najlepszą')}&type=default`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function FirmyPage() {
  const itemList = itemListJsonLd({
    name: 'Firmy pogrzebowe — pełna baza',
    items: companies.slice(0, 30).map((c) => ({
      name: c.name,
      url: `/firma/${c.slug}`,
      description: `${c.city} · ★ ${c.rating.toFixed(1)} (${c.reviewsCount} opinii)`,
    })),
  });

  const page = webPageJsonLd({
    name: 'Wszystkie firmy pogrzebowe',
    description:
      'Filtruj i porównuj zweryfikowane firmy pogrzebowe w całej Polsce. Mapa, ceny, opinie, udogodnienia.',
    url: `${BASE_URL}/firmy`,
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Firmy', url: '/firmy' },
    ],
  });

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0F1B2D] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs
            items={[{ name: 'Firmy', url: '/firmy' }]}
            className="text-stone-300 mb-3"
          />
          <h1
            className="text-3xl md:text-4xl font-medium mb-2"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Wszystkie firmy pogrzebowe
          </h1>
          <p className="text-stone-300 max-w-2xl text-sm md:text-base">
            Filtruj, sortuj, porównuj. Zweryfikowane zakłady, transparentne ceny,
            opinie rodzin.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          }
        >
          <BrowseClient />
        </Suspense>
      </div>

      <JsonLd data={combineJsonLd(page, itemList)} />
    </div>
  );
}
