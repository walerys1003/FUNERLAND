'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Banknote,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Info,
} from 'lucide-react';
import { calcZasilek, fmtPLN } from '@/lib/tools/calculators';

export default function ZasilekPogrzebowyClient() {
  const [isInsured, setIsInsured] = useState(true);
  const [isFamily, setIsFamily] = useState(true);
  const [actualCosts, setActualCosts] = useState(8000);

  const result = useMemo(
    () => calcZasilek({ isInsured, isFamily, actualCosts }),
    [isInsured, isFamily, actualCosts],
  );

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)] py-10">
      <div className="container-page max-w-4xl">
        <Link
          href="/narzedzia"
          className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-accent-green"
        >
          <ChevronLeft className="w-4 h-4" /> Wszystkie narzędzia
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Zasiłek pogrzebowy ZUS
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Sprawdź, czy Ci się należy i&nbsp;na jakich zasadach. Kwota od 2011: <strong>4 000 zł</strong>.
            </p>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">
                Czy zmarły był ubezpieczony (ZUS / KRUS / emerytura / renta)?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleBtn active={isInsured} onClick={() => setIsInsured(true)} label="Tak" />
                <ToggleBtn active={!isInsured} onClick={() => setIsInsured(false)} label="Nie" />
              </div>
            </div>

            <div>
              <label className="label">Czy jesteś członkiem rodziny zmarłego?</label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleBtn active={isFamily} onClick={() => setIsFamily(true)} label="Tak (rodzina)" />
                <ToggleBtn
                  active={!isFamily}
                  onClick={() => setIsFamily(false)}
                  label="Nie (spoza rodziny)"
                />
              </div>
              <p className="mt-2 text-[11.5px] text-text-muted">
                Rodzina = małżonek, dzieci, rodzice, dziadkowie, wnuki, rodzeństwo.
              </p>
            </div>

            {!isFamily && isInsured && (
              <div>
                <label className="label">
                  Udokumentowane koszty pogrzebu (zł)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  className="input"
                  value={actualCosts}
                  onChange={(e) => setActualCosts(Number(e.target.value) || 0)}
                />
                <p className="mt-1 text-[11.5px] text-text-muted">
                  Dla osób spoza rodziny zasiłek nie może przekroczyć faktycznych kosztów.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-accent-green-light/40 border border-accent-green/20 p-4 flex gap-3">
              <Info className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-text-secondary leading-relaxed">
                Wynik to informacja — ostateczną decyzję wydaje ZUS na podstawie złożonego wniosku
                Z-12 oraz dokumentów.
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <div
              className={`card p-6 ${
                result.eligible ? 'border-accent-green/30 bg-accent-green-light/30' : 'border-error/30 bg-error/5'
              }`}
            >
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider font-semibold">
                {result.eligible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-accent-green" />
                    <span className="text-accent-green">Zasiłek przysługuje</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-error" />
                    <span className="text-error">Brak prawa do zasiłku</span>
                  </>
                )}
              </div>
              <div className="mt-2 font-heading text-[36px] leading-none">
                {fmtPLN(result.amount)}
              </div>
              <p className="mt-3 text-[13px] text-text-secondary leading-relaxed">
                {result.reason}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-text-muted">
                <Clock className="w-3.5 h-3.5" />
                Termin złożenia wniosku: {result.deadline}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-accent-green" />
                <h2 className="font-heading text-[16px]">Wymagane dokumenty</h2>
              </div>
              <ul className="space-y-1.5 text-[13px] text-text-secondary">
                {result.documents.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent-green font-semibold shrink-0">{i + 1}.</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/narzedzia/dokumenty"
                className="mt-4 inline-flex items-center gap-1 text-[13px] text-accent-green font-semibold hover:underline"
              >
                Wygeneruj wniosek →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="font-heading text-[20px]">Najczęstsze pytania</h2>
          <div className="mt-4 space-y-2.5">
            {FAQ.map((f) => (
              <details key={f.q} className="card p-4 group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between text-[14px]">
                  {f.q}
                  <span className="text-accent-green group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[13.5px] text-text-secondary leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-3 rounded-lg text-[14px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent-green/40 ${
        active
          ? 'bg-accent-green text-white'
          : 'bg-cream-dark/40 text-navy hover:bg-cream-dark/60'
      }`}
    >
      {label}
    </button>
  );
}

const FAQ = [
  {
    q: 'Czy zasiłek dotyczy każdej śmierci?',
    a: 'Nie — tylko gdy zmarły był ubezpieczony, pobierał emeryturę/rentę, albo spełniał warunki do jednego z tych świadczeń. Dotyczy też członków rodziny ubezpieczonego.',
  },
  {
    q: 'Czy 4 000 zł to kwota stała?',
    a: 'Tak — kwota nie była waloryzowana od 2011 roku. W planach na 2026 jest podwyżka, ale aktualnie obowiązuje 4 000 zł.',
  },
  {
    q: 'Kto składa wniosek?',
    a: 'Osoba, która faktycznie pokryła koszty pogrzebu — niekoniecznie członek rodziny. Wniosek wraz z fakturami składa się do ZUS lub KRUS (rolnicy).',
  },
  {
    q: 'Ile czeka się na wypłatę?',
    a: 'Standardowo do 30 dni od złożenia kompletnego wniosku. Jeśli dokumenty są w porządku, wypłata zwykle następuje szybciej.',
  },
];
