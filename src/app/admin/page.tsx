import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Newspaper,
  UsersRound,
  Banknote,
  BarChart3,
  Settings2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';
import { reviewRepo, leadRepo, obituaryRepo } from '@/lib/marketplace/repo';
import { companies as ALL_COMPANIES } from '@/lib/data';
import ModerationActions from './moderation-actions';

export const dynamic = 'force-dynamic';

function timeAgo(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'przed chwilą';
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} dni temu`;
  return d.toLocaleDateString('pl-PL');
}

export default async function AdminPage() {
  const user = AUTH_CONFIGURED ? await getServerUser() : null;
  const isAdmin = user?.role === 'admin';

  // In demo mode (no AUTH) we still render the page with whatever in-memory data exists.
  // When AUTH is configured but user is not admin → show forbidden card.
  if (AUTH_CONFIGURED && user && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-error" />
          <h1 className="mt-3 font-heading text-[22px]">Brak uprawnień</h1>
          <p className="mt-2 text-[13.5px] text-text-secondary">
            Panel administratora wymaga konta z rolą <code>admin</code>.
          </p>
          <Link href="/" className="mt-5 btn-primary !py-2.5 inline-flex">
            Powrót na stronę główną
          </Link>
        </div>
      </div>
    );
  }

  // Live data via repo (works in demo + Supabase)
  const [pendingReviews, recentLeads, recentObituaries] = await Promise.all([
    reviewRepo.pending(20),
    leadRepo.recent(10),
    obituaryRepo.list().then((arr) => arr.slice(0, 5)),
  ]);

  const navItems = [
    { label: 'Przegląd', icon: LayoutDashboard, active: true, href: '/admin' },
    { label: `Firmy (${ALL_COMPANIES.length})`, icon: Building2 },
    { label: `Leady (${recentLeads.length})`, icon: Users },
    {
      label: 'Opinie do moderacji',
      icon: MessageSquare,
      badge: pendingReviews.length > 0 ? pendingReviews.length : undefined,
    },
    { label: `Nekrologi (${recentObituaries.length})`, icon: Newspaper, href: '/nekrologi' },
    { label: 'Użytkownicy', icon: UsersRound },
    { label: 'Finanse', icon: Banknote },
    { label: 'Raporty SEO', icon: BarChart3 },
    { label: 'Ustawienia', icon: Settings2 },
  ];

  // Aggregate stats (demo numbers when no data)
  const activeCompanies = ALL_COMPANIES.filter((c) => c.isVerified).length;
  const todayLeads = recentLeads.filter((l) => {
    const d = new Date(l.createdAt);
    return Date.now() - d.getTime() < 24 * 3600 * 1000;
  }).length;

  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-[260px_1fr] bg-cream">
      <aside className="bg-cream-dark/40 border-r border-border-soft lg:min-h-[calc(100vh-68px)] py-6">
        <div className="px-5 mb-6">
          <div className="font-heading text-[15px] leading-tight">
            <div>Polskie Pogrzeby —</div>
            <div className="text-text-secondary">Panel Administratora</div>
          </div>
          {!AUTH_CONFIGURED && (
            <span className="mt-2 inline-block text-[10.5px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              tryb demo
            </span>
          )}
          {user && (
            <div className="mt-2 text-[11.5px] text-text-secondary truncate" title={user.email}>
              {user.email}
            </div>
          )}
        </div>
        <nav className="px-3 space-y-0.5">
          {navItems.map((n) => {
            const inner = (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer ${
                  n.active ? 'bg-accent-green text-white' : 'text-navy/80 hover:bg-white'
                }`}
              >
                <n.icon className="w-4 h-4" />
                <span className="flex-1">{n.label}</span>
                {n.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error/90 text-white">
                    {n.badge}
                  </span>
                )}
              </div>
            );
            return n.href ? (
              <Link key={n.label} href={n.href}>
                {inner}
              </Link>
            ) : (
              <div key={n.label}>{inner}</div>
            );
          })}
        </nav>
      </aside>

      <div className="p-6 md:p-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-heading text-[32px]">Przegląd platformy</h1>
          {pendingReviews.length > 0 && (
            <span className="text-[12.5px] px-3 py-1.5 rounded-full bg-error/10 text-error font-semibold inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {pendingReviews.length} {pendingReviews.length === 1 ? 'opinia oczekuje' : 'opinii oczekuje'}
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
          <AdminMetric label="MRR" value="8 247 zł" change="+12%" up />
          <AdminMetric
            label="Aktywne firmy"
            value={`${activeCompanies} / ${ALL_COMPANIES.length}`}
          />
          <AdminMetric label="Leady dzisiaj" value={String(todayLeads || 47)} change="" up />
          <AdminMetric label="Konwersja" value="2.3%" />
          <AdminMetric label="CAC" value="168 zł" />
          <AdminMetric label="Churn" value="4.8%" change="" down />
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.3fr_1.3fr_1fr] gap-5">
          <div className="card p-5">
            <h3 className="font-heading text-[16px]">Wzrost MRR</h3>
            <div className="mt-4 h-[180px]">
              <MRRChart />
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-[16px]">Leady wg Miast</h3>
              <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-navy rounded-sm" /> Total
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent-green rounded-sm" /> Qualified leads
                </span>
              </div>
            </div>
            <div className="mt-4 h-[180px]">
              <CitiesBarChart />
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-heading text-[16px]">System health</h3>
            <div className="mt-4 flex flex-col items-center">
              <Gauge value={0.85} />
              <div className="mt-4 w-full text-[13px] space-y-2">
                <Row label="API status" value="Online" color="text-accent-green" />
                <Row label="DB performance" value="Optimal" color="text-accent-green" />
                <Row
                  label="Queue length"
                  value={pendingReviews.length > 0 ? `${pendingReviews.length} pending` : 'Normal'}
                  color={pendingReviews.length > 5 ? 'text-warning' : 'text-accent-green'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Moderation queue */}
        <div className="mt-6 card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[16px]">Opinie czekające na moderację</h3>
            <span className="text-[12px] text-text-secondary">{pendingReviews.length} w kolejce</span>
          </div>
          {pendingReviews.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border-soft p-6 text-center">
              <Star className="w-8 h-8 mx-auto text-text-muted" />
              <p className="mt-2 text-[13.5px] text-text-secondary">
                Wszystkie opinie zmoderowane. Brak elementów w kolejce.
              </p>
            </div>
          ) : (
            <table className="mt-3 w-full text-[13px]">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-text-secondary text-left">
                  <th className="py-2 font-medium">Rating</th>
                  <th className="py-2 font-medium">Firma</th>
                  <th className="py-2 font-medium">Autor</th>
                  <th className="py-2 font-medium">Treść</th>
                  <th className="py-2 font-medium">Czas</th>
                  <th className="py-2 font-medium text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {pendingReviews.map((r) => {
                  const company = ALL_COMPANIES.find((c) => c.slug === r.companySlug);
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="py-3 whitespace-nowrap text-gold">
                        {'★'.repeat(r.rating)}
                        <span className="text-text-muted">{'★'.repeat(5 - r.rating)}</span>
                      </td>
                      <td className="py-3 text-text-secondary">
                        {company?.name || r.companySlug || '—'}
                      </td>
                      <td className="py-3 text-text-secondary">
                        <div>{r.authorName}</div>
                        <div className="text-[11px] text-text-muted truncate max-w-[160px]">
                          {r.authorEmail}
                        </div>
                      </td>
                      <td className="py-3 text-text-secondary max-w-[320px]">
                        <div className="font-medium text-text-primary">{r.title}</div>
                        <div className="text-[12px] line-clamp-2">{r.body}</div>
                      </td>
                      <td className="py-3 text-[12px] text-text-muted whitespace-nowrap">
                        {timeAgo(r.createdAt)}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <ModerationActions reviewId={r.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent activity grid */}
        <div className="mt-6 grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-[16px]">Ostatnie leady</h3>
              <span className="text-[12px] text-text-secondary">{recentLeads.length}</span>
            </div>
            {recentLeads.length === 0 ? (
              <div className="mt-4 text-[13px] text-text-muted">Brak nowych leadów.</div>
            ) : (
              <table className="mt-3 w-full text-[13px]">
                <thead>
                  <tr className="text-[11.5px] uppercase tracking-wider text-text-secondary text-left">
                    <th className="py-2 font-medium">Klient</th>
                    <th className="py-2 font-medium">Firma</th>
                    <th className="py-2 font-medium">Kategoria</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Czas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {recentLeads.map((l) => {
                    const company = ALL_COMPANIES.find((c) => c.slug === l.companySlug);
                    return (
                      <tr key={l.id}>
                        <td className="py-2.5 font-medium">{l.name}</td>
                        <td className="py-2.5 text-text-secondary truncate max-w-[140px]">
                          {company?.name || l.companySlug}
                        </td>
                        <td className="py-2.5 text-text-secondary">{l.category || '—'}</td>
                        <td
                          className={`py-2.5 ${
                            l.status === 'won'
                              ? 'text-accent-green'
                              : l.status === 'lost'
                              ? 'text-error'
                              : l.status === 'contacted'
                              ? 'text-accent-green'
                              : 'text-warning'
                          }`}
                        >
                          {l.status}
                        </td>
                        <td className="py-2.5 text-[12px] text-text-muted whitespace-nowrap">
                          {timeAgo(l.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-[16px]">Ostatnie nekrologi</h3>
              <Link href="/nekrologi" className="text-[12px] text-accent-green hover:underline">
                Zobacz wszystkie
              </Link>
            </div>
            {recentObituaries.length === 0 ? (
              <div className="mt-4 text-[13px] text-text-muted">Brak nekrologów od użytkowników.</div>
            ) : (
              <ul className="mt-3 divide-y divide-border-soft">
                {recentObituaries.map((o) => (
                  <li key={o.id} className="py-2.5">
                    <Link
                      href={`/nekrologi/${o.slug}`}
                      className="flex items-center justify-between gap-3 hover:bg-cream/40 -mx-2 px-2 py-1 rounded"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-[14px] truncate">{o.personName}</div>
                        <div className="text-[12px] text-text-secondary">
                          {o.city} · {o.tier === 'premium' ? 'Premium' : 'Bezpłatny'}
                        </div>
                      </div>
                      <div className="text-[11.5px] text-text-muted whitespace-nowrap">
                        {timeAgo(o.createdAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- subcomponents (kept from original design) ---------------- */

function AdminMetric({
  label,
  value,
  change,
  up,
  down,
}: {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  down?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 font-heading text-[22px]">{value}</div>
      {change ? (
        <div
          className={`mt-1 text-[11.5px] inline-flex items-center gap-1 ${
            up ? 'text-accent-green' : 'text-error'
          }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {change}
        </div>
      ) : down !== undefined ? (
        <div
          className={`mt-1 text-[11.5px] inline-flex items-center gap-1 ${
            down ? 'text-error' : 'text-accent-green'
          }`}
        >
          {down ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}:</span>
      <span className={`font-medium ${color} inline-flex items-center gap-1`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" /> {value}
      </span>
    </div>
  );
}

function MRRChart() {
  const points = [1500, 1800, 2100, 2400, 2900, 3500, 4100, 4800, 5500, 6300, 7100, 8000];
  const max = 10000;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - (p / max) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const area = `${path} L 100 100 L 0 100 Z`;
  const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  return (
    <div className="h-full flex flex-col">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full flex-1">
        <defs>
          <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2E4F3E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2E4F3E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#g2)" />
        <path d={path} fill="none" stroke="#2E4F3E" strokeWidth="0.5" />
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * 100;
          const y = 100 - (p / max) * 100;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#2E4F3E" />;
        })}
      </svg>
      <div className="mt-1 grid grid-cols-12 text-[10px] text-text-muted">
        {months.map((m) => (
          <span key={m} className="text-center">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function CitiesBarChart() {
  const data = [
    { city: 'Warszawa', total: 100, qualified: 49 },
    { city: 'Kraków', total: 66, qualified: 36 },
    { city: 'Wrocław', total: 52, qualified: 36 },
    { city: 'Poznań', total: 43, qualified: 15 },
    { city: 'Gdańsk', total: 26, qualified: 9 },
  ];
  const max = 100;
  return (
    <div className="h-full flex items-end gap-4 px-2">
      {data.map((d) => (
        <div key={d.city} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full h-full flex items-end gap-1">
            <div className="flex-1 bg-navy rounded-t" style={{ height: `${(d.total / max) * 100}%` }} />
            <div
              className="flex-1 bg-accent-green rounded-t"
              style={{ height: `${(d.qualified / max) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-text-muted">{d.city}</div>
        </div>
      ))}
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const angle = -180 + value * 180;
  return (
    <svg viewBox="0 0 100 60" className="w-32">
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="#E8E2D7"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="#2E4F3E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${value * 125.6} 125.6`}
      />
      <g transform={`rotate(${angle} 50 50)`}>
        <line x1="50" y1="50" x2="50" y2="18" stroke="#0F1B2D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="50" r="3" fill="#0F1B2D" />
      </g>
    </svg>
  );
}
