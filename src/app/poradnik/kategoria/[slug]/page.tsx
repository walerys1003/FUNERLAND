import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  itemListJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

import {
  getCategories,
  getArticlesByCategory,
} from '@/lib/articles';

type Params = { slug: string };

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cats = getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return {};

  return {
    title: `Poradnik: ${cat.name} | PolskiePogrzeby.pl`,
    description: `Wszystkie poradniki z kategorii „${cat.name}" — ${cat.count} artykułów. Konkretne odpowiedzi na trudne pytania.`,
    alternates: { canonical: `/poradnik/kategoria/${slug}` },
    openGraph: {
      title: `Poradnik: ${cat.name}`,
      description: `${cat.count} artykułów`,
      url: `/poradnik/kategoria/${slug}`,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cat.name)}&subtitle=${encodeURIComponent(`${cat.count} artykułów`)}&type=article`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cats = getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const articles = getArticlesByCategory(slug);
  const otherCats = cats.filter((c) => c.slug !== slug);

  const jsonLd = combineJsonLd(
    webPageJsonLd({
      name: `Poradnik: ${cat.name}`,
      description: `Wszystkie poradniki z kategorii „${cat.name}".`,
      url: `/poradnik/kategoria/${slug}`,
      breadcrumb: [
        { name: 'Strona główna', url: '/' },
        { name: 'Poradnik', url: '/poradnik' },
        { name: cat.name, url: `/poradnik/kategoria/${slug}` },
      ],
    }),
    itemListJsonLd({
      name: `Artykuły: ${cat.name}`,
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
        <Breadcrumbs
          items={[
            { name: 'Poradnik', url: '/poradnik' },
            { name: cat.name, url: `/poradnik/kategoria/${slug}` },
          ]}
        />
      </div>

      <section className="bg-navy text-white py-12 md:py-14">
        <div className="container-page max-w-3xl">
          <div className="text-[12px] uppercase tracking-wider text-white/70 mb-3">
            Kategoria
          </div>
          <h1 className="font-heading text-[34px] md:text-[44px] leading-tight">{cat.name}</h1>
          <p className="mt-3 text-white/80">
            {articles.length} {articles.length === 1 ? 'artykuł' : articles.length < 5 ? 'artykuły' : 'artykułów'} w tej kategorii.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/poradnik/${a.slug}`}
                className="card card-hover p-6 group block"
              >
                <div className="text-[12px] text-accent-green font-medium uppercase tracking-wider">
                  {a.category}
                </div>
                <h2 className="font-heading text-[19px] leading-snug mt-3 group-hover:text-accent-green transition">
                  {a.title}
                </h2>
                <p className="text-[13.5px] text-text-secondary mt-3 line-clamp-3">
                  {a.metaDescription}
                </p>
                <div className="mt-5 flex items-center justify-between text-[12px] text-text-muted">
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.readingTime} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {a.date}
                    </span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-green group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other categories */}
      {otherCats.length > 0 && (
        <section className="py-10 bg-white border-t border-border-soft">
          <div className="container-page">
            <h2 className="font-heading text-[20px] mb-4">Inne kategorie</h2>
            <div className="flex flex-wrap gap-2">
              {otherCats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/poradnik/kategoria/${c.slug}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-border-soft text-[13px] hover:border-accent-green hover:text-accent-green transition"
                >
                  {c.name}
                  <span className="text-[11px] text-text-muted">({c.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
