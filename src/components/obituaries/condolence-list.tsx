'use client';

import { useEffect, useState, useCallback } from 'react';
import { Quote, Loader2 } from 'lucide-react';

type Condolence = {
  id: string;
  authorName: string;
  text: string;
  relation?: string;
  createdAt: string;
};

type Props = {
  slug: string;
  /** Initial condolences (rendered on server) — saves a fetch on first paint. */
  initial?: Condolence[];
  /** Refresh-bumping key — change this to trigger reload (e.g. after form submit). */
  refreshKey?: number;
};

function fmtDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function CondolenceList({ slug, initial, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<Condolence[]>(initial || []);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/obituaries/${slug}/condolences`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data?.items)) setItems(data.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Re-fetch when refreshKey changes (e.g. after submitting form)
  useEffect(() => {
    if (refreshKey > 0) load();
  }, [refreshKey, load]);

  const visible = expanded ? items : items.slice(0, 6);
  const hasMore = items.length > 6;

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-lg font-medium text-stone-900"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Księga kondolencyjna
          </h3>
          <p className="text-sm text-stone-500">
            {items.length === 0
              ? 'Bądź pierwszą osobą, która złoży kondolencje.'
              : `${items.length} ${items.length === 1 ? 'wpis' : items.length < 5 ? 'wpisy' : 'wpisów'}`}
          </p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
      </div>

      {items.length > 0 ? (
        <ul className="space-y-4">
          {visible.map((c) => (
            <li
              key={c.id}
              className="border-l-2 border-[#C9A65F]/40 pl-4 py-1"
            >
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 text-[#C9A65F] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p
                    className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
                  >
                    {c.text}
                  </p>
                  <div className="mt-2 text-xs text-stone-500">
                    <span className="font-medium text-stone-700">{c.authorName}</span>
                    {c.relation && <span> · {c.relation}</span>}
                    <span> · {fmtDate(c.createdAt)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-stone-400 text-sm">
          Brak wpisów w księdze kondolencyjnej.
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-5 text-sm text-stone-600 hover:text-stone-900 underline underline-offset-2"
        >
          {expanded ? 'Pokaż mniej' : `Pokaż wszystkie wpisy (${items.length})`}
        </button>
      )}
    </section>
  );
}
