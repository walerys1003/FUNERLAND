'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Scale, Plus, Trash2, Trophy } from 'lucide-react';
import { compareOffers, fmtPLN, type OfferInput } from '@/lib/tools/calculators';

type Draft = OfferInput & { id: string };

const newDraft = (i: number): Draft => ({
  id: Math.random().toString(36).slice(2, 8),
  name: `Oferta ${i}`,
  service: 0,
  coffin: 0,
  ceremony: 0,
  extras: 0,
  rating: 4.5,
  responseHours: 6,
});

export default function PorownajClient() {
  const [offers, setOffers] = useState<Draft[]>([newDraft(1), newDraft(2)]);

  const scored = useMemo(() => compareOffers(offers), [offers]);

  function update(id: string, patch: Partial<Draft>) {
    setOffers((arr) => arr.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function add() {
    if (offers.length >= 4) return;
    setOffers((arr) => [...arr, newDraft(arr.length + 1)]);
  }

  function remove(id: string) {
    if (offers.length <= 2) return;
    setOffers((arr) => arr.filter((o) => o.id !== id));
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
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Porównywarka ofert pogrzebowych
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Wpisz parametry 2–4 ofert. Algorytm uszereguje je po jakości, cenie i&nbsp;czasie odpowiedzi.
            </p>
          </div>
        </div>

        {/* Forms */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => (
            <div key={o.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  className="input !h-9 !px-3 !text-[13.5px] font-semibold"
                  value={o.name}
                  onChange={(e) => update(o.id, { name: e.target.value })}
                />
                {offers.length > 2 && (
                  <button
                    onClick={() => remove(o.id)}
                    className="text-text-muted hover:text-error p-1.5"
                    aria-label="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <NumField
                label="Obsługa zakładu (zł)"
                value={o.service}
                onChange={(v) => update(o.id, { service: v })}
              />
              <NumField
                label="Trumna / urna (zł)"
                value={o.coffin}
                onChange={(v) => update(o.id, { coffin: v })}
              />
              <NumField
                label="Ceremonia (zł)"
                value={o.ceremony}
                onChange={(v) => update(o.id, { ceremony: v })}
              />
              <NumField
                label="Dodatki (kwiaty/transport, zł)"
                value={o.extras}
                onChange={(v) => update(o.id, { extras: v })}
              />
              <NumField
                label="Ocena Google (1–5)"
                value={o.rating || 0}
                step={0.1}
                max={5}
                onChange={(v) => update(o.id, { rating: v })}
              />
              <NumField
                label="Czas odpowiedzi (godz.)"
                value={o.responseHours || 0}
                onChange={(v) => update(o.id, { responseHours: v })}
              />
            </div>
          ))}

          {offers.length < 4 && (
            <button
              onClick={add}
              className="card p-5 flex flex-col items-center justify-center text-text-muted hover:text-accent-green hover:border-accent-green/40 transition-colors min-h-[280px]"
            >
              <Plus className="w-6 h-6" />
              <span className="mt-2 text-[13px] font-semibold">Dodaj ofertę</span>
            </button>
          )}
        </div>

        {/* Ranking */}
        <h2 className="mt-10 font-heading text-[22px]">Ranking</h2>
        <div className="mt-4 space-y-3">
          {scored.map((s) => (
            <div
              key={s.name}
              className={`card p-5 ${s.rank === 1 ? 'border-accent-green/40 bg-accent-green-light/30' : ''}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-heading text-[18px] ${
                      s.rank === 1
                        ? 'bg-accent-green text-white'
                        : 'bg-cream-dark/60 text-text-secondary'
                    }`}
                  >
                    {s.rank === 1 ? <Trophy className="w-4 h-4" /> : s.rank}
                  </span>
                  <div>
                    <div className="font-heading text-[18px]">{s.name}</div>
                    {s.recommendation && (
                      <div className="text-[12px] text-accent-green font-semibold">
                        {s.recommendation}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-[22px] tabular-nums">{fmtPLN(s.total)}</div>
                  <div className="text-[11.5px] text-text-secondary">
                    Wynik: {s.scoreOverall}/100
                  </div>
                </div>
              </div>

              {/* Score bars */}
              <div className="mt-4 grid md:grid-cols-3 gap-3 text-[11.5px]">
                <Bar label="Cena" score={s.scoreValue} />
                <Bar label="Jakość" score={s.scoreQuality} />
                <Bar label="Szybkość" score={s.scoreSpeed} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-[11.5px] text-text-secondary mb-0.5">{label}</label>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="input !h-9 !px-3 !text-[13.5px]"
      />
    </div>
  );
}

function Bar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-text-secondary">
        <span>{label}</span>
        <span className="tabular-nums">{score}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-cream-dark/40 overflow-hidden">
        <div
          className="h-full bg-accent-green transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
