/**
 * Testy mapowania planów (lib/billing/plan-mapping.ts).
 */

import { describe, it, expect } from 'vitest';
import { toDbPlan, fromDbPlan, isValidDbPlan } from '@/lib/billing/plan-mapping';

describe('toDbPlan', () => {
  it('zachowuje canonical planów aplikacji (passthrough)', () => {
    expect(toDbPlan('free')).toBe('free');
    expect(toDbPlan('standard')).toBe('standard');
    expect(toDbPlan('pro')).toBe('pro');
    expect(toDbPlan('premium')).toBe('premium');
  });

  it('passes legacy DB-only labels as-is (collapsing happens on read)', () => {
    // Po migracji 20260115 DB akceptuje 'basic'/'enterprise' jako wartości legacy.
    // toDbPlan jest passthrough — to fromDbPlan robi collapsing.
    expect(toDbPlan('basic' as any)).toBe('basic');
    expect(toDbPlan('enterprise' as any)).toBe('enterprise');
  });
});

describe('fromDbPlan', () => {
  it('mapuje wartości DB do aplikacji', () => {
    expect(fromDbPlan('free' as any)).toBe('free');
    expect(fromDbPlan('standard' as any)).toBe('standard');
    expect(fromDbPlan('pro' as any)).toBe('pro');
    expect(fromDbPlan('premium' as any)).toBe('premium');
  });

  it('mapuje DB-only wartości na app canonical', () => {
    expect(fromDbPlan('basic' as any)).toBe('standard');
    expect(fromDbPlan('enterprise' as any)).toBe('premium');
  });
});

describe('isValidDbPlan', () => {
  it('akceptuje wartości DB enum', () => {
    expect(isValidDbPlan('free')).toBe(true);
    expect(isValidDbPlan('basic')).toBe(true);
    expect(isValidDbPlan('standard')).toBe(true);
    expect(isValidDbPlan('pro')).toBe(true);
    expect(isValidDbPlan('premium')).toBe(true);
    expect(isValidDbPlan('enterprise')).toBe(true);
  });

  it('odrzuca śmieci', () => {
    expect(isValidDbPlan('mega')).toBe(false);
    expect(isValidDbPlan('')).toBe(false);
    expect(isValidDbPlan('PREMIUM')).toBe(false); // case-sensitive
  });
});
