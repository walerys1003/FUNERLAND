import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bookingRepo } from '@/lib/marketplace/repo';
import { CheckCircle2, Calendar, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Potwierdzenie rezerwacji · Polskie Pogrzeby',
  description: 'Potwierdzenie rezerwacji usługi pogrzebowej.',
  robots: { index: false, follow: false },
};

function fmtDateTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const b = await bookingRepo.get(number);
  if (!b) notFound();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
            </div>
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-medium text-stone-900 mb-2"
                style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
              >
                Zgłoszenie przyjęte
              </h1>
              <p className="text-stone-600">
                Numer rezerwacji:{' '}
                <span className="font-mono font-medium text-stone-900">{b.number}</span>
              </p>
              <p className="text-sm text-stone-500 mt-2">
                Wysłaliśmy potwierdzenie na <strong>{b.data.email}</strong>. Skontaktujemy się
                z Państwem w ciągu 2 godzin (24/7).
              </p>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-medium text-stone-900 mb-4">Szczegóły rezerwacji</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <dt className="text-stone-500">Kategoria</dt>
              <dd className="text-stone-900 font-medium">{b.category}</dd>
            </div>
            {b.companyName && (
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <dt className="text-stone-500">Firma</dt>
                <dd className="text-stone-900 font-medium">{b.companyName}</dd>
              </div>
            )}
            {b.slotStart && (
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <dt className="text-stone-500 inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Termin
                </dt>
                <dd className="text-stone-900 font-medium">{fmtDateTime(b.slotStart)}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <dt className="text-stone-500">Status</dt>
              <dd>
                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  Nowe — oczekuje na potwierdzenie
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Contact options */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-medium text-stone-900 mb-4">Co dalej?</h2>
          <div className="space-y-3 text-sm text-stone-700">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-[#2E4F3E] flex-shrink-0 mt-0.5" />
              <p>
                Skontaktujemy się telefonicznie pod numerem <strong>{b.data.phone}</strong>{' '}
                w ciągu 2 godzin.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#2E4F3E] flex-shrink-0 mt-0.5" />
              <p>
                Na adres <strong>{b.data.email}</strong> wysłaliśmy kopię zgłoszenia oraz link
                do panelu zarządzania rezerwacją.
              </p>
            </div>
            {b.companySlug && (
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-[#2E4F3E] flex-shrink-0 mt-0.5" />
                <p>
                  Otworzyliśmy w Państwa imieniu wątek wiadomości z firmą —{' '}
                  <Link
                    href={`/panel-rodziny/wiadomosci?company=${b.companySlug}`}
                    className="text-[#2E4F3E] underline underline-offset-2"
                  >
                    przejdź do wiadomości
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/"
            className="px-5 py-3 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition text-sm"
          >
            Wróć na stronę główną
          </Link>
          <Link
            href={`/panel-rodziny?booking=${b.number}`}
            className="px-5 py-3 rounded-lg bg-[#2E4F3E] text-white hover:bg-[#26412F] transition text-sm inline-flex items-center gap-2"
          >
            Panel rodziny <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-xs text-stone-500 mt-6 text-center">
          Możesz w każdej chwili anulować rezerwację bez kosztów. W razie potrzeby zadzwoń pod
          numer infolinii: <strong>800 123 456</strong> (24/7, bezpłatnie).
        </p>
      </div>
    </div>
  );
}
