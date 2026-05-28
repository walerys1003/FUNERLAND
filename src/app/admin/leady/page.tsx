import Link from 'next/link';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { leadStore } from '@/lib/marketplace/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leady — Admin' };

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-stone-100 text-stone-500 border-stone-200',
};

const SOURCE_LABEL: Record<string, string> = {
  booking: 'Rezerwacja',
  zapytanie: 'Zapytanie',
  'company-page': 'Strona firmy',
  'ai-match': 'AI Match',
};

export default async function AdminLeadyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const sp = await searchParams;
  const statusFilter = sp.status;

  let leads = leadStore.recent(200);
  if (statusFilter && statusFilter !== 'all') {
    leads = leads.filter((l) => l.status === statusFilter);
  }

  const stats = {
    total: leadStore.recent(1000).length,
    new: leadStore.recent(1000).filter((l) => l.status === 'new').length,
    contacted: leadStore.recent(1000).filter((l) => l.status === 'contacted').length,
    won: leadStore.recent(1000).filter((l) => l.status === 'won').length,
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Leady</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Zgłoszenia od rodzin do firm — przegląd, status, monitoring.
          </p>
        </div>
        {access.demo && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Wszystkie" value={stats.total} />
        <Stat label="Nowe" value={stats.new} tone="blue" />
        <Stat label="W kontakcie" value={stats.contacted} tone="amber" />
        <Stat label="Wygrane" value={stats.won} tone="emerald" />
      </div>

      {/* Status tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-border-soft">
        <Tab href="/admin/leady" active={!statusFilter} label="Wszystkie" />
        <Tab href="/admin/leady?status=new" active={statusFilter === 'new'} label="Nowe" />
        <Tab href="/admin/leady?status=contacted" active={statusFilter === 'contacted'} label="W kontakcie" />
        <Tab href="/admin/leady?status=won" active={statusFilter === 'won'} label="Wygrane" />
        <Tab href="/admin/leady?status=lost" active={statusFilter === 'lost'} label="Przegrane" />
      </div>

      {/* Table */}
      <div className="mt-4 bg-white border border-border-soft rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-dark/40 text-text-secondary">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Kontakt</th>
                <th className="text-left px-4 py-2 font-medium">Firma</th>
                <th className="text-left px-4 py-2 font-medium">Źródło</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-border-soft hover:bg-cream-dark/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      {l.name}
                    </div>
                    <div className="text-[11.5px] text-text-secondary ml-5 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {l.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {l.phone}
                      </span>
                      {l.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {l.city}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {l.companySlug ? (
                      <Link href={`/firma/${l.companySlug}`} className="text-navy hover:underline">
                        {l.companySlug}
                      </Link>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                    {l.category && (
                      <div className="text-[11.5px] text-text-secondary mt-0.5">{l.category}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {SOURCE_LABEL[l.source] || l.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${
                        STATUS_COLOR[l.status] || STATUS_COLOR.new
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-[12.5px]">
                    {formatDate(l.createdAt)}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Brak leadów{statusFilter ? ` o statusie "${statusFilter}"` : ''}.
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'blue' | 'amber' | 'emerald';
}) {
  const color =
    tone === 'blue'
      ? 'text-blue-700'
      : tone === 'amber'
        ? 'text-amber-700'
        : tone === 'emerald'
          ? 'text-emerald-700'
          : 'text-navy';
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-4">
      <div className="text-[11.5px] text-text-secondary uppercase tracking-wide">{label}</div>
      <div className={`font-heading text-[24px] mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-[13px] border-b-2 -mb-px ${
        active
          ? 'border-navy text-navy font-medium'
          : 'border-transparent text-text-secondary hover:text-navy'
      }`}
    >
      {label}
    </Link>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}
