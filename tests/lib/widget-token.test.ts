/**
 * Testy podpisanych tokenów widgetu.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateWidgetToken, verifyWidgetToken, isOriginAllowed } from '@/lib/widget/token';

beforeAll(() => {
  process.env.WIDGET_SIGNING_SECRET = 'test-secret-min-32-chars-for-unit-tests-only';
});

describe('generateWidgetToken / verifyWidgetToken', () => {
  it('roundtrip — token wygenerowany jest weryfikowalny', () => {
    const token = generateWidgetToken({
      companySlug: 'kowalski',
      variant: 'card',
      allowedOrigins: ['https://example.com'],
    });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const v = verifyWidgetToken(token);
    expect(v.ok).toBe(true);
    if (v.ok) {
      // Payload uses short keys: c = companySlug, v = variant (kept compact in JWT)
      expect(v.payload.c).toBe('kowalski');
      expect(v.payload.v).toBe('card');
    }
  });

  it('zmieniony token (tamper) jest odrzucany', () => {
    const token = generateWidgetToken({ companySlug: 'kowalski' });
    // zepsuj ostatni znak
    const tampered = token.slice(0, -2) + 'AA';
    const v = verifyWidgetToken(tampered);
    expect(v.ok).toBe(false);
  });

  it('odrzuca token o nieprawidłowym formacie', () => {
    expect(verifyWidgetToken('not-a-token').ok).toBe(false);
    expect(verifyWidgetToken('').ok).toBe(false);
    expect(verifyWidgetToken('a.b').ok).toBe(false);
  });
});

describe('isOriginAllowed', () => {
  it('exact match (z protokołem)', () => {
    expect(isOriginAllowed('https://example.com', ['https://example.com'])).toBe(true);
    expect(isOriginAllowed('https://evil.com', ['https://example.com'])).toBe(false);
  });

  it('wildcard subdomain — format *.example.com (bez protokołu)', () => {
    expect(isOriginAllowed('https://app.example.com', ['*.example.com'])).toBe(true);
    expect(isOriginAllowed('https://api.app.example.com', ['*.example.com'])).toBe(true);
    // example.com (bez subdomeny) nie jest matchowany przez wildcard
    expect(isOriginAllowed('https://example.com', ['*.example.com'])).toBe(false);
  });

  it('* (catch-all)', () => {
    expect(isOriginAllowed('https://anything.com', ['*'])).toBe(true);
  });

  it('pusta lista → cokolwiek dozwolone (unrestricted)', () => {
    expect(isOriginAllowed('https://anything.com', [])).toBe(true);
    expect(isOriginAllowed('https://anything.com', null)).toBe(true);
    expect(isOriginAllowed('https://anything.com', undefined)).toBe(true);
  });

  it('origin null + lista non-empty → odmowa', () => {
    expect(isOriginAllowed(null, ['https://example.com'])).toBe(false);
  });
});
