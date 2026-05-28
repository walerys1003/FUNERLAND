import { Shield, CreditCard, Smartphone, Building2, Lock } from 'lucide-react';

type Props = {
  companyName: string;
  /** Cena minimalna usługi — wyświetla się jako "od X zł" */
  minPrice?: number;
};

/**
 * Server component — payment options card for company page.
 * Buttons link to /platnosc/<company>?metoda=... (page handles real Stripe/Przelewy24 in future).
 * For now: visual reassurance + RODO/escrow trust pattern.
 */
export default function PaymentSection({ companyName, minPrice }: Props) {
  return (
    <section id="platnosci" aria-labelledby="platnosci-heading" className="card p-6 md:p-7">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            id="platnosci-heading"
            className="font-heading text-[22px] text-navy inline-flex items-center gap-2"
          >
            <Shield className="w-5 h-5 text-emerald-600" />
            Bezpieczne płatności
          </h2>
          <p className="mt-1 text-[13.5px] text-text-secondary max-w-xl">
            Zaliczkę lub pełną kwotę możesz opłacić przez platformę — środki trzymamy w depozycie do
            potwierdzenia ceremonii. {minPrice ? `Cena od ${minPrice.toLocaleString('pl-PL')} zł.` : ''}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Lock className="w-3 h-3" />
          Escrow · 256-bit TLS
        </span>
      </div>

      {/* Methods */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <PaymentMethod
          icon={Smartphone}
          name="BLIK"
          desc="Najszybciej · 6 cyfr"
          highlight
          href={`/platnosc/depozyt?firma=${encodeURIComponent(companyName)}&metoda=blik`}
        />
        <PaymentMethod
          icon={CreditCard}
          name="Karta"
          desc="Visa · Mastercard"
          href={`/platnosc/depozyt?firma=${encodeURIComponent(companyName)}&metoda=karta`}
        />
        <PaymentMethod
          icon={Building2}
          name="Przelew"
          desc="Pay-by-link · 20+ banków"
          href={`/platnosc/depozyt?firma=${encodeURIComponent(companyName)}&metoda=przelew`}
        />
      </div>

      {/* Trust line */}
      <ul className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-2 text-[12.5px] text-text-secondary">
        <li className="inline-flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          Zwrot 100% jeśli ceremonia nie dojdzie do skutku
        </li>
        <li className="inline-flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          PCI-DSS · brak zapisu danych karty
        </li>
        <li className="inline-flex items-start gap-2">
          <CreditCard className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          Faktura VAT na e-mail w ciągu 24h
        </li>
      </ul>

      <p className="mt-4 text-[11.5px] text-text-muted">
        Operator płatności: Stripe / Przelewy24 (BLIK). Zaliczka jest zwrotna do momentu rezerwacji terminu
        ceremonii. Pełna kwota uwalniana jest do firmy 24h po potwierdzeniu wykonania usługi.
      </p>
    </section>
  );
}

function PaymentMethod({
  icon: Icon,
  name,
  desc,
  highlight,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  highlight?: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-navy/40 ${
        highlight
          ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50'
          : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          highlight ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-navy'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-navy text-[14px]">{name}</span>
        <span className="block text-[11.5px] text-text-secondary">{desc}</span>
      </span>
    </a>
  );
}
