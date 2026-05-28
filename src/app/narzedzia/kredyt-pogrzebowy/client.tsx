'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, PiggyBank, Info } from 'lucide-react';
import { calcLoan, fmtPLN2 } from '@/lib/tools/calculators';

export default function KredytClient() {
  const [amount, setAmount] = useState(8000);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(12.5);

  const result = useMemo(
    () => calcLoan({ amount, months, annualRate: rate }),
    [amount, months, rate],
  );

  const schedule = useMemo(() => {
    // amortization schedule (first 6 + last)
    const r = rate / 100 / 12;
    let balance = amount;
    const rows: { idx: number; principal: number; interest: number; balance: number }[] = [];
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      const principal = result.monthly - interest;
      balance = Math.max(0, balance - principal);
      rows.push({ idx: i, principal, interest, balance });
    }
    return rows;
  }, [amount, months, rate, result.monthly]);

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
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Kalkulator rat kredytu pogrzebowego
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Wybierz kwotę, okres spłaty i&nbsp;oprocentowanie. Wynik aktualizuje się od razu.
            </p>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Form */}
          <div className="card p-6 md:p-7 space-y-6">
            <Slider
              label={`Kwota kredytu: ${fmtPLN2(amount)}`}
              value={amount}
              min={1000}
              max={50000}
              step={500}
              onChange={setAmount}
            />
            <Slider
              label={`Okres spłaty: ${months} miesięcy (${Math.round((months / 12) * 10) / 10} lat)`}
              value={months}
              min={6}
              max={84}
              step={1}
              onChange={setMonths}
            />
            <Slider
              label={`Oprocentowanie roczne: ${rate.toFixed(1)}%`}
              value={rate * 10}
              min={0}
              max={300}
              step={1}
              onChange={(v) => setRate(v / 10)}
            />

            <div className="rounded-lg bg-accent-green-light/40 border border-accent-green/20 p-4 flex gap-3">
              <Info className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-text-secondary leading-relaxed">
                To kalkulator orientacyjny — bez prowizji i&nbsp;dodatkowych kosztów banku.
                Rzeczywiste RRSO zależy od konkretnej oferty.
              </p>
            </div>

            {/* Amortization preview */}
            <div>
              <h2 className="font-heading text-[15px] mb-3">Harmonogram (pierwsze raty)</h2>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-wider text-text-secondary">
                      <th className="px-2 py-1.5 text-left">Rata</th>
                      <th className="px-2 py-1.5 text-right">Kapitał</th>
                      <th className="px-2 py-1.5 text-right">Odsetki</th>
                      <th className="px-2 py-1.5 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {schedule.slice(0, 6).map((r) => (
                      <tr key={r.idx}>
                        <td className="px-2 py-1.5">{r.idx}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {fmtPLN2(r.principal)}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">
                          {fmtPLN2(r.interest)}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {fmtPLN2(r.balance)}
                        </td>
                      </tr>
                    ))}
                    {schedule.length > 6 && (
                      <tr>
                        <td colSpan={4} className="text-center py-1.5 text-text-muted">
                          …
                        </td>
                      </tr>
                    )}
                    {schedule.length > 0 && (
                      <tr className="bg-cream/40">
                        <td className="px-2 py-1.5 font-semibold">
                          {schedule[schedule.length - 1].idx}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {fmtPLN2(schedule[schedule.length - 1].principal)}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {fmtPLN2(schedule[schedule.length - 1].interest)}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                          {fmtPLN2(schedule[schedule.length - 1].balance)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="card p-6">
              <div className="text-[11.5px] uppercase tracking-wider text-text-secondary">
                Rata miesięczna
              </div>
              <div className="mt-1 font-heading text-[36px] leading-none">
                {fmtPLN2(result.monthly)}
              </div>

              <div className="mt-5 pt-4 border-t border-border-soft space-y-1.5 text-[13px]">
                <Row label="Kwota kredytu" value={fmtPLN2(amount)} />
                <Row label="Łącznie do spłaty" value={fmtPLN2(result.totalPaid)} />
                <Row
                  label="Suma odsetek"
                  value={fmtPLN2(result.totalInterest)}
                  className="text-error"
                />
                <Row label="RRSO" value={`${result.rrso.toFixed(1)}%`} />
              </div>
            </div>

            <div className="card p-5 bg-cream-dark/30">
              <h3 className="font-heading text-[14px]">Alternatywa — zasiłek ZUS</h3>
              <p className="mt-1 text-[12.5px] text-text-secondary leading-relaxed">
                Pamiętaj o zasiłku pogrzebowym — 4 000 zł zmniejszy potrzebną kwotę kredytu.
              </p>
              <Link
                href="/narzedzia/zasilek-pogrzebowy"
                className="mt-2 inline-flex text-[12.5px] text-accent-green font-semibold hover:underline"
              >
                Sprawdź zasiłek →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent-green"
      />
      <div className="mt-1 flex justify-between text-[10.5px] text-text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-semibold tabular-nums ${className}`}>{value}</span>
    </div>
  );
}
