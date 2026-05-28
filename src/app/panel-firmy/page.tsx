import Link from 'next/link';
import { Eye, Phone, Users, Star, TrendingUp, ChevronRight, MessageCircle, ChartLine } from 'lucide-react';
import { getServerUser, getUserCompanies, AUTH_CONFIGURED } from '@/lib/auth/session';
import { leadRepo, reviewRepo, messagingRepo } from '@/lib/marketplace/repo';
import { companies as ALL_COMPANIES } from '@/lib/data';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string): string {
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

export default async function PanelDashboard() {
  // Resolve user + first managed company (or demo fallback)
  const user = AUTH_CONFIGURED ? await getServerUser() : null;
  const companies = AUTH_CONFIGURED ? await getUserCompanies() : [];
  const firstCompany = companies[0];
  const demoCompany = ALL_COMPANIES[0];

  const companySlug = firstCompany?.slug || demoCompany.slug;
  const companyName = firstCompany?.name || demoCompany.name;

  // Live data via repo
  const [leads, reviewStats, threads] = await Promise.all([
    leadRepo.forCompany(companySlug),
    reviewRepo.averageForCompany(companySlug),
    messagingRepo.threadsForCompany(companySlug),
  ]);

  const newLeads = leads.filter((l) => l.status === 'new').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const unreadMessages = threads.reduce((a, t) => a + t.unreadForCompany, 0);

  const recentLeads = leads.slice(0, 6);

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
          Witaj,{' '}
          <span className="text-text-secondary text-[24px]">
            {user?.fullName || 'Pani Anno'} · {companyName}
          </span>
        </h1>
        {!AUTH_CONFIGURED && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo
          </span>
        )}
      </div>

      <div className="mt-7 grid md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Nowe leady"
          value={String(newLeads || 12)}
          change={newLeads ? `${newLeads} nowych` : '+18%'}
          green
        />
        <MetricCard
          icon={MessageCircle}
          label="Nieprzeczytane wiadomości"
          value={String(unreadMessages || 3)}
          change={unreadMessages ? 'wymaga odpowiedzi' : ''}
        />
        <MetricCard
          icon={Star}
          label="Średnia ocena"
          value={reviewStats.count > 0 ? reviewStats.avg.toFixed(1) : '4.8'}
          change={reviewStats.count > 0 ? `${reviewStats.count} opinii` : '147 opinii'}
        />
        <MetricCard
          icon={Phone}
          label="Wygrane leady"
          value={String(wonLeads || 8)}
          change="ostatnie 30 dni"
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[20px]">Trendy z ostatnich 30 dni</h3>
            <select className="h-9 px-3 rounded-btn border border-border-line bg-white text-[13px]">
              <option>Ostatnie 30 dni</option>
              <option>Ostatnie 7 dni</option>
              <option>Ten miesiąc</option>
            </select>
          </div>
          <div className="mt-6 h-[280px]">
            <TrendChart />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-heading text-[18px]">Twoja pozycja</h3>
          <div className="mt-3 font-heading text-[40px] leading-tight">
            #14 <span className="text-[18px] text-text-secondary">z 47 firm</span>
          </div>
          <p className="text-[13px] text-text-secondary mt-1">w Warszawie-Mokotowie</p>
          <div className="mt-5 text-[13px] text-text-secondary">Aby awansować:</div>
          <ul className="mt-2 space-y-2 text-[14px]">
            <li className="flex items-center gap-2 text-accent-green">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> +zdjęcia (+15)
            </li>
            <li className="flex items-center gap-2 text-accent-green">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> +cennik (+8)
            </li>
            <li className="flex items-center gap-2 text-accent-green">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> +opinie (+12)
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[20px]">Ostatnie leady ({leads.length})</h3>
          <Link href="/panel-firmy/leady" className="btn-ghost inline-flex items-center">
            Wszystkie <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="mt-6 text-center py-8 text-text-secondary text-sm">
            Brak leadów. Pojawią się tu, gdy klienci złożą zapytanie.
          </div>
        ) : (
          <table className="mt-4 w-full text-[14px]">
            <thead>
              <tr className="text-left text-[12.5px] text-text-secondary uppercase tracking-wider">
                <th className="py-3 font-medium">Czas</th>
                <th className="py-3 font-medium">Klient</th>
                <th className="py-3 font-medium">Miasto</th>
                <th className="py-3 font-medium">Kategoria</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {recentLeads.map((l) => (
                <tr key={l.id}>
                  <td className="py-3 text-text-secondary">{timeAgo(l.createdAt)}</td>
                  <td className="py-3">{l.name}</td>
                  <td className="py-3 text-text-secondary">{l.city || '—'}</td>
                  <td className="py-3 text-text-secondary">{l.category || '—'}</td>
                  <td className="py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/panel-firmy/leady?id=${l.id}`}
                      className="btn-ghost text-xs"
                    >
                      Szczegóły
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link href="/panel-firmy/wiadomosci" className="card p-5 hover:shadow-md transition">
          <MessageCircle className="h-6 w-6 text-accent-green mb-2" />
          <div className="font-medium">Wiadomości ({unreadMessages})</div>
          <p className="text-xs text-text-secondary mt-1">Odpowiedz klientom czekającym</p>
        </Link>
        <Link href="/panel-firmy/leady" className="card p-5 hover:shadow-md transition">
          <Users className="h-6 w-6 text-accent-green mb-2" />
          <div className="font-medium">Wszystkie leady ({leads.length})</div>
          <p className="text-xs text-text-secondary mt-1">Zarządzaj lejkiem sprzedaży</p>
        </Link>
        <Link href="/panel-firmy/profil" className="card p-5 hover:shadow-md transition">
          <ChartLine className="h-6 w-6 text-accent-green mb-2" />
          <div className="font-medium">Profil firmy</div>
          <p className="text-xs text-text-secondary mt-1">Edytuj dane, zdjęcia, cennik</p>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, green }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-cream-dark inline-flex items-center justify-center text-accent-green">
          <Icon className="w-5 h-5" strokeWidth={1.6} />
        </span>
        <div className="text-[12.5px] text-text-secondary">{label}</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="font-heading text-[30px] leading-none">{value}</div>
        {change && (
          <span className={`text-[12px] inline-flex items-center gap-1 ${green ? 'text-accent-green' : 'text-text-muted'}`}>
            <TrendingUp className="w-3.5 h-3.5" /> {change}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    new: { cls: 'bg-accent-green text-white', label: 'Nowy' },
    contacted: { cls: 'bg-warning/15 text-warning', label: 'Kontakt' },
    won: { cls: 'bg-accent-green-light text-accent-green', label: 'Wygrany' },
    lost: { cls: 'bg-border-soft text-text-muted', label: 'Przegrany' },
  };
  const v = map[status] || map.new;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-[11.5px] font-semibold uppercase tracking-wider ${v.cls}`}>
      {v.label}
    </span>
  );
}

function TrendChart() {
  const points = [200, 280, 240, 320, 290, 380, 420, 400, 480, 520, 580, 620, 700, 760, 820, 880, 940, 1000, 1080, 1140, 1200, 1260, 1280, 1340, 1380, 1420, 1420, 1380, 1420, 1340];
  const max = 1500;
  const w = 100;
  const h = 100;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2E4F3E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2E4F3E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path d={path} fill="none" stroke="#2E4F3E" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
      {[0, 250, 500, 750, 1000, 1250, 1500].map((v) => {
        const y = h - (v / max) * h;
        return <line key={v} x1="0" x2={w} y1={y} y2={y} stroke="#E8E2D7" strokeWidth="0.2" />;
      })}
    </svg>
  );
}
