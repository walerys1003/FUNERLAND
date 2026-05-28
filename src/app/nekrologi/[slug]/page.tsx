import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { obituaryRepo } from '@/lib/marketplace/repo';
import { condolenceStore, memoryStore } from '@/lib/marketplace/store';
import CandleButton from '@/components/obituaries/candle-button';
import CondolenceSection from '@/components/obituaries/condolence-section';
import MemoryWall from '@/components/obituaries/memory-wall';
import ShareButton from '@/components/obituaries/share-button';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import { webPageJsonLd, combineJsonLd } from '@/lib/seo/json-ld';
import { MapPin, Calendar, ArrowLeft, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) return { title: 'Nekrolog · Polskie Pogrzeby' };

  const title = `${obit.personName} · Nekrolog · Polskie Pogrzeby`;
  const description = obit.text.slice(0, 160).replace(/\s+/g, ' ').trim();
  const canonical = `${BASE_URL}/nekrologi/${slug}`;
  const ogImg = `${BASE_URL}/api/og?title=${encodeURIComponent(obit.personName)}&subtitle=${encodeURIComponent(`Nekrolog · ${obit.city}`)}&type=obituary`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'profile',
      images: [{ url: ogImg, width: 1200, height: 630, alt: obit.personName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImg],
    },
  };
}

function fmtDate(s?: string) {
  if (!s) return '';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default async function ObituaryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) notFound();

  const isPremium = obit.tier === 'premium';
  const canonical = `${BASE_URL}/nekrologi/${slug}`;

  // Server-side prefetch for instant first paint
  const initialCondolences = condolenceStore.listForSlug(slug);
  const initialMemories = memoryStore.listForSlug(slug);

  // JSON-LD: Person + WebPage + BreadcrumbList
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: obit.personName,
    birthDate: obit.birthDate,
    deathDate: obit.deathDate,
    homeLocation: { '@type': 'Place', name: obit.city },
    image: obit.photoUrl,
    description: obit.text.slice(0, 200),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  const pageLd = webPageJsonLd({
    name: `${obit.personName} — Nekrolog`,
    description: obit.text.slice(0, 160),
    url: canonical,
    datePublished: obit.createdAt,
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Nekrologi', url: '/nekrologi' },
      { name: obit.personName, url: `/nekrologi/${slug}` },
    ],
    primaryImage: obit.photoUrl,
  });

  return (
    <div
      className={`min-h-screen ${
        isPremium
          ? 'bg-gradient-to-b from-[#FAF6EC] via-stone-50 to-white'
          : 'bg-stone-50'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
        {/* Breadcrumbs */}
        <div className="mb-5">
          <Breadcrumbs
            items={[
              { name: 'Nekrologi', url: '/nekrologi' },
              { name: obit.personName, url: `/nekrologi/${slug}` },
            ]}
          />
        </div>

        <Link
          href="/nekrologi"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Wszystkie nekrologi
        </Link>

        {/* Main obituary card */}
        <div
          className={`bg-white border ${
            isPremium ? 'border-[#C9A65F]/40' : 'border-stone-200'
          } rounded-2xl p-6 md:p-10 shadow-sm text-center`}
        >
          {isPremium && (
            <div className="inline-block text-[10.5px] text-[#C9A65F] font-semibold tracking-wider uppercase mb-3">
              Premium · z transmisją online
            </div>
          )}

          {obit.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={obit.photoUrl}
              alt={obit.personName}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4 grayscale"
            />
          ) : (
            <div className="h-20 mb-4 flex items-center justify-center text-stone-300">
              <svg viewBox="0 0 80 60" className="h-full">
                <path
                  d="M10 50 Q 20 20 30 50 M 40 50 Q 50 25 60 50 M 65 50 Q 70 30 75 50"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>
          )}

          <h1
            className="text-3xl md:text-4xl font-medium text-stone-900"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            {obit.personName}
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            {fmtDate(obit.birthDate)} {obit.birthDate && '—'} {fmtDate(obit.deathDate)}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {obit.city}
            </span>
            {obit.funeralDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {fmtDate(obit.funeralDate)}
                {obit.funeralPlace && `, ${obit.funeralPlace}`}
              </span>
            )}
          </div>

          <div className="my-8 h-px bg-stone-200" />

          <p
            className="text-stone-700 whitespace-pre-line leading-relaxed text-left"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            {obit.text}
          </p>

          <div className="my-8 h-px bg-stone-200" />

          {/* Candle + share row */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <CandleButton slug={obit.slug} initialCandles={obit.candles} />
              <p className="text-xs text-stone-500 inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-[#C9A65F]" />
                {obit.candles}{' '}
                {obit.candles === 1 ? 'osoba zapaliła świecę' : 'osób zapaliło świecę'}
              </p>
            </div>
            <ShareButton slug={obit.slug} personName={obit.personName} />
          </div>

          <p className="text-xs text-stone-400 mt-8">
            Opublikowano przez {obit.authorName} · {fmtDate(obit.createdAt)}
          </p>
        </div>

        {/* Premium: transmisja */}
        {isPremium && (
          <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-medium text-stone-900 mb-2">
              Transmisja online ceremonii
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Link do transmisji zostanie udostępniony 30 minut przed rozpoczęciem ceremonii.
            </p>
            <button
              disabled
              className="px-5 py-2.5 rounded-lg bg-stone-200 text-stone-500 text-sm cursor-not-allowed"
            >
              Transmisja jeszcze nieaktywna
            </button>
          </div>
        )}

        {/* Memory wall */}
        <div className="mt-6">
          <MemoryWall slug={obit.slug} initial={initialMemories} />
        </div>

        {/* Condolence book */}
        <div className="mt-6">
          <CondolenceSection slug={obit.slug} initial={initialCondolences} />
        </div>

        {/* Footer: digital archive note */}
        <div className="mt-8 text-center text-xs text-stone-500">
          <p>
            Nekrolog jest częścią{' '}
            <Link href="/nekrologi" className="underline">
              cyfrowego archiwum pamięci
            </Link>{' '}
            PolskiePogrzeby.pl. Przechowujemy wpisy z poszanowaniem prywatności i RODO.
          </p>
        </div>
      </div>

      {/* JSON-LD: Person + WebPage (with auto-emitted Breadcrumb above) */}
      <JsonLd data={combineJsonLd(personLd, pageLd)} />
    </div>
  );
}
