import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock, Calendar, BookOpen } from 'lucide-react';

import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  itemListJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

import { getAllArticles, getCategories } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Poradnik pogrzebowy 2026 — formalności, koszty, ceremonie | PolskiePogrzeby.pl',
  description:
    'Konkretne odpowiedzi na trudne pytania: formalności, koszty pogrzebu, kremacja, dokumenty, ceremonie. Aktualne dane 2026, bez patosu i bez sprzedaży.',
  alternates: { canonical: '/poradnik' },
  openGraph: {
    title: 'Poradnik pogrzebowy 2026',
    description: 'Pełna wiedza o organizacji pogrzebu w Polsce.',
    url: '/poradnik',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Poradnik%20pogrzebowy&subtitle=Formalno%C5%9Bci%2C%20koszty%2C%20ceremonie&type=article',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PoradnikPage() {
  const articles = getAllArticles();
  const categories = getCategories();
  const featured = articles[0];
  const rest = articles.slice(1);

  const jsonLd = combineJsonLd(
    webPageJsonLd({
      name: 'Poradnik pogrzebowy',
      description: 'Pełen poradnik organizacji pogrzebu w Polsce — formalności, koszty, ceremonie.',
      url: '/poradnik',
      breadcrumb: [
        { name: 'Strona główna', url: '/' },
        { name: 'Poradnik', url: '/poradnik' },
      ],
    }),
    itemListJsonLd({
      name: 'Wszystkie poradniki pogrzebowe',
      items: articles.map((a) => ({
        name: a.title,
        url: `/poradnik/${a.slug}`,
        description: a.metaDescription,
      })),
    }),
  );

  return (
    <div className="bg-cream">
      <JsonLd data={jsonLd} />

      <div className="container-page pt-6">
        <Breadcrumbs items={[{ name: 'Poradnik', url: '/poradnik' }]} />
      </div>

      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container-page max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-text-muted mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Poradnik
          </div>
          <h1 className="font-heading text-[40px] md:text-[52px] leading-tight">
            Poradnik dla rodzin
          </h1>
          <p className="mt-4 text-text-secondary">
            Konkretne odpowiedzi na trudne pytania. Bez patosu, bez sprzedaży.
          </p>
        </div>
      </section>

      {/* Category chips */}
      {categories.length > 0 && (
        <section className="pb-8">
          <div className="container-page">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/poradnik/kategoria/${c.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-soft text-[13px] hover:border-accent-green hover:text-accent-green transition"
                >
                  {c.name}
                  <span className="text-[11px] text-text-muted">({c.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured && (
        <section className="pb-10">
          <div className="container-page">
            <Link
              href={`/poradnik/${featured.slug}`}
              className="card card-hover block p-8 md:p-10 group"
            >
              <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-center">
                <div>
                  <div className="text-[11.5px] text-accent-green font-semibold uppercase tracking-wider mb-2">
                    Najnowsze · {featured.category}
                  </div>
                  <h2 className="font-heading text-[26px] md:text-[30px] leading-tight group-hover:text-accent-green transition">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-[14.5px] text-text-secondary leading-relaxed">
                    {featured.metaDescription}
                  </p>
                  <div className="mt-5 flex items-center gap-4 text-[12.5px] text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readingTime} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {featured.date}
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex justify-end">
                  <div className="w-14 h-14 rounded-full bg-accent-green-light text-accent-green flex items-center justify-center group-hover:scale-110 transition">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="pb-16">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((a) => (
              <Link
                key={a.slug}
                href={`/poradnik/${a.slug}`}
                className="card card-hover p-6 block group"
              >
                <div className="text-[11.5px] text-accent-green font-semibold uppercase tracking-wider">
                  {a.category}
                </div>
                <h3 className="font-heading text-[19px] leading-snug mt-3 group-hover:text-accent-green transition">
                  {a.title}
                </h3>
                <p className="text-[13.5px] text-text-secondary mt-3 line-clamp-3">
                  {a.metaDescription}
                </p>
                <div className="mt-5 flex items-center justify-between text-[12px] text-text-muted">
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.readingTime} min
                    </span>
                    <span>{a.date}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-green group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
