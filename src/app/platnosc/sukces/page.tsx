import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Płatność zakończona',
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; plan?: string; firma?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  const demo = sp.demo === '1';
  const planLabel = sp.plan
    ? sp.plan.charAt(0).toUpperCase() + sp.plan.slice(1)
    : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-cream">
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-sm">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
        <h1 className="mt-3 font-heading text-[24px] text-navy">
          {demo ? 'Płatność testowa zarejestrowana' : 'Płatność zakończona pomyślnie'}
        </h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          {demo
            ? 'Tryb demo: subskrypcja została dodana w pamięci aplikacji. W panelu admina zobaczysz ją na liście.'
            : 'Dziękujemy! Twoja subskrypcja jest aktywna. Faktura VAT zostanie wysłana na e-mail w ciągu 24h.'}
        </p>
        {planLabel && (
          <div className="mt-4 inline-block px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px]">
            Plan: <strong>{planLabel}</strong>
          </div>
        )}
        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          <Link
            href="/panel-firmy"
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90"
          >
            Panel firmy
          </Link>
          <Link
            href="/admin/finanse"
            className="px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-50"
          >
            Admin · Finanse
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-50"
          >
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
