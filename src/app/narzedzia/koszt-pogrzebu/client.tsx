'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Info, ChevronLeft, Download, ArrowRight, Calculator } from 'lucide-react';
import {
  calcFuneralCost,
  fmtPLN,
  type FuneralType,
  type CoffinTier,
} from '@/lib/tools/calculators';

const CITIES = [
  'Warszawa',
  'Kraków',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Łódź',
  'Szczecin',
  'Bydgoszcz',
  'Lublin',
  'Katowice',
  'Białystok',
  'Inne',
];

export default function KosztPogrzebuClient() {
  const [city, setCity] = useState('Warszawa');
  const [type, setType] = useState<FuneralType>('tradycyjny');
  const [coffin, setCoffin] = useState<CoffinTier>('sredni');
  const [opts, setOpts] = useState({
    ceremony: true,
    flowers: true,
    transport: true,
    stipa: false,
    cemetery: true,
  });
  const [attendees, setAttendees] = useState(30);

  const result = useMemo(
    () =>
      calcFuneralCost({
        city,
        type,
        coffin,
        ...opts,
        attendees,
      }),
    [city, type, coffin, opts, attendees],
  );

  function download() {
    const lines = [
      'PolskiePogrzeby.pl — Szacunkowy koszt pogrzebu',
      '='.repeat(50),
      `Miasto: ${city}`,
      `Typ: ${type}`,
      `Trumna/urna: ${coffin}`,
      '',
      ...result.lines.map((l) => `${l.label.padEnd(40)} ${fmtPLN(l.amount)}`),
      '-'.repeat(50),
      `Razem:                                  ${fmtPLN(result.subtotal)}`,
      `Zasiłek ZUS (orientacyjnie):           − ${fmtPLN(result.zusBenefit)}`,
      `Do zapłaty z własnej kieszeni:          ${fmtPLN(result.outOfPocket)}`,
      '',
      `Wygenerowano: ${new Date().toLocaleString('pl-PL')}`,
      'To jest tylko szacunek — ostateczna cena zależy od konkretnej oferty.',
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koszt-pogrzebu-${city.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)] py-10">
      <div className="container-page max-w-5xl">
        <Link
          href="/narzedzia"
          className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-accent-green"
        >
          <ChevronLeft className="w-4 h-4" /> Wszystkie narzędzia
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Kalkulator kosztu pogrzebu
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Szacunek na podstawie średnich cen 2026. Wynik aktualizuje się na bieżąco.
            </p>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Form */}
          <div className="card p-6 md:p-7 space-y-6">
            <div>
              <label className="label">Miasto</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Rodzaj pogrzebu</label>
              <div className="grid grid-cols-3 gap-2">
                {(['tradycyjny', 'kremacja', 'ekologiczny'] as FuneralType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-3 rounded-lg text-[13.5px] font-semibold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-accent-green/40 ${
                      type === t
                        ? 'bg-accent-green text-white'
                        : 'bg-cream-dark/40 text-navy hover:bg-cream-dark/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                {type === 'kremacja' ? 'Urna' : 'Trumna'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['standard', 'sredni', 'premium', 'luksus'] as CoffinTier[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoffin(c)}
                    className={`px-2 py-3 rounded-lg text-[12.5px] font-semibold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-accent-green/40 ${
                      coffin === c
                        ? 'bg-accent-green text-white'
                        : 'bg-cream-dark/40 text-navy hover:bg-cream-dark/60'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Co ma być wliczone</label>
              <div className="space-y-2">
                {[
                  { key: 'ceremony', label: 'Ceremonia (kaplica + celebrant)' },
                  { key: 'flowers', label: 'Kwiaty i wieńce' },
                  { key: 'transport', label: 'Transport zmarłego + karawan' },
                  { key: 'cemetery', label: type === 'kremacja' ? 'Opłata za niszę' : 'Opłata cmentarna' },
                  { key: 'stipa', label: 'Stypa / catering' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border-soft hover:bg-cream/40 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-accent-green"
                      checked={opts[key as keyof typeof opts]}
                      onChange={(e) =>
                        setOpts((o) => ({ ...o, [key]: e.target.checked }))
                      }
                    />
                    <span className="text-[14px]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {opts.stipa && (
              <div>
                <label className="label">Liczba gości na stypie: {attendees}</label>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  className="w-full accent-accent-green"
                />
              </div>
            )}

            <div className="rounded-lg bg-accent-green-light/40 border border-accent-green/20 p-4 flex gap-3">
              <Info className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-text-secondary leading-relaxed">
                To jest szacunek na podstawie średnich cen 2026 — nie oferta. Dokładną cenę
                otrzymasz po wysłaniu zapytania do wybranego zakładu pogrzebowego.
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="card p-6">
              <div className="text-[11.5px] uppercase tracking-wider text-text-secondary">
                Szacunkowy koszt całkowity
              </div>
              <div className="mt-1 font-heading text-[36px] leading-none">
                {fmtPLN(result.subtotal)}
              </div>
              <div className="mt-2 text-[12.5px] text-text-muted">
                Mnożnik miasta: ×{result.cityMultiplier.toFixed(2)}
              </div>

              <ul className="mt-5 space-y-1.5 text-[13px]">
                {result.lines.map((l) => (
                  <li key={l.label} className="flex justify-between gap-3">
                    <span className="text-text-secondary">
                      {l.label}
                      {l.note && (
                        <span className="block text-[11px] text-text-muted">{l.note}</span>
                      )}
                    </span>
                    <span className="font-medium tabular-nums">{fmtPLN(l.amount)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-border-soft space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Razem</span>
                  <span className="font-semibold tabular-nums">{fmtPLN(result.subtotal)}</span>
                </div>
                <div className="flex justify-between text-accent-green">
                  <span>Zasiłek pogrzebowy ZUS</span>
                  <span className="font-semibold tabular-nums">
                    − {fmtPLN(result.zusBenefit)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-soft">
                  <span className="font-semibold">Z własnej kieszeni</span>
                  <span className="font-heading text-[18px] tabular-nums">
                    {fmtPLN(result.outOfPocket)}
                  </span>
                </div>
              </div>

              <button
                onClick={download}
                className="mt-5 w-full btn-secondary !py-2.5 text-[13px] inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Pobierz wycenę (.txt)
              </button>
            </div>

            <Link
              href="/zapytanie"
              className="card p-5 block hover:shadow-card transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[14px]">
                    Otrzymaj realną wycenę od&nbsp;firm
                  </div>
                  <div className="text-[12px] text-text-secondary mt-0.5">
                    Bezpłatnie · 3 oferty w&nbsp;24h
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-accent-green" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
