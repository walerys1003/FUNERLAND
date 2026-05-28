'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ListChecks,
  Printer,
  Share2,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  FUNERAL_CHECKLIST,
  CHECKLIST_CATEGORIES,
  type ChecklistItem,
} from '@/lib/tools/checklists';

const STORAGE_KEY = 'pp_checklist_v1';

export default function ChecklistClient() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDone(new Set(JSON.parse(stored)));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {}
  }, [done, hydrated]);

  const grouped = useMemo(() => {
    const out: Record<string, ChecklistItem[]> = {};
    for (const item of FUNERAL_CHECKLIST) {
      (out[item.category] ||= []).push(item);
    }
    return out;
  }, []);

  const progress = useMemo(() => {
    const total = FUNERAL_CHECKLIST.length;
    const completed = FUNERAL_CHECKLIST.filter((i) => done.has(i.id)).length;
    return { total, completed, pct: Math.round((completed / total) * 100) };
  }, [done]);

  function toggle(id: string) {
    setDone((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    if (confirm('Usunąć wszystkie zaznaczenia?')) setDone(new Set());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Checklista pogrzebowa', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link skopiowany do schowka');
    }
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)] py-10">
      <div className="container-page max-w-4xl">
        <Link
          href="/narzedzia"
          className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-accent-green print:hidden"
        >
          <ChevronLeft className="w-4 h-4" /> Wszystkie narzędzia
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center shrink-0 print:hidden">
            <ListChecks className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Checklista pogrzebowa
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              {FUNERAL_CHECKLIST.length} kroków od pierwszego dnia do spraw po pogrzebie.
              Zaznaczenia zapisują się lokalnie w&nbsp;Twojej przeglądarce.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[11.5px] uppercase tracking-wider text-text-secondary">
                Postęp
              </div>
              <div className="mt-1 font-heading text-[22px]">
                {progress.completed} / {progress.total}{' '}
                <span className="text-text-muted">·</span>{' '}
                <span className="text-accent-green">{progress.pct}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={share}
                className="btn-secondary !py-2 !px-3 text-[12.5px] inline-flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Udostępnij
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary !py-2 !px-3 text-[12.5px] inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Drukuj
              </button>
              {progress.completed > 0 && (
                <button
                  onClick={reset}
                  className="text-[12px] text-text-muted hover:text-error"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-cream-dark/40 overflow-hidden">
            <div
              className="h-full bg-accent-green transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([catKey, items]) => {
            const cat = CHECKLIST_CATEGORIES[catKey as keyof typeof CHECKLIST_CATEGORIES];
            const completed = items.filter((i) => done.has(i.id)).length;
            return (
              <section key={catKey} className="card p-5">
                <header className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-heading text-[18px]">{cat.label}</h2>
                    <p className="text-[12.5px] text-text-secondary">{cat.description}</p>
                  </div>
                  <span className="text-[12px] text-text-muted">
                    {completed}/{items.length}
                  </span>
                </header>

                <ul className="mt-4 space-y-2">
                  {items.map((item) => {
                    const isDone = done.has(item.id);
                    return (
                      <li
                        key={item.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          isDone
                            ? 'bg-accent-green-light/40 border-accent-green/30'
                            : 'border-border-soft bg-white'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isDone
                                ? 'bg-accent-green border-accent-green text-white'
                                : 'border-border-line bg-white'
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
                          </span>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggle(item.id)}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-[14px] ${
                                  isDone ? 'line-through text-text-muted' : ''
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.priority === 'critical' && !isDone && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-error/15 text-error font-semibold uppercase tracking-wider">
                                  Pilne
                                </span>
                              )}
                              {item.estimatedTime && (
                                <span className="text-[11px] text-text-muted">
                                  · {item.estimatedTime}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-1 text-[12.5px] text-text-secondary leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.links && item.links.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                                {item.links.map((l) => (
                                  <Link
                                    key={l.href}
                                    href={l.href}
                                    className="inline-flex items-center gap-1 text-[12px] text-accent-green hover:underline"
                                  >
                                    {l.label}
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-6 text-[11px] text-text-muted">
          Wygenerowano z PolskiePogrzeby.pl/narzedzia/checklista — {new Date().toLocaleDateString('pl-PL')}
        </div>
      </div>
    </div>
  );
}
