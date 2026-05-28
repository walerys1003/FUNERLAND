'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

type Props = {
  slug: string;
  onAdded?: () => void;
};

export default function MemoryForm({ slug, onAdded }: Props) {
  const [type, setType] = useState<'story' | 'photo'>('story');
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setOkMsg(null);

    if (authorName.trim().length < 2) {
      setErrMsg('Podaj imię (min. 2 znaki).');
      return;
    }
    if (title.trim().length < 2) {
      setErrMsg('Podaj tytuł wspomnienia.');
      return;
    }
    if (type === 'story' && description.trim().length < 20) {
      setErrMsg('Historia musi mieć co najmniej 20 znaków.');
      return;
    }
    if (type === 'photo' && !/^https?:\/\//i.test(imageUrl.trim())) {
      setErrMsg('Wklej prawidłowy adres URL zdjęcia (http/https).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/obituaries/${slug}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: type === 'photo' ? imageUrl.trim() : undefined,
          authorName: authorName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setErrMsg(data?.error || 'Nie udało się dodać wspomnienia.');
      } else {
        setOkMsg('Dziękujemy. Wspomnienie trafiło do moderacji i pojawi się wkrótce.');
        setAuthorName('');
        setTitle('');
        setDescription('');
        setImageUrl('');
        setTimeout(() => onAdded?.(), 1200);
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
      className="bg-stone-50 border border-stone-200 rounded-xl p-4 md:p-5"
    >
      {/* Type toggle */}
      <div className="inline-flex bg-white rounded-lg border border-stone-300 mb-4 p-0.5">
        <button
          type="button"
          onClick={() => setType('story')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            type === 'story' ? 'bg-stone-900 text-white' : 'text-stone-600'
          }`}
        >
          Historia
        </button>
        <button
          type="button"
          onClick={() => setType('photo')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            type === 'photo' ? 'bg-stone-900 text-white' : 'text-stone-600'
          }`}
        >
          Zdjęcie
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs text-stone-600 mb-1">Twoje imię *</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-stone-600 mb-1">Tytuł wspomnienia *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            placeholder={type === 'photo' ? 'np. Wakacje 1995' : 'np. Spotkanie w 1972 roku'}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
          />
        </label>
      </div>

      {type === 'photo' ? (
        <label className="block mb-3">
          <span className="block text-xs text-stone-600 mb-1">URL zdjęcia (http/https) *</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/zdjecie.jpg"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
          />
          <span className="block text-[11px] text-stone-400 mt-1">
            Zdjęcia są moderowane przed publikacją.
          </span>
        </label>
      ) : (
        <label className="block mb-3">
          <span className="block text-xs text-stone-600 mb-1">Historia / wspomnienie *</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            required
            placeholder="Opisz wspomnienie, anegdotę, ważny moment…"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white resize-y"
          />
          <span className="block text-[11px] text-stone-400 mt-1 text-right">
            {description.length}/2000
          </span>
        </label>
      )}

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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Wysyłanie…' : 'Dodaj wspomnienie'}
      </button>
    </form>
  );
}
