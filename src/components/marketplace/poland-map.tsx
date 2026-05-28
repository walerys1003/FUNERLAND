'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CITY_GEO, project, VIEW_W, VIEW_H, getCityGeo } from '@/lib/marketplace/geo';
import type { Company } from '@/lib/data';

type MarkerCompany = Pick<Company, 'slug' | 'name' | 'city' | 'citySlug' | 'rating' | 'reviewsCount' | 'plan' | 'isVerified'>;

type Props = {
  companies: MarkerCompany[];
  className?: string;
};

/**
 * Lightweight SVG map of Poland with city markers sized by company count.
 *
 * No Leaflet/Mapbox — keeps bundle tiny. Renders an equirectangular projection
 * of city coords from `geo.ts`. Clicking a marker opens a tooltip with that
 * city's companies and links to /firmy?miasto=<slug>.
 */
export default function PolandMap({ companies, className = '' }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  // Aggregate companies per city
  const byCity = useMemo(() => {
    const map = new Map<string, MarkerCompany[]>();
    for (const c of companies) {
      const list = map.get(c.citySlug) || [];
      list.push(c);
      map.set(c.citySlug, list);
    }
    return map;
  }, [companies]);

  const maxCount = useMemo(
    () => Math.max(1, ...Array.from(byCity.values()).map((arr) => arr.length)),
    [byCity],
  );

  return (
    <div className={`relative bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        role="img"
        aria-label="Mapa Polski — firmy pogrzebowe wg miast"
      >
        {/* Poland silhouette (rough hand-drawn outline based on standard bounds) */}
        <PolandOutline />

        {/* Voivodeship dividers (subtle) */}
        <g stroke="#D8D2C5" strokeWidth="0.5" fill="none" opacity="0.5">
          <path d="M 200 200 L 400 220" />
          <path d="M 300 100 L 300 500" />
        </g>

        {/* Markers */}
        {Object.values(CITY_GEO).map((city) => {
          const list = byCity.get(city.slug) || [];
          const count = list.length;
          const { x, y } = project(city.lat, city.lon);
          const radius = count > 0 ? Math.max(6, Math.min(22, 6 + (count / maxCount) * 16)) : 4;
          const active = count > 0;
          const isHover = hover === city.slug;
          return (
            <g
              key={city.slug}
              onMouseEnter={() => setHover(city.slug)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: active ? 'pointer' : 'default' }}
            >
              {/* halo */}
              {active && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 4}
                  fill="#2E4F3E"
                  opacity={isHover ? 0.18 : 0.08}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={active ? '#2E4F3E' : '#C9C4B8'}
                stroke="#fff"
                strokeWidth="1.5"
              />
              {active && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize={Math.max(8, radius * 0.65)}
                  fill="#fff"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {count}
                </text>
              )}
              <text
                x={x}
                y={y - radius - 4}
                textAnchor="middle"
                fontSize="10"
                fill="#3F3B33"
                fontWeight={active ? '600' : '400'}
                pointerEvents="none"
              >
                {city.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip / panel */}
      {hover && byCity.get(hover)?.length ? (
        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:max-w-sm bg-white border border-stone-200 rounded-xl shadow-lg p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <strong className="text-stone-900">{getCityGeo(hover)?.name}</strong>
            <Link
              href={`/firmy?miasto=${hover}`}
              className="text-xs text-[#2E4F3E] hover:underline"
            >
              Pokaż wszystkie →
            </Link>
          </div>
          <ul className="space-y-1.5 max-h-44 overflow-y-auto">
            {(byCity.get(hover) || []).slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/firma/${c.slug}`}
                  className="block text-stone-700 hover:text-stone-900 truncate"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-[11.5px] text-stone-500 ml-2">
                    ★ {c.rating.toFixed(1)} · {c.reviewsCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 text-[11.5px] text-stone-500 bg-white/80 backdrop-blur px-2 py-1 rounded">
          Najedź na miasto, aby zobaczyć firmy
        </div>
      )}
    </div>
  );
}

/* ----- Poland silhouette ----- */
function PolandOutline() {
  // Simplified outline (approximate) — for visual context only
  const d =
    'M 55 130 L 90 90 L 140 80 L 200 65 L 260 80 L 310 70 L 365 90 L 410 110 L 470 130 ' +
    'L 510 165 L 540 210 L 555 270 L 540 325 L 500 385 L 470 430 L 430 470 L 380 510 ' +
    'L 320 540 L 270 550 L 220 540 L 170 510 L 130 470 L 90 420 L 65 360 L 50 290 L 55 230 Z';
  return (
    <g>
      <path d={d} fill="#F5F1E8" stroke="#D8D2C5" strokeWidth="1.5" />
    </g>
  );
}
