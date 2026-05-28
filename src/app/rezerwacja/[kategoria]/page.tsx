import { notFound } from 'next/navigation';
import { ALL_CATEGORIES, getCategoryConfig } from '@/lib/marketplace/categories';
import BookingStepper from '@/components/booking/booking-stepper';
import Link from 'next/link';
import { ShieldCheck, Clock, Lock } from 'lucide-react';

export async function generateStaticParams() {
  return ALL_CATEGORIES.map((c) => ({ kategoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategoria: string }>;
}) {
  const { kategoria } = await params;
  const cat = getCategoryConfig(kategoria);
  if (!cat) return { title: 'Rezerwacja — PolskiePogrzeby.pl' };
  return {
    title: `Rezerwacja: ${cat.name} — PolskiePogrzeby.pl`,
    description: `${cat.shortDescription} Wypełnij krótki formularz, otrzymaj wycenę w ciągu 24h.`,
  };
}

export default async function BookingPage({ params }: { params: Promise<{ kategoria: string }> }) {
  const { kategoria } = await params;
  const category = getCategoryConfig(kategoria);
  if (!category) notFound();

  const Icon = category.icon;
  // Strip non-serializable `icon` (React component) before passing to Client Component
  const { icon: _icon, ...categoryData } = category;

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-stone-500 mb-6">
          <Link href="/" className="hover:text-[#2E4F3E]">
            Strona główna
          </Link>{' '}
          / <span className="text-stone-800">Rezerwacja: {category.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h1
              className="text-3xl font-medium text-stone-900 mb-2"
              style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
            >
              Rezerwacja: {category.name}
            </h1>
            <p className="text-stone-600">{category.shortDescription}</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-lg border border-stone-200 px-3 py-3 text-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-xs text-stone-600">Zweryfikowane firmy</div>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 px-3 py-3 text-center">
            <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <div className="text-xs text-stone-600">Odpowiedź w 2h</div>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 px-3 py-3 text-center">
            <Lock className="h-5 w-5 text-stone-600 mx-auto mb-1" />
            <div className="text-xs text-stone-600">RODO compliant</div>
          </div>
        </div>

        {/* Stepper */}
        <BookingStepper category={categoryData} />

        {/* Info */}
        <div className="mt-8 text-center text-sm text-stone-500">
          <p>
            Masz pytania? Skorzystaj z{' '}
            <Link href="/" className="text-[#2E4F3E] underline">
              naszego asystenta
            </Link>{' '}
            (ikona w prawym dolnym rogu) lub zadzwoń{' '}
            <a href="tel:+48221000000" className="text-[#2E4F3E] underline">
              +48 22 100 00 00
            </a>{' '}
            (pon-pt 8:00-20:00).
          </p>
        </div>
      </div>
    </div>
  );
}
