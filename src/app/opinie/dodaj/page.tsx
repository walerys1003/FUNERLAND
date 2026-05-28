import type { Metadata } from 'next';
import ReviewForm from '@/components/reviews/review-form';

export const metadata: Metadata = {
  title: 'Dodaj opinię · Polskie Pogrzeby',
  description:
    'Podziel się doświadczeniem po skorzystaniu z usług firmy pogrzebowej. Opinie weryfikujemy na podstawie numeru rezerwacji.',
};

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; booking?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-[#0F1B2D] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-3xl font-medium mb-3"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Wystaw opinię
          </h1>
          <p className="text-white/80">
            Pomóż innym rodzinom — szczerze podziel się doświadczeniem. Opinie z numerem
            rezerwacji oznaczamy plakietką "Zweryfikowana".
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <ReviewForm initialCompany={sp.company} initialBooking={sp.booking} />
      </div>
    </div>
  );
}
