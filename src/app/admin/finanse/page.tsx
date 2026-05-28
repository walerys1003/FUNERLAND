import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { Banknote, TrendingUp, CreditCard, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Finanse — Admin' };

export default async function AdminFinansePage() {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  // Demo metrics (placeholder until Stripe integration)
  const mrr = 18450;
  const mrrPrev = 16200;
  const growth = Math.round(((mrr - mrrPrev) / mrrPrev) * 1000) / 10;
  const activeSubs = 47;
  const churn = 2.3;
  const ltv = 4280;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Finanse</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Przychody platformy, subskrypcje firm, prowizje od leadów.
          </p>
        </div>
        {access.demo && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo — dane demonstracyjne
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
        <Card label="MRR" value={`${mrr.toLocaleString('pl-PL')} zł`} sub={`+${growth}% m/m`} icon={Banknote} tone="emerald" />
        <Card label="Aktywne subskrypcje" value={String(activeSubs)} sub="firmy z planem płatnym" icon={CreditCard} />
        <Card label="Churn" value={`${churn}%`} sub="miesięczny" icon={TrendingUp} tone="amber" />
        <Card label="LTV" value={`${ltv.toLocaleString('pl-PL')} zł`} sub="średnia wartość firmy" icon={Receipt} />
      </div>

      <div className="mt-8 bg-white border border-border-soft rounded-2xl p-6">
        <h2 className="font-heading text-[18px] text-navy">Integracja płatności</h2>
        <p className="text-[13.5px] text-text-secondary mt-2 max-w-2xl">
          Moduł finansowy zostanie podłączony do Stripe / Przelewy24 w kolejnej iteracji. Tutaj pojawią się: lista
          faktur, automatyczne rozliczenia z firmami, raporty miesięczne, eksport do księgowości (CSV/JPK).
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
          <Plan name="Free" price="0 zł" lines={['Wizytówka', 'Brak leadów']} />
          <Plan name="Standard" price="149 zł / mies." lines={['10 leadów / mies.', 'Statystyki', 'Wsparcie e-mail']} />
          <Plan name="Pro" price="349 zł / mies." lines={['50 leadów', 'Priorytet w wynikach', 'API leads']} highlight />
          <Plan name="Premium" price="699 zł / mies." lines={['Bez limitu', 'Account manager', 'White-label']} />
        </div>
      </div>

      <div className="mt-6 bg-white border border-border-soft rounded-2xl p-6">
        <h3 className="font-heading text-[16px] text-navy">Ostatnie transakcje</h3>
        <p className="text-[13px] text-text-muted mt-3">
          Brak danych demo. Moduł aktywuje się po podłączeniu Stripe.
        </p>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'emerald' | 'amber';
}) {
  const color = tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-navy';
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11.5px] text-text-secondary uppercase tracking-wide">{label}</div>
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className={`font-heading text-[26px] mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[11.5px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function Plan({
  name,
  price,
  lines,
  highlight,
}: {
  name: string;
  price: string;
  lines: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-emerald-300 bg-emerald-50/40' : 'border-stone-200 bg-white'
      }`}
    >
      <div className="font-heading text-[15px] text-navy">{name}</div>
      <div className="text-[18px] font-semibold mt-1">{price}</div>
      <ul className="mt-2 text-text-secondary space-y-0.5">
        {lines.map((l) => (
          <li key={l}>· {l}</li>
        ))}
      </ul>
    </div>
  );
}
