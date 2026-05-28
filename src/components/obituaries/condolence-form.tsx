'use client';

import { useState, type FormEvent } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Props = {
  slug: string;
  onAdded?: () => void;
};

export default function CondolenceForm({ slug, onAdded }: Props) {
  const [authorName, setAuthorName] = useState('');
  const [relation, setRelation] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setOkMsg(null);

    if (!consent) {
      setErrMsg('Wymagana zgoda na publikację wpisu.');
      return;
    }
    if (authorName.trim().length < 2) {
      setErrMsg('Podaj imię (min. 2 znaki).');
      return;
    }
    if (text.trim().length < 8) {
      setErrMsg('Treść kondolencji jest zbyt krótka (min. 8 znaków).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/obituaries/${slug}/condolences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          relation: relation.trim() || undefined,
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setErrMsg(data?.error || 'Nie udało się wysłać kondolencji.');
      } else {
        if (data.pending) {
          setOkMsg('Dziękujemy. Wpis trafił do moderacji i pojawi się wkrótce.');
        } else {
          setOkMsg('Dziękujemy za kondolencje. Wpis został opublikowany.');
        }
        setAuthorName('');
        setRelation('');
        setText('');
        setConsent(false);
        onAdded?.();
      }
    } catch {
      setErrMsg('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm"
    >
      <h3
        className="text-lg font-medium text-stone-900 mb-1"
        style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
      >
        Złóż kondolencje
      </h3>
      <p className="text-sm text-stone-500 mb-4">
        Wpis pojawi się w księdze kondolencyjnej. Imię będzie widoczne, e-mail nie jest wymagany.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs text-stone-600 mb-1">Imię i nazwisko *</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500"
            placeholder="np. Anna Kowalska"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-stone-600 mb-1">Relacja (opcjonalnie)</span>
          <input
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500"
            placeholder="np. przyjaciel, sąsiad, współpracownik"
          />
        </label>
      </div>

      <label className="block mb-3">
        <span className="block text-xs text-stone-600 mb-1">Treść kondolencji *</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={1000}
          required
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 resize-y"
          placeholder="Słowa pożegnania, wspomnienie, modlitwa…"
        />
        <span className="block text-[11px] text-stone-400 mt-1 text-right">
          {text.length}/1000
        </span>
      </label>

      <label className="flex items-start gap-2 mb-4 text-[12.5px] text-stone-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Wyrażam zgodę na publikację wpisu w księdze kondolencyjnej oraz potwierdzam, że treść
          nie zawiera treści obraźliwych ani reklamowych.
        </span>
      </label>

      {errMsg && (
        <div className="mb-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}
      {okMsg && (
        <div className="mb-3 flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{okMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium disabled:opacity-60 transition"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Wysyłanie…' : 'Wyślij kondolencje'}
      </button>
    </form>
  );
}
