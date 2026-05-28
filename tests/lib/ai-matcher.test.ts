/**
 * Testy AI Matcher v2.
 */

import { describe, it, expect } from 'vitest';
import { findMatchesV2, recommendedSort } from '@/lib/ai/matcher';

describe('findMatchesV2', () => {
  it('zwraca wyniki dla samego miasta', () => {
    const r = findMatchesV2({ city: 'warszawa', limit: 5 });
    expect(Array.isArray(r.matches)).toBe(true);
    expect(r.matches.length).toBeLessThanOrEqual(5);
    if (r.matches.length > 0) {
      expect(r.matches[0]).toHaveProperty('slug');
      expect(r.matches[0]).toHaveProperty('matchScore');
    }
  });

  it('respektuje limit', () => {
    const r = findMatchesV2({ limit: 2 });
    expect(r.matches.length).toBeLessThanOrEqual(2);
  });

  it('verifiedOnly filtruje niezweryfikowanych', () => {
    const r = findMatchesV2({ verifiedOnly: true, limit: 20 });
    for (const m of r.matches) {
      expect(m.isVerified).toBe(true);
    }
  });

  it('ratingMin filtruje poniżej progu', () => {
    const r = findMatchesV2({ ratingMin: 4.5, limit: 20 });
    for (const m of r.matches) {
      if (typeof m.rating === 'number') {
        expect(m.rating).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('zwraca appliedFilters dla każdego wybranego filtra', () => {
    const r = findMatchesV2({
      city: 'warszawa',
      verifiedOnly: true,
      ratingMin: 4.0,
    });
    expect(r.appliedFilters.length).toBeGreaterThan(0);
    expect(r.appliedFilters.some((f) => /warszaw/i.test(f) || /miasto/i.test(f))).toBe(true);
  });

  it('summary jest niepusty stringiem', () => {
    const r = findMatchesV2({ city: 'krakow' });
    expect(typeof r.summary).toBe('string');
    expect(r.summary.length).toBeGreaterThan(0);
  });
});

describe('recommendedSort', () => {
  it('zwraca prawidłową wartość SortKey', () => {
    const sort = recommendedSort({} as any);
    expect(['recommended', 'rating', 'price', 'distance']).toContain(sort);
  });
});
