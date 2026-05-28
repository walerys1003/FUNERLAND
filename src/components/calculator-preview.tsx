import Link from 'next/link';
import { CheckCircle2, FileDown, Save, Info } from 'lucide-react';

const breakdown = [
  { label: 'Trumna sosna szlachetna', range: '1 200 – 4 000 zł', pct: 35, color: '#0F1B2D' },
  { label: 'Miejsce na cmentarzu', range: '2 000 – 7 000 zł', pct: 25, color: '#7C8D8C' },
  { label: 'Msza i opłaty kościelne', range: '600 – 1 300 zł', pct: 18, color: '#2E4F3E' },
  { label: 'Przygotowanie i ubiór', range: '800 – 1 500 zł', pct: 10, color: '#C9A65F' },
  { label: 'Transport zwłok i gości', range: '1 000 – 2 200 zł', pct: 7, color: '#9B8050' },
  { label: 'Opłaty administracyjne', range: '400 – 800 zł', pct: 5, color: '#A8B0A4' },
];

export function CalculatorPreview() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="card p-6 md:p-10">
          <div className="grid lg:grid-cols-[1.05fr_1.1fr] gap-8 lg:gap-12 items-start">
            <div>
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-full bg-accent-green-light text-accent-green inline-flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <div>
                  <div className="text-[13.5px] text-text-secondary">
                    Szacunkowy koszt pogrzebu w Warszawie
                  </div>
                  <div className="font-heading text-[48px] md:text-[56px] leading-none mt-1">
                    11 850 zł
                  </div>
                  <div className="mt-2 text-[13px] text-text-muted">Zakres: 10 200 – 13 500 zł</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-[120px_1fr] gap-6 items-center">
                <DonutChart segments={breakdown} />
                <ul className="space-y-2 text-[13px]">
                  {breakdown.map((b) => (
                    <li key={b.label} className="flex items-center gap-2 text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
                      <span>
                        <span className="font-medium text-navy">{b.pct}%</span> {b.label.split(' ')[0]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-navy p-4">
                  <div className="text-[12px] text-text-secondary">Zasiłek ZUS pokrywa</div>
                  <div className="font-heading text-[22px] mt-0.5">4 000 zł</div>
                </div>
                <div className="rounded-xl border-2 border-navy p-4">
                  <div className="text-[12px] text-text-secondary">Twój wkład własny</div>
                  <div className="font-heading text-[22px] mt-0.5">~7 850 zł</div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-2">
                {breakdown.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-soft bg-cream/60"
                  >
                    <span className="text-[13.5px] text-navy">{b.label}</span>
                    <span className="text-[13.5px] font-medium text-navy flex items-center gap-2">
                      {b.range}
                      <Info className="w-3.5 h-3.5 text-text-muted" />
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-soft bg-cream/60">
                  <span className="text-[13.5px] text-navy">Kwiaty, nekrologi i inne dodatki</span>
                  <span className="text-[13.5px] font-medium text-navy">500 – 1 200 zł</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/kalkulator" className="btn-primary">
                  Otrzymaj 3 dokładne wyceny od firm w Warszawie
                </Link>
                <button className="btn-secondary">
                  <FileDown className="w-4 h-4" /> Pobierz wynik jako PDF
                </button>
                <button className="btn-secondary">
                  <Save className="w-4 h-4" /> Zapisz na koncie
                </button>
              </div>
              <p className="mt-5 text-center text-[12.5px] text-text-muted">
                Oparte na <span className="font-semibold text-navy">12 000 rzeczywistych pogrzebach</span> w Twoim mieście
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const size = 120;
  const r = 48;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8E2D7" strokeWidth="10" />
      {segments.map((s, i) => {
        const length = (s.pct / 100) * c;
        const circle = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={`${length} ${c - length}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
        offset += length + 1;
        return circle;
      })}
    </svg>
  );
}
