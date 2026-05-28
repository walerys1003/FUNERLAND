'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  CreditCard,
  Building2,
  Heart,
  Shield,
  MapPin,
  Sparkles,
  Activity,
  TestTube,
  PenLine,
  FileText,
  Rocket,
  ChevronDown,
} from 'lucide-react';
import type { AuditSection } from '@/lib/audit/data';

const ICONS: Record<string, any> = {
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Heart,
  Shield,
  MapPin,
  Sparkles,
  Activity,
  TestTube,
  PenLine,
  FileText,
  Rocket,
};

const PRIORITY_STYLE: Record<string, string> = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-amber-100 text-amber-700 border-amber-200',
  P2: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STORAGE_KEY = 'audyt-checked-v3';

export default function AuditChecklist({
  data,
}: {
  data: { generatedAt: string; sections: AuditSection[] };
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.sections.map((s) => [s.id, true])),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {}
  }, [checked, hydrated]);

  const isChecked = (key: string, defaultDone?: boolean) => {
    if (checked[key] !== undefined) return checked[key];
    return !!defaultDone;
  };

  const stats = useMemo(() => {
    const result: Record<string, { done: number; total: number }> = {};
    for (const s of data.sections) {
      let done = 0;
      s.items.forEach((it, idx) => {
        const key = `${s.id}-${idx}`;
        if (isChecked(key, it.done)) done++;
      });
      result[s.id] = { done, total: s.items.length };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, checked]);

  return (
    <div className="space-y-4">
      {data.sections.map((section) => {
        const Icon = ICONS[section.icon] || Circle;
        const st = stats[section.id];
        const pct = Math.round((st.done / st.total) * 100);
        const isOpen = open[section.id] ?? true;

        return (
          <section
            key={section.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpen((o) => ({ ...o, [section.id]: !isOpen }))}
              className="w-full p-5 flex items-center gap-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F1B2D] text-[#C9A65F] flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-[#0F1B2D]">{section.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-stone-100 rounded-full h-1.5 max-w-[200px] overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        pct === 100
                          ? 'bg-emerald-500'
                          : pct > 50
                            ? 'bg-[#C9A65F]'
                            : 'bg-stone-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-600 tabular-nums">
                    {st.done}/{st.total}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <ul className="border-t border-stone-100 divide-y divide-stone-50">
                {section.items.map((item, idx) => {
                  const key = `${section.id}-${idx}`;
                  const done = isChecked(key, item.done);
                  return (
                    <li key={key}>
                      <button
                        onClick={() =>
                          setChecked((c) => ({ ...c, [key]: !done }))
                        }
                        className="w-full px-5 py-3 flex items-start gap-3 hover:bg-stone-50/70 transition-colors text-left"
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-stone-300 mt-0.5 shrink-0" />
                        )}
                        <span
                          className={`flex-1 text-sm ${
                            done ? 'text-stone-400 line-through' : 'text-stone-800'
                          }`}
                        >
                          {item.text}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border tabular-nums ${PRIORITY_STYLE[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <div className="text-center text-xs text-stone-500 pt-4">
        Stan checklisty zapisywany lokalnie (localStorage). Audyt wygenerowany:{' '}
        {data.generatedAt}.
      </div>
    </div>
  );
}
