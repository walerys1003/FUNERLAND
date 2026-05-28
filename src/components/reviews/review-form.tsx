'use client';

import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReviewForm({
  initialCompany,
  initialBooking,
}: {
  initialCompany?: string;
  initialBooking?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({
    companySlug: initialCompany || '',
    bookingNumber: initialBooking || '',
    title: '',
    body: '',
    authorName: '',
    authorEmail: '',
    rodo: false,
  });

  const upd = (k: keyof typeof form) => (e: any) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się wysłać opinii');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-medium text-stone-900 mb-2">Dziękujemy za opinię!</h2>
        <p className="text-sm text-stone-600">
          {form.bookingNumber
            ? 'Twoja opinia została automatycznie zweryfikowana (numer rezerwacji się zgadza) i jest już widoczna.'
            : 'Opinia trafiła do moderacji — pojawi się publicznie w ciągu 24h.'}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
    >
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Twoja ocena</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
              aria-label={`${n} gwiazdki`}
            >
              <Star
                className={`h-8 w-8 transition ${
                  (hover || rating) >= n
                    ? 'text-[#C9A65F] fill-[#C9A65F]'
                    : 'text-stone-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 self-center text-sm text-stone-600">{rating}/5</span>
        </div>
      </div>

      {/* Company + booking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          required
          placeholder="Slug firmy (np. zaklad-pogrzebowy-kalla)"
          value={form.companySlug}
          onChange={upd('companySlug')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <input
          placeholder="Numer rezerwacji (opcjonalnie)"
          value={form.bookingNumber}
          onChange={upd('bookingNumber')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none font-mono text-sm"
        />
      </div>

      <input
        required
        placeholder="Tytuł opinii"
        minLength={5}
        maxLength={120}
        value={form.title}
        onChange={upd('title')}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
      />

      <div>
        <textarea
          required
          rows={5}
          minLength={30}
          maxLength={2000}
          placeholder="Szczegółowy opis (min. 30 znaków). Wspomnij konkretnie, co Was zaskoczyło na plus lub minus."
          value={form.body}
          onChange={upd('body')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <p className="text-xs text-stone-500 mt-1">{form.body.length}/2000 znaków</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Imię (np. Anna K.)"
          value={form.authorName}
          onChange={upd('authorName')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="E-mail (nie pokazujemy)"
          value={form.authorEmail}
          onChange={upd('authorEmail')}
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input
          type="checkbox"
          required
          checked={form.rodo}
          onChange={upd('rodo')}
          className="mt-0.5"
        />
        <span>
          Wyrażam zgodę na publikację opinii i potwierdzam, że opisuję własne doświadczenie
          (RODO).
        </span>
      </label>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#2E4F3E] text-white font-medium hover:bg-[#26412F] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Wysyłam...
          </>
        ) : (
          'Wystaw opinię'
        )}
      </button>
    </form>
  );
}
