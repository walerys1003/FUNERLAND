'use client';

import { useState } from 'react';
import { Search, X, Sliders } from 'lucide-react';
import {
  type FilterState,
  type SortKey,
  citiesInUse,
  categoriesInUse,
  allFeatures,
  featureLabel,
} from '@/lib/marketplace/filters';

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  total: number;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Rekomendowane' },
  { value: 'rating-desc', label: 'Najwyższa ocena' },
  { value: 'reviews-desc', label: 'Najwięcej opinii' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'name-asc', label: 'Alfabetycznie' },
];

const PLAN_OPTIONS: { value: any; label: string }[] = [
  { value: undefined, label: 'Wszystkie' },
  { value: 'premium', label: 'Premium' },
  { value: 'pro', label: 'Pro' },
  { value: 'standard', label: 'Standard' },
];

export default function FilterSidebar({ value, onChange, total }: Props) {
  const [open, setOpen] = useState(false); // mobile
  const cities = citiesInUse();
  const cats = categoriesInUse();
  const features = allFeatures();

  function set<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    onChange({ ...value, [k]: v });
  }

  function toggleFeature(f: string) {
    const cur = new Set(value.features || []);
    cur.has(f) ? cur.delete(f) : cur.add(f);
    set('features', Array.from(cur));
  }

  function reset() {
    onChange({ sort: 'recommended' });
  }

  const activeCount =
    (value.city ? 1 : 0) +
    (value.category ? 1 : 0) +
    (value.features?.length || 0) +
    (value.ratingMin ? 1 : 0) +
    (value.priceMax ? 1 : 0) +
    (value.plan ? 1 : 0) +
    (value.verifiedOnly ? 1 : 0) +
    (value.phone24hOnly ? 1 : 0) +
    (value.query ? 1 : 0);

  const content = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">Szukaj</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={value.query || ''}
            onChange={(e) => set('query', e.target.value || undefined)}
            placeholder="Nazwa, miasto, dzielnica…"
            className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#2E4F3E]"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">Sortuj</label>
        <select
          value={value.sort || 'recommended'}
          onChange={(e) => set('sort', e.target.value as SortKey)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#2E4F3E] bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">Miasto</label>
        <select
          value={value.city || ''}
          onChange={(e) => set('city', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#2E4F3E]"
        >
          <option value="">Wszystkie miasta</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">Kategoria</label>
        <select
          value={value.category || ''}
          onChange={(e) => set('category', (e.target.value as any) || undefined)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#2E4F3E]"
        >
          <option value="">Wszystkie kategorie</option>
          {cats.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Rating min */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">
          Minimalna ocena: <strong>{value.ratingMin || 'brak'}</strong>
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={value.ratingMin || 0}
          onChange={(e) => set('ratingMin', Number(e.target.value) || undefined)}
          className="w-full accent-[#2E4F3E]"
        />
        <div className="flex justify-between text-[10.5px] text-stone-400 mt-0.5">
          <span>0</span><span>2.5</span><span>5</span>
        </div>
      </div>

      {/* Price max */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">
          Maks. cena (od):{' '}
          <strong>
            {value.priceMax ? `${value.priceMax.toLocaleString('pl-PL')} zł` : 'dowolna'}
          </strong>
        </label>
        <input
          type="range"
          min={0}
          max={20000}
          step={500}
          value={value.priceMax || 0}
          onChange={(e) => set('priceMax', Number(e.target.value) || undefined)}
          className="w-full accent-[#2E4F3E]"
        />
        <div className="flex justify-between text-[10.5px] text-stone-400 mt-0.5">
          <span>0</span><span>10k</span><span>20k</span>
        </div>
      </div>

      {/* Plan */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">Plan firmy</label>
        <div className="flex flex-wrap gap-1.5">
          {PLAN_OPTIONS.map((p) => (
            <button
              key={String(p.value)}
              type="button"
              onClick={() => set('plan', p.value)}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                value.plan === p.value
                  ? 'bg-[#2E4F3E] text-white border-[#2E4F3E]'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1.5">Udogodnienia</label>
          <div className="space-y-1.5">
            {features.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.features?.includes(f) || false}
                  onChange={() => toggleFeature(f)}
                  className="rounded border-stone-300 text-[#2E4F3E] focus:ring-[#2E4F3E]"
                />
                <span>{featureLabel(f)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="space-y-2 pt-2 border-t border-stone-200">
        <label className="flex items-center justify-between gap-2 text-sm text-stone-700 cursor-pointer">
          <span>Tylko zweryfikowane</span>
          <input
            type="checkbox"
            checked={value.verifiedOnly || false}
            onChange={(e) => set('verifiedOnly', e.target.checked || undefined)}
            className="rounded border-stone-300 text-[#2E4F3E]"
          />
        </label>
        <label className="flex items-center justify-between gap-2 text-sm text-stone-700 cursor-pointer">
          <span>Dyżur 24/7</span>
          <input
            type="checkbox"
            checked={value.phone24hOnly || false}
            onChange={(e) => set('phone24hOnly', e.target.checked || undefined)}
            className="rounded border-stone-300 text-[#2E4F3E]"
          />
        </label>
      </div>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 inline-flex items-center justify-center gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Wyczyść filtry ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 bg-white"
      >
        <Sliders className="h-4 w-4" />
        Filtry {activeCount > 0 && `(${activeCount})`}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-4 bg-white border border-stone-200 rounded-2xl p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-stone-900">Filtry</h2>
            <span className="text-xs text-stone-500">{total} wyników</span>
          </div>
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-medium text-stone-900">Filtry</h2>
              <button onClick={() => setOpen(false)} aria-label="Zamknij filtry">
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>
            <div className="p-4">{content}</div>
            <div className="sticky bottom-0 bg-white border-t border-stone-200 px-4 py-3">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#2E4F3E] text-white text-sm font-medium"
              >
                Pokaż {total} wyników
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
