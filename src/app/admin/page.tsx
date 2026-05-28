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
} from 'lucide-react';

const navItems = [
  { label: 'Przegląd', icon: LayoutDashboard, active: true },
  { label: 'Firmy (847)', icon: Building2 },
  { label: 'Leady', icon: Users },
  { label: 'Opinie do moderacji', icon: MessageSquare, badge: 12 },
  { label: 'Nekrologi', icon: Newspaper },
  { label: 'Użytkownicy', icon: UsersRound },
  { label: 'Finanse', icon: Banknote },
  { label: 'Raporty SEO', icon: BarChart3 },
  { label: 'Ustawienia', icon: Settings2 },
];

export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-[260px_1fr] bg-cream">
      <aside className="bg-cream-dark/40 border-r border-border-soft lg:min-h-[calc(100vh-68px)] py-6">
        <div className="px-5 mb-6">
          <div className="font-heading text-[15px] leading-tight">
            <div>Polskie Pogrzeby —</div>
            <div className="text-text-secondary">Panel Administratora</div>
          </div>
        </div>
        <nav className="px-3 space-y-0.5">
          {navItems.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer ${
                n.active ? 'bg-accent-green text-white' : 'text-navy/80 hover:bg-white'
              }`}
            >
              <n.icon className="w-4 h-4" />
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error/90 text-white">
                  {n.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="p-6 md:p-10">
        <h1 className="font-heading text-[32px]">Przegląd platformy</h1>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
          <AdminMetric label="MRR" value="8 247 zł" change="+12%" up icon="trend" />
          <AdminMetric label="Aktywne firmy" value="423 / 847" icon="bar" />
          <AdminMetric label="Leady dzisiaj" value="47" change="" up icon="trend" />
          <AdminMetric label="Konwersja" value="2.3%" icon="filter" />
          <AdminMetric label="CAC" value="168 zł" change="" up icon="coin" />
          <AdminMetric label="Churn" value="4.8%" change="" down icon="trend" />
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
                <Row label="Queue length" value="Normal" color="text-accent-green" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-heading text-[16px]">Ostatnie rejestracje firm</h3>
            <table className="mt-3 w-full text-[13.5px]">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-text-secondary text-left">
                  <th className="py-2 font-medium">Nazwa firmy</th>
                  <th className="py-2 font-medium">Data rejestracji</th>
                  <th className="py-2 font-medium">Miasto</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {[
                  ['Zakład Pogrzebowy Ikar', '12.10.2024', 'Warszawa', 'Oczekuje', 'warning'],
                  ['Dom Pogrzebowy Olimp', '11.10.2024', 'Kraków', 'Aktywny', 'success'],
                  ['Pogrzeby Hermes', '10.10.2024', 'Gdańsk', 'Oczekuje', 'warning'],
                  ['Ceremonia Plus', '09.10.2024', 'Wrocław', 'Aktywny', 'success'],
                  ['Charon Services', '08.10.2024', 'Poznań', 'Oczekuje', 'warning'],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="py-2.5 font-medium">{r[0]}</td>
                    <td className="py-2.5 text-text-secondary">{r[1]}</td>
                    <td className="py-2.5 text-text-secondary">{r[2]}</td>
                    <td className={`py-2.5 ${r[4] === 'success' ? 'text-accent-green' : 'text-warning'}`}>
                      {r[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <h3 className="font-heading text-[16px]">Opinie czekające na moderację</h3>
            <table className="mt-3 w-full text-[13px]">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-text-secondary text-left">
                  <th className="py-2 font-medium">Rating</th>
                  <th className="py-2 font-medium">Preview</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {[
                  [5, 'Bardzo profesjonalna obsługa w trudnej chwili...'],
                  [4, 'Uroczystość przebiegła sprawnie, ale...'],
                  [5, 'Dziękujemy za wsparcie i empatię.'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 whitespace-nowrap">{'★'.repeat(r[0] as number)}</td>
                    <td className="py-2.5 text-text-secondary">{r[1]}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <button className="px-2.5 py-1 bg-accent-green text-white rounded-md text-[11.5px] mr-1">
                        Zatwierdź
                      </button>
                      <button className="px-2.5 py-1 border border-error/40 text-error rounded-md text-[11.5px]">
                        Odrzuć
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminMetric({ label, value, change, up, down }: any) {
  return (
    <div className="card p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 font-heading text-[22px]">{value}</div>
      {change ? (
        <div className={`mt-1 text-[11.5px] inline-flex items-center gap-1 ${up ? 'text-accent-green' : 'text-error'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {change}
        </div>
      ) : (
        down !== undefined && (
          <div className={`mt-1 text-[11.5px] inline-flex items-center gap-1 ${down ? 'text-error' : 'text-accent-green'}`}>
            {down ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          </div>
        )
      )}
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
      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E8E2D7" strokeWidth="8" strokeLinecap="round" />
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
