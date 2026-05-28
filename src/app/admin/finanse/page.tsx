import Link from 'next/link';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { Banknote, TrendingUp, CreditCard, Receipt, AlertTriangle } from 'lucide-react';
import { subscriptionStore } from '@/lib/billing/subscriptions-store';
import { STRIPE_CONFIGURED, PLANS } from '@/lib/billing/plans';
import SimulatePayment from '@/components/admin/simulate-payment';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Finanse — Admin' };

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  trialing: 'bg-sky-100 text-sky-800 border-sky-200',
  past_due: 'bg-amber-100 text-amber-800 border-amber-200',
  canceled: 'bg-stone-100 text-stone-600 border-stone-200',
};

const PLAN_BADGE: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-800 border-amber-200',
  pro: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  standard: 'bg-stone-100 text-stone-700 border-stone-200',
  free: 'bg-stone-50 text-stone-500 border-stone-200',
};

export default async function AdminFinansePage() {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const subs = subscriptionStore.list();
  const stats = subscriptionStore.stats();
  const churn = stats.total > 0 ? Math.round((stats.canceled / stats.total) * 1000) / 10 : 0;
  const ltv = stats.active > 0 ? Math.round((stats.mrr * 24) / stats.active) : 0;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Finanse</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Subskrypcje firm, MRR, churn. Integracja Stripe / Przelewy24.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {access.demo && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
              tryb demo
            </span>
          )}
          <span
            className={`text-[11px] px-2 py-1 rounded-full border ${
              STRIPE_CONFIGURED
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            Stripe: {STRIPE_CONFIGURED ? 'aktywny' : 'wyłączony'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
        <Card
          label="MRR"
          value={`${stats.mrr.toLocaleString('pl-PL')} zł`}
          sub={`${stats.active} aktywnych`}
          icon={Banknote}
          tone="emerald"
        />
        <Card
          label="Subskrypcje"
          value={String(stats.active)}
          sub={`${stats.pastDue} past due · ${stats.canceled} anulowane`}
          icon={CreditCard}
        />
        <Card label="Churn" value={`${churn}%`} sub="cumulative" icon={TrendingUp} tone="amber" />
        <Card
          label="LTV (24m)"
          value={`${ltv.toLocaleString('pl-PL')} zł`}
          sub="szacunek na firmę"
          icon={Receipt}
        />
      </div>

      {/* Plan distribution */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <PlanDist label="Premium" count={stats.byPlan.premium} color="bg-amber-500" />
        <PlanDist label="Pro" count={stats.byPlan.pro} color="bg-emerald-500" />
        <PlanDist label="Standard" count={stats.byPlan.standard} color="bg-stone-400" />
      </div>

      {/* Simulate (demo only) */}
      {!STRIPE_CONFIGURED && (
        <div className="mt-6">
          <SimulatePayment />
        </div>
      )}

      {/* Subscriptions list */}
      <div className="mt-6 bg-white border border-border-soft rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-heading text-[16px] text-navy">Subskrypcje ({subs.length})</h2>
          <Link href="/dla-firm" className="text-[12px] text-navy hover:underline">
            Plany cenowe →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-dark/40 text-text-secondary">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Firma</th>
                <th className="text-left px-4 py-2 font-medium">Plan</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Kwota</th>
                <th className="text-left px-4 py-2 font-medium">Kolejna płatność</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-border-soft hover:bg-cream-dark/20">
                  <td className="px-4 py-3">
                    <Link href={`/firma/${s.companySlug}`} className="font-medium text-navy hover:underline">
                      {s.companyName || s.companySlug}
                    </Link>
                    <div className="text-[11.5px] text-text-muted mt-0.5">{s.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${
                        PLAN_BADGE[s.plan] || PLAN_BADGE.free
                      }`}
                    >
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                        STATUS_BADGE[s.status] || STATUS_BADGE.active
                      }`}
                    >
                      {s.status === 'past_due' && <AlertTriangle className="w-3 h-3" />}
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-navy">
                    {s.amount.toLocaleString('pl-PL')} zł
                    <span className="text-[11px] text-text-muted ml-1">
                      /{s.period === 'yearly' ? 'rok' : 'm-c'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-[12.5px]">
                    {formatDate(s.currentPeriodEnd)}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-text-muted text-sm">
                    Brak subskrypcji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing tiers reference */}
      <div className="mt-6 bg-white border border-border-soft rounded-2xl p-6">
        <h3 className="font-heading text-[16px] text-navy">Plany cenowe (referencja)</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-[13px]">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${
                p.popular ? 'border-emerald-300 bg-emerald-50/40' : 'border-stone-200 bg-white'
              }`}
            >
              <div className="font-heading text-[15px] text-navy">{p.name}</div>
              <div className="text-[18px] font-semibold mt-1">
                {p.price === 0 ? '0 zł' : `${p.price} zł / mies.`}
              </div>
              <ul className="mt-2 text-text-secondary space-y-0.5 text-[12.5px]">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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

function PlanDist({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-text-secondary">{label}</span>
        <span className="font-heading text-navy">{count}</span>
      </div>
      <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.min(100, count * 20)}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}
