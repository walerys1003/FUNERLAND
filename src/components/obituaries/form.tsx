'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

type Tier = 'free' | 'premium';

export default function ObituaryForm() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>('free');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    personName: '',
    birthDate: '',
    deathDate: '',
    city: '',
    funeralDate: '',
    funeralPlace: '',
    text: '',
    authorName: '',
    authorEmail: '',
    rodo: false,
  });

  const update = (k: keyof typeof form) => (e: any) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function aiAssist() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'obituary',
          context: {
            personName: form.personName,
            birthDate: form.birthDate,
            deathDate: form.deathDate,
            city: form.city,
            funeralDate: form.funeralDate,
            funeralPlace: form.funeralPlace,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się wygenerować');
      if (data.text) setForm((f) => ({ ...f, text: data.text }));
    } catch (e: any) {
      setError(e.message || 'Błąd generatora');
    } finally {
      setGenerating(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/obituaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się opublikować');
      router.push(`/nekrologi/${data.obituary.slug}`);
    } catch (e: any) {
      setError(e.message || 'Błąd publikacji');
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
    >
      {/* Tier selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTier('free')}
          className={`text-left p-4 rounded-xl border-2 transition ${
            tier === 'free'
              ? 'border-[#2E4F3E] bg-[#2E4F3E]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="font-medium text-stone-900">Bezpłatnie</div>
          <div className="text-xs text-stone-500 mt-1">7 dni publikacji · podstawowe wsparcie</div>
        </button>
        <button
          type="button"
          onClick={() => setTier('premium')}
          className={`text-left p-4 rounded-xl border-2 transition ${
            tier === 'premium'
              ? 'border-[#C9A65F] bg-[#C9A65F]/10'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="font-medium text-stone-900">Premium · 49 zł</div>
          <div className="text-xs text-stone-500 mt-1">
            30 dni · transmisja online · SMS · większa widoczność
          </div>
        </button>
      </div>

      {/* Person details */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700 uppercase tracking-wide">
          Osoba zmarła
        </h2>
        <input
          required
          placeholder="Imię i nazwisko"
          value={form.personName}
          onChange={update('personName')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            placeholder="Data urodzenia"
            value={form.birthDate}
            onChange={update('birthDate')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
          <input
            required
            type="date"
            placeholder="Data śmierci"
            value={form.deathDate}
            onChange={update('deathDate')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
        </div>
        <input
          required
          placeholder="Miasto"
          value={form.city}
          onChange={update('city')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="datetime-local"
            placeholder="Data ceremonii"
            value={form.funeralDate}
            onChange={update('funeralDate')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
          <input
            placeholder="Miejsce ceremonii"
            value={form.funeralPlace}
            onChange={update('funeralPlace')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
        </div>
      </div>

      {/* Text + AI helper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-700 uppercase tracking-wide">
            Treść wspomnienia
          </h2>
          <button
            type="button"
            onClick={aiAssist}
            disabled={generating || !form.personName}
            className="inline-flex items-center gap-1.5 text-xs text-[#2E4F3E] hover:text-[#26412F] disabled:opacity-40"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Pomóż mi napisać (AI)
          </button>
        </div>
        <textarea
          required
          minLength={20}
          maxLength={4000}
          rows={8}
          placeholder="Napisz kilka słów o bliskiej osobie..."
          value={form.text}
          onChange={update('text')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <p className="text-xs text-stone-500">{form.text.length}/4000 znaków</p>
      </div>

      {/* Author */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700 uppercase tracking-wide">Autor</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Imię i nazwisko"
            value={form.authorName}
            onChange={update('authorName')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
          <input
            required
            type="email"
            placeholder="E-mail kontaktowy"
            value={form.authorEmail}
            onChange={update('authorEmail')}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            required
            checked={form.rodo}
            onChange={update('rodo')}
            className="mt-0.5"
          />
          <span>
            Wyrażam zgodę na publikację nekrologu oraz przetwarzanie danych zgodnie z polityką
            prywatności (RODO).
          </span>
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-[#2E4F3E] text-white font-medium hover:bg-[#26412F] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Publikuję...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" /> Opublikuj {tier === 'premium' ? '(49 zł)' : 'bezpłatnie'}
          </>
        )}
      </button>
      <p className="text-xs text-stone-500 text-center">
        Płatność za pakiet premium pobierana jest po publikacji. Możesz zrezygnować w ciągu 24h.
      </p>
    </form>
  );
}
