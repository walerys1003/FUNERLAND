/**
 * Testy rate-limit (in-memory fallback, bez Upstash).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/security/rate-limit';

function mockReq(ip = '10.0.0.1'): Request {
  return new Request('http://test.local/api/x', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('rateLimit (memory)', () => {
  beforeEach(() => {
    // brak Upstash → memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('przepuszcza requesty do limitu', async () => {
    const r1 = await rateLimit(mockReq('10.0.0.2'), { limit: 3, windowMs: 60_000, key: 'test-a' });
    const r2 = await rateLimit(mockReq('10.0.0.2'), { limit: 3, windowMs: 60_000, key: 'test-a' });
    const r3 = await rateLimit(mockReq('10.0.0.2'), { limit: 3, windowMs: 60_000, key: 'test-a' });
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
  });

  it('blokuje po przekroczeniu limitu', async () => {
    const opts = { limit: 2, windowMs: 60_000, key: 'test-b' };
    await rateLimit(mockReq('10.0.0.3'), opts);
    await rateLimit(mockReq('10.0.0.3'), opts);
    const blocked = await rateLimit(mockReq('10.0.0.3'), opts);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.headers.get('Retry-After')).toBeTruthy();
    }
  });

  it('różne IP — niezależne liczniki', async () => {
    const opts = { limit: 1, windowMs: 60_000, key: 'test-c' };
    const a = await rateLimit(mockReq('10.0.0.4'), opts);
    const b = await rateLimit(mockReq('10.0.0.5'), opts);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });

  it('różne klucze — niezależne liczniki', async () => {
    const a = await rateLimit(mockReq('10.0.0.6'), { limit: 1, windowMs: 60_000, key: 'k-1' });
    const b = await rateLimit(mockReq('10.0.0.6'), { limit: 1, windowMs: 60_000, key: 'k-2' });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });

  it('response 429 ma poprawne nagłówki', async () => {
    const opts = { limit: 1, windowMs: 60_000, key: 'test-d' };
    await rateLimit(mockReq('10.0.0.7'), opts);
    const blocked = await rateLimit(mockReq('10.0.0.7'), opts);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.response.headers.get('X-RateLimit-Limit')).toBe('1');
      expect(blocked.response.headers.get('X-RateLimit-Remaining')).toBe('0');
    }
  });
});
