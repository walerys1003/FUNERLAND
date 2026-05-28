'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Map as MapIcon, List, GitCompareArrows, X } from 'lucide-react';
import {
  type FilterState,
  filterCompanies,
  filterStateFromParams,
  filterStateToQuery,
} from '@/lib/marketplace/filters';
import FilterSidebar from './filter-sidebar';
import CompanyCard from './company-card';
import PolandMap from './poland-map';
import { companies as ALL } from '@/lib/data';

const COMPARE_LS_KEY = 'pp.compare.v1';
const COMPARE_MAX = 4;

export default function BrowseClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [state, setState] = useState<FilterState>(() => filterStateFromParams(sp || new URLSearchParams()));
  const [view, setView] = useState<'list' | 'map'>('list');
  const [compare, setCompare] = useState<string[]>([]);

  // Initialize compare from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPARE_LS_KEY);
      if (raw) setCompare(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist compare
  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_LS_KEY, JSON.stringify(compare));
    } catch {
      /* ignore */
    }
  }, [compare]);

  // Sync URL when filters change
  useEffect(() => {
    const q = filterStateToQuery(state);
    const url = q ? `?${q}` : '';
    router.replace(`/firmy${url}`, { scroll: false });
  }, [state, router]);

  const results = useMemo(() => filterCompanies(state), [state]);

  function toggleCompare(slug: string) {
    setCompare((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug);
      if (cur.length >= COMPARE_MAX) return cur;
      return [...cur, slug];
    });
  }

  function clearCompare() {
    setCompare([]);
  }

  const compareLimitReached = compare.length >= COMPARE_MAX;
  const compareLink = compare.length >= 2 ? `/porownaj?firmy=${compare.join(',')}` : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FilterSidebar value={state} onChange={setState} total={results.length} />
          <div className="hidden lg:block text-sm text-stone-600">
            <strong className="text-stone-900">{results.length}</strong> firm spełnia kryteria
            {state.city && <> w mieście <strong>{ALL.find((c) => c.citySlug === state.city)?.city || state.city}</strong></>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare toolbar */}
          {compare.length > 0 && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[#2E4F3E] text-white rounded-lg text-xs">
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span>
                {compare.length} / {COMPARE_MAX}
              </span>
              {compareLink && (
                <Link href={compareLink} className="underline underline-offset-2 font-medium">
                  Porównaj →
                </Link>
              )}
              <button onClick={clearCompare} aria-label="Wyczyść porównanie" className="ml-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* View toggle */}
          <div className="inline-flex bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs rounded-md inline-flex items-center gap-1 ${
                view === 'list' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-600'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 text-xs rounded-md inline-flex items-center gap-1 ${
                view === 'map' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-600'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Mapa
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar handled inline by FilterSidebar above on desktop */}
        <div className="flex-1 min-w-0">
          {view === 'list' ? (
            results.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                <p className="text-stone-700 font-medium mb-2">Brak firm dla wybranych filtrów</p>
                <p className="text-sm text-stone-500">
                  Spróbuj rozszerzyć kryteria lub{' '}
                  <button
                    onClick={() => setState({ sort: 'recommended' })}
                    className="underline text-[#2E4F3E]"
                  >
                    wyczyścić filtry
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((c) => (
                  <CompanyCard
                    key={c.slug}
                    company={c}
                    onToggleCompare={toggleCompare}
                    isInCompare={compare.includes(c.slug)}
                    compareLimitReached={compareLimitReached}
                  />
                ))}
              </div>
            )
          ) : (
            <PolandMap companies={results} className="h-[640px]" />
          )}
        </div>
      </div>
    </div>
  );
}
