import Link from 'next/link';
import { Building2, Star, BadgeCheck, Phone } from 'lucide-react';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { companies, cities } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Firmy — Admin' };

const PLAN_COLOR: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-800 border-amber-200',
  pro: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  standard: 'bg-stone-100 text-stone-700 border-stone-200',
  free: 'bg-stone-50 text-stone-500 border-stone-200',
};

export default async function AdminFirmyPage({
  searchParams,
}: {
  searchParams: Promise<{ miasto?: string; plan?: string; q?: string }>;
}) {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const sp = await searchParams;
  const cityFilter = sp.miasto?.toLowerCase();
  const planFilter = sp.plan?.toLowerCase();
  const q = sp.q?.toLowerCase().trim();

  let list = [...companies];
  if (cityFilter) list = list.filter((c) => c.citySlug === cityFilter);
  if (planFilter) list = list.filter((c) => c.plan === planFilter);
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));

  // Aggregate stats
  const total = companies.length;
  const verified = companies.filter((c) => c.isVerified).length;
  const premiumPlus = companies.filter((c) => c.plan === 'premium' || c.plan === 'pro').length;
  const avgRating =
    Math.round(
      (companies.reduce((a, c) => a + c.rating, 0) / Math.max(companies.length, 1)) * 10,
    ) / 10;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Firmy</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Zarządzanie listingami zakładów, weryfikacja, plany.
          </p>
        </div>
        {access.demo && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo — dane z mocka
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Wszystkie firmy" value={total} />
        <Stat label="Zweryfikowane" value={verified} sub={`${Math.round((verified / total) * 100)}%`} />
        <Stat label="Pro + Premium" value={premiumPlus} sub={`${Math.round((premiumPlus / total) * 100)}%`} />
        <Stat label="Średnia ocena" value={avgRating.toFixed(1)} sub="z 5.0" />
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-end gap-2 bg-white border border-border-soft rounded-2xl p-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] text-text-secondary mb-1">Szukaj</label>
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="nazwa, miasto…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-secondary mb-1">Miasto</label>
          <select
            name="miasto"
            defaultValue={cityFilter || ''}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
          >
            <option value="">Wszystkie</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-text-secondary mb-1">Plan</label>
          <select
            name="plan"
            defaultValue={planFilter || ''}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
          >
            <option value="">Wszystkie</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
            <option value="standard">Standard</option>
            <option value="free">Free</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90"
        >
          Filtruj
        </button>
        {(cityFilter || planFilter || q) && (
          <Link
            href="/admin/firmy"
            className="px-3 py-2 text-sm text-text-secondary hover:text-navy"
          >
            Wyczyść
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="mt-4 bg-white border border-border-soft rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-heading text-[16px] text-navy">
            {list.length} {list.length === 1 ? 'firma' : 'firm'}
          </h2>
          <Link href="/firmy" className="text-[12px] text-navy hover:underline">
            Zobacz marketplace →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-dark/40 text-text-secondary">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Firma</th>
                <th className="text-left px-4 py-2 font-medium">Miasto</th>
                <th className="text-left px-4 py-2 font-medium">Plan</th>
                <th className="text-left px-4 py-2 font-medium">Ocena</th>
                <th className="text-left px-4 py-2 font-medium">Telefon</th>
                <th className="text-right px-4 py-2 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.slug} className="border-t border-border-soft hover:bg-cream-dark/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-text-muted" />
                      <Link href={`/firma/${c.slug}`} className="font-medium text-navy hover:underline">
                        {c.name}
                      </Link>
                      {c.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[11.5px] text-text-secondary ml-6">
                      {c.address || c.district}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.city}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${
                        PLAN_COLOR[c.plan] || PLAN_COLOR.free
                      }`}
                    >
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {c.rating.toFixed(1)}
                      <span className="text-text-muted text-[11.5px]">({c.reviewsCount})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-text-secondary text-[12.5px]">
                      <Phone className="w-3.5 h-3.5" />
                      {c.phone}
                      {c.phone24h && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          24/7
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/firma/${c.slug}`}
                      className="text-[12px] px-2.5 py-1 rounded border border-stone-300 text-navy hover:bg-stone-100"
                    >
                      Podgląd
                    </Link>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">
                    Brak firm pasujących do filtrów.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-4">
      <div className="text-[11.5px] text-text-secondary uppercase tracking-wide">{label}</div>
      <div className="font-heading text-[24px] text-navy mt-1">{value}</div>
      {sub && <div className="text-[11.5px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}
