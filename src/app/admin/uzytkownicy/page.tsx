import Link from 'next/link';
import { UsersRound, Shield, Building2, Users as UsersIcon, Mail } from 'lucide-react';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { AUTH_CONFIGURED } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Użytkownicy — Admin' };

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: 'family' | 'company' | 'admin' | null;
  city?: string | null;
  phone?: string | null;
  created_at?: string | null;
};

const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  company: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  family: 'bg-stone-100 text-stone-700 border-stone-200',
};

async function loadProfiles(): Promise<{ rows: ProfileRow[]; error: string | null }> {
  if (!AUTH_CONFIGURED) {
    // Demo dataset
    return {
      rows: [
        {
          id: 'demo-1',
          email: 'admin@polskiepogrzeby.pl',
          full_name: 'Admin Główny',
          role: 'admin',
          city: 'Warszawa',
          created_at: new Date(Date.now() - 30 * 86400_000).toISOString(),
        },
        {
          id: 'demo-2',
          email: 'kontakt@kalla.pl',
          full_name: 'Anna Kalla',
          role: 'company',
          city: 'Warszawa',
          created_at: new Date(Date.now() - 14 * 86400_000).toISOString(),
        },
        {
          id: 'demo-3',
          email: 'jan.kowalski@example.com',
          full_name: 'Jan Kowalski',
          role: 'family',
          city: 'Kraków',
          created_at: new Date(Date.now() - 3 * 86400_000).toISOString(),
        },
        {
          id: 'demo-4',
          email: 'maria.nowak@example.com',
          full_name: 'Maria Nowak',
          role: 'family',
          city: 'Wrocław',
          created_at: new Date(Date.now() - 1 * 86400_000).toISOString(),
        },
      ],
      error: null,
    };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, city, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return { rows: [], error: error.message };
    return { rows: (data || []) as ProfileRow[], error: null };
  } catch (e: any) {
    return { rows: [], error: e?.message || 'unknown' };
  }
}

export default async function AdminUzytkownicyPage({
  searchParams,
}: {
  searchParams: Promise<{ rola?: string; q?: string }>;
}) {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const sp = await searchParams;
  const roleFilter = sp.rola;
  const q = sp.q?.toLowerCase().trim();

  const { rows, error } = await loadProfiles();
  let list = rows;
  if (roleFilter && roleFilter !== 'all') list = list.filter((r) => r.role === roleFilter);
  if (q)
    list = list.filter(
      (r) =>
        (r.email || '').toLowerCase().includes(q) ||
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.city || '').toLowerCase().includes(q),
    );

  const stats = {
    total: rows.length,
    admin: rows.filter((r) => r.role === 'admin').length,
    company: rows.filter((r) => r.role === 'company').length,
    family: rows.filter((r) => r.role === 'family').length,
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Użytkownicy</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Konta, role (RBAC), weryfikacja. Edycja roli — sekcja Ustawienia.
          </p>
        </div>
        {access.demo && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo — dane przykładowe
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Wszyscy" value={stats.total} icon={UsersRound} />
        <Stat label="Rodziny" value={stats.family} icon={UsersIcon} />
        <Stat label="Firmy" value={stats.company} icon={Building2} />
        <Stat label="Adminowie" value={stats.admin} icon={Shield} />
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-end gap-2 bg-white border border-border-soft rounded-2xl p-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] text-text-secondary mb-1">Szukaj</label>
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="email, nazwa, miasto…"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-secondary mb-1">Rola</label>
          <select
            name="rola"
            defaultValue={roleFilter || ''}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
          >
            <option value="">Wszystkie</option>
            <option value="family">Rodzina</option>
            <option value="company">Firma</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90"
        >
          Filtruj
        </button>
        {(roleFilter || q) && (
          <Link href="/admin/uzytkownicy" className="px-3 py-2 text-sm text-text-secondary hover:text-navy">
            Wyczyść
          </Link>
        )}
      </form>

      {error && (
        <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
          Błąd podczas pobierania użytkowników: {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-4 bg-white border border-border-soft rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-heading text-[16px] text-navy">
            {list.length} {list.length === 1 ? 'użytkownik' : 'użytkowników'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-dark/40 text-text-secondary">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Użytkownik</th>
                <th className="text-left px-4 py-2 font-medium">Rola</th>
                <th className="text-left px-4 py-2 font-medium">Miasto</th>
                <th className="text-left px-4 py-2 font-medium">Rejestracja</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t border-border-soft hover:bg-cream-dark/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">
                      {u.full_name || <span className="text-text-muted italic">bez imienia</span>}
                    </div>
                    <div className="text-[11.5px] text-text-secondary mt-0.5 inline-flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {u.email || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${
                        ROLE_COLOR[u.role || 'family']
                      }`}
                    >
                      {u.role || 'family'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{u.city || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-[12.5px]">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-text-muted text-sm">
                    <UsersRound className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Brak użytkowników pasujących do filtrów.
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
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11.5px] text-text-secondary uppercase tracking-wide">{label}</div>
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="font-heading text-[24px] text-navy mt-1">{value}</div>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}
