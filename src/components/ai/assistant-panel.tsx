'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, Star, ShieldCheck, ArrowRight, Send } from 'lucide-react';

const CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Łódź', 'Lublin', 'Poznań', 'Gdańsk'];
const BUDGETS = [
  { id: 'do-3000', label: 'do 3 000 zł' },
  { id: '3000-5000', label: '3 000 – 5 000 zł' },
  { id: '5000-8000', label: '5 000 – 8 000 zł' },
  { id: 'powyzej-8000', label: 'powyżej 8 000 zł' },
  { id: 'bez-limitu', label: 'bez limitu' },
];
const URGENCIES = [
  { id: 'do-3-dni', label: 'do 3 dni' },
  { id: '3-7-dni', label: '3–7 dni' },
  { id: 'powyzej-tygodnia', label: 'powyżej tygodnia' },
];
const NEEDS = ['transmisja online', 'kwiaty', 'transport', 'kremacja', 'sala', 'nekrolog', 'ceremoniarz'];

type Match = {
  slug: string;
  name: string;
  city: string;
  rating: number;
  priceFrom?: number;
  isVerified: boolean;
  matchScore: number;
  rationale: string[];
  scoreBreakdown: { label: string; points: number }[];
};

export default function AssistantPanel() {
  const [step, setStep] = useState<1 | 2>(1);
  const [city, setCity] = useState('Warszawa');
  const [budget, setBudget] = useState('3000-5000');
  const [urgency, setUrgency] = useState('do-3-dni');
  const [needs, setNeeds] = useState<string[]>([]);
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ matches: Match[]; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleNeed(n: string) {
    setNeeds((arr) => (arr.includes(n) ? arr.filter((x) => x !== n) : [...arr, n]));
  }

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const finalNeeds = [...needs];
      if (extra.trim()) finalNeeds.push(extra.trim());
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, budget, urgency, needs: finalNeeds, limit: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd matchera');
      setResult(data);
      setStep(2);
    } catch (e: any) {
      setError(e.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  }

  if (step === 2 && result) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#2E4F3E]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Wyniki dopasowania</span>
          </div>
          <p className="text-sm text-stone-700 mt-2">{result.summary}</p>
        </div>

        {result.matches.map((m, i) => (
          <div
            key={m.slug}
            className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-stone-400">#{i + 1}</span>
                  <h3 className="text-lg font-medium text-stone-900">{m.name}</h3>
                  {m.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{m.city}</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-[#C9A65F] fill-[#C9A65F]" />
                    {m.rating.toFixed(1)}
                  </span>
                  {m.priceFrom && <span>od {m.priceFrom} zł</span>}
                </div>
                <p className="text-sm text-stone-700 mt-2">
                  <span className="font-medium">Dlaczego:</span> {m.rationale.join(', ')}.
                </p>
                <details className="mt-2 text-xs text-stone-500">
                  <summary className="cursor-pointer">Pokaż breakdown punktacji ({m.matchScore})</summary>
                  <ul className="mt-2 grid grid-cols-2 gap-1 text-stone-500">
                    {m.scoreBreakdown.map((s, j) => (
                      <li key={j} className="flex justify-between gap-2">
                        <span>{s.label}</span>
                        <span className="text-stone-700">+{s.points}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-medium text-[#2E4F3E]">{m.matchScore}</div>
                <div className="text-[10px] uppercase tracking-wide text-stone-400">dopasowanie</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href={`/firma/${m.slug}`}
                className="flex-1 text-center px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm"
              >
                Zobacz wizytówkę
              </Link>
              <Link
                href={`/rezerwacja/zaklady-pogrzebowe?company=${m.slug}`}
                className="flex-1 text-center px-3 py-2 rounded-lg bg-[#2E4F3E] text-white text-sm hover:bg-[#26412F] inline-flex items-center justify-center gap-1"
              >
                Zarezerwuj <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setStep(1);
            setResult(null);
          }}
          className="w-full text-sm text-stone-500 hover:text-stone-800 py-2"
        >
          ← Zmień kryteria
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <section>
        <label className="block text-sm font-medium text-stone-700 mb-2">Miasto</label>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                city === c
                  ? 'border-[#2E4F3E] bg-[#2E4F3E] text-white'
                  : 'border-stone-300 text-stone-700 hover:border-[#2E4F3E]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium text-stone-700 mb-2">Budżet</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBudget(b.id)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                budget === b.id
                  ? 'border-[#2E4F3E] bg-[#2E4F3E]/5 text-[#2E4F3E]'
                  : 'border-stone-300 text-stone-700 hover:border-[#2E4F3E]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium text-stone-700 mb-2">Pilność</label>
        <div className="grid grid-cols-3 gap-2">
          {URGENCIES.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUrgency(u.id)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                urgency === u.id
                  ? 'border-[#2E4F3E] bg-[#2E4F3E]/5 text-[#2E4F3E]'
                  : 'border-stone-300 text-stone-700 hover:border-[#2E4F3E]'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium text-stone-700 mb-2">Dodatkowe potrzeby</label>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleNeed(n)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                needs.includes(n)
                  ? 'border-[#C9A65F] bg-[#C9A65F]/10 text-[#C9A65F]'
                  : 'border-stone-300 text-stone-700 hover:border-[#C9A65F]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Inne potrzeby (np. obsługa międzynarodowa)"
          className="w-full mt-3 px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
        />
      </section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#2E4F3E] text-white font-medium hover:bg-[#26412F] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Dopasowuję...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Pokaż 3 dopasowane firmy
          </>
        )}
      </button>
      <p className="text-xs text-stone-500 text-center">
        Bez zapisu danych, bez automatycznych telefonów. Wszystko po Państwa stronie.
      </p>
    </div>
  );
}
