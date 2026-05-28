import { Eye, Phone, Users, Star, TrendingUp, ChevronRight } from 'lucide-react';

export default function PanelDashboard() {
  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
          Witaj, Pani Anno · <span className="text-text-secondary text-[24px]">Zakład Pogrzebowy Kalla</span>
        </h1>
      </div>

      <div className="mt-7 grid md:grid-cols-4 gap-4">
        <MetricCard icon={Eye} label="Wyświetlenia profilu" value="1 247" change="+18%" green />
        <MetricCard icon={Phone} label='Kliknięcia "Zadzwoń"' value="89" />
        <MetricCard icon={Users} label="Nowe leady" value="12" />
        <MetricCard icon={Star} label="Średnia ocena" value="4.8" />
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
          <p className="text-[13px] text-text-secondary mt-1">
            w Warszawie-Mokotowie
          </p>
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
          <h3 className="font-heading text-[20px]">Ostatnie leady</h3>
          <button className="btn-ghost">Wszystkie <ChevronRight className="w-4 h-4" /></button>
        </div>
        <table className="mt-4 w-full text-[14px]">
          <thead>
            <tr className="text-left text-[12.5px] text-text-secondary uppercase tracking-wider">
              <th className="py-3 font-medium">Czas</th>
              <th className="py-3 font-medium">Miasto</th>
              <th className="py-3 font-medium">Kategoria</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {[
              ['10:45', 'Warszawa', 'Pogrzeb tradycyjny', 'Nowy', 'new'],
              ['09:15', 'Kraków', 'Kremacja', 'Oczekiwanie', 'open'],
              ['Wczoraj, 17:30', 'Wrocław', 'Transport', 'Zakończony', 'won'],
              ['Wczoraj, 14:20', 'Warszawa', 'Pogrzeb tradycyjny', 'Nowy', 'new'],
            ].map((row, i) => (
              <tr key={i}>
                <td className="py-3 text-text-secondary">{row[0]}</td>
                <td className="py-3">{row[1]}</td>
                <td className="py-3 text-text-secondary">{row[2]}</td>
                <td className="py-3">
                  <StatusBadge status={row[4] as any}>{row[3] as string}</StatusBadge>
                </td>
                <td className="py-3 text-right">
                  <button className="btn-ghost">Szczegóły</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function StatusBadge({ status, children }: { status: 'new' | 'open' | 'won' | 'lost'; children: any }) {
  const map = {
    new: 'bg-accent-green text-white',
    open: 'bg-warning/15 text-warning',
    won: 'bg-accent-green-light text-accent-green',
    lost: 'bg-border-soft text-text-muted',
  } as const;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-[11.5px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {children}
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
