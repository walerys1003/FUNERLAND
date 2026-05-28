import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { obituaryRepo } from '@/lib/marketplace/repo';
import CandleButton from '@/components/obituaries/candle-button';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) return { title: 'Nekrolog · Polskie Pogrzeby' };
  return {
    title: `${obit.personName} · Nekrolog · Polskie Pogrzeby`,
    description: obit.text.slice(0, 160),
    robots: { index: true, follow: true },
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

  return (
    <div
      className={`min-h-screen ${
        isPremium
          ? 'bg-gradient-to-b from-[#FAF6EC] via-stone-50 to-white'
          : 'bg-stone-50'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/nekrologi"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Wszystkie nekrologi
        </Link>

        <div
          className={`bg-white border ${
            isPremium ? 'border-[#C9A65F]/40' : 'border-stone-200'
          } rounded-2xl p-8 md:p-10 shadow-sm text-center`}
        >
          {isPremium && (
            <div className="inline-block text-[10.5px] text-[#C9A65F] font-semibold tracking-wider uppercase mb-3">
              Premium · z transmisją online
            </div>
          )}

          {obit.photoUrl ? (
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

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-stone-600">
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

          <div className="flex flex-col items-center gap-3">
            <CandleButton slug={obit.slug} initialCandles={obit.candles} />
            <p className="text-xs text-stone-500">
              {obit.candles} {obit.candles === 1 ? 'osoba zapaliła świecę' : 'osób zapaliło świecę'}
            </p>
          </div>

          <p className="text-xs text-stone-400 mt-8">
            Opublikowano przez {obit.authorName} · {fmtDate(obit.createdAt)}
          </p>
        </div>

        {isPremium && (
          <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-medium text-stone-900 mb-2">Transmisja online ceremonii</h2>
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

        {/* Schema.org Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: obit.personName,
              birthDate: obit.birthDate,
              deathDate: obit.deathDate,
              homeLocation: { '@type': 'Place', name: obit.city },
            }),
          }}
        />
      </div>
    </div>
  );
}
