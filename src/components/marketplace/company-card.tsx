'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { CheckCircle2, MapPin, Phone, Star, GitCompareArrows, Check } from 'lucide-react';
import type { Company } from '@/lib/data';
import { minPrice, featureLabel } from '@/lib/marketplace/filters';

type Props = {
  company: Company;
  onToggleCompare?: (slug: string) => void;
  isInCompare?: boolean;
  compareLimitReached?: boolean;
};

const PLAN_BADGE: Record<Company['plan'], { label: string; cls: string } | null> = {
  premium: { label: 'Premium', cls: 'bg-[#C9A65F] text-white' },
  pro: { label: 'Pro', cls: 'bg-[#2E4F3E] text-white' },
  standard: { label: 'Standard', cls: 'bg-stone-200 text-stone-700' },
  free: null,
};

export default function CompanyCard({
  company,
  onToggleCompare,
  isInCompare,
  compareLimitReached,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const price = minPrice(company);
  const planBadge = PLAN_BADGE[company.plan];

  return (
    <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all flex flex-col">
      {/* Image */}
      <div className="relative h-40 bg-stone-100 overflow-hidden">
        {!imgError && company.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.image}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7" />
            </svg>
          </div>
        )}
        {planBadge && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider rounded ${planBadge.cls}`}
          >
            {planBadge.label}
          </span>
        )}
        {company.phone24h && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10.5px] font-semibold rounded bg-white/95 text-emerald-700">
            24/7
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="text-base font-medium text-stone-900 leading-tight"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            <Link href={`/firma/${company.slug}`} className="hover:underline">
              {company.name}
            </Link>
          </h3>
          {company.isVerified && (
            <span title="Zweryfikowano" className="flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
          <MapPin className="h-3 w-3" />
          <span>
            {company.city}
            {company.district && ` · ${company.district}`}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="inline-flex items-center gap-0.5 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium text-stone-800">{company.rating.toFixed(1)}</span>
          </span>
          <span className="text-stone-400">({company.reviewsCount} opinii)</span>
        </div>

        {company.features && company.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {company.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10.5px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600"
              >
                {featureLabel(f)}
              </span>
            ))}
            {company.features.length > 3 && (
              <span className="text-[10.5px] px-1.5 py-0.5 text-stone-500">
                +{company.features.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            {price > 0 && (
              <>
                <span className="text-[11px] text-stone-500">od</span>{' '}
                <span className="text-base font-medium text-stone-900">
                  {price.toLocaleString('pl-PL')} zł
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(company.slug)}
                disabled={!isInCompare && compareLimitReached}
                className={`p-1.5 rounded-md transition ${
                  isInCompare
                    ? 'bg-[#2E4F3E] text-white'
                    : compareLimitReached
                    ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
                aria-label={isInCompare ? 'Usuń z porównania' : 'Dodaj do porównania'}
                title={isInCompare ? 'Usuń z porównania' : 'Porównaj'}
              >
                {isInCompare ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <GitCompareArrows className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <Link
              href={`/firma/${company.slug}`}
              className="text-xs px-3 py-1.5 rounded-md bg-[#2E4F3E] text-white hover:bg-[#26412F]"
            >
              Zobacz
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
