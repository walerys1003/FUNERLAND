'use client';

import { useEffect, useState, useCallback } from 'react';
import { ImageIcon, BookOpen, Loader2 } from 'lucide-react';
import MemoryForm from './memory-form';

type Memory = {
  id: string;
  type: 'photo' | 'story';
  title: string;
  description?: string;
  imageUrl?: string;
  authorName: string;
  createdAt: string;
};

type Props = {
  slug: string;
  initial?: Memory[];
};

function fmtDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function MemoryWall({ slug, initial }: Props) {
  const [items, setItems] = useState<Memory[]>(initial || []);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/obituaries/${slug}/memories`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data?.items)) setItems(data.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (refresh > 0) load();
  }, [refresh, load]);

  const photos = items.filter((m) => m.type === 'photo');
  const stories = items.filter((m) => m.type === 'story');

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-lg font-medium text-stone-900"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Ściana pamięci
          </h3>
          <p className="text-sm text-stone-500">
            Zdjęcia i wspomnienia od bliskich, rodziny i przyjaciół.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
          <button
            onClick={() => setOpenForm((o) => !o)}
            className="text-sm px-3 py-1.5 rounded-lg border border-stone-300 hover:border-stone-500 text-stone-700"
          >
            {openForm ? 'Anuluj' : '+ Dodaj wspomnienie'}
          </button>
        </div>
      </div>

      {openForm && (
        <div className="mb-5">
          <MemoryForm
            slug={slug}
            onAdded={() => {
              setOpenForm(false);
              setRefresh((r) => r + 1);
            }}
          />
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Zdjęcia ({photos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="bg-stone-50 rounded-lg overflow-hidden border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-32 object-cover grayscale hover:grayscale-0 transition"
                  loading="lazy"
                />
                <figcaption className="px-2 py-1.5 text-[11.5px] text-stone-600">
                  <div className="truncate font-medium text-stone-800">{p.title}</div>
                  <div className="truncate text-stone-500">
                    {p.authorName} · {fmtDate(p.createdAt)}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Story cards */}
      {stories.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Wspomnienia ({stories.length})
          </h4>
          <div className="space-y-3">
            {stories.map((s) => (
              <article
                key={s.id}
                className="border border-stone-200 rounded-lg p-4 bg-stone-50/60"
              >
                <h5
                  className="font-medium text-stone-900 mb-1"
                  style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
                >
                  {s.title}
                </h5>
                <p className="text-[14.5px] text-stone-700 whitespace-pre-line leading-relaxed">
                  {s.description}
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  {s.authorName} · {fmtDate(s.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && !openForm && (
        <div className="text-center py-8 text-stone-400 text-sm">
          Brak wspomnień. Dodaj pierwsze zdjęcie lub historię.
        </div>
      )}
    </section>
  );
}
