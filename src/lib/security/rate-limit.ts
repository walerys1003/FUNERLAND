/**
 * Rate-limit middleware (Upstash Redis lub in-memory fallback).
 *
 * Strategia:
 *  - Jeśli `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN` ustawione w env
 *    i pakiet `@upstash/ratelimit` zainstalowany → używa sliding window w Redis.
 *  - Inaczej → in-memory Map (per instancja serwera, nie nadaje się na > 1 region).
 *
 * Użycie:
 *   import { rateLimit } from '@/lib/security/rate-limit';
 *   const rl = await rateLimit(req, { limit: 10, windowMs: 60_000, key: 'lead' });
 *   if (!rl.ok) return rl.response;
 */

import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };
const memoryStore = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const h = (name: string) => req.headers.get(name) ?? '';
  return (
    h('x-forwarded-for').split(',')[0].trim() ||
    h('x-real-ip') ||
    h('cf-connecting-ip') ||
    'unknown'
  );
}

export type RateLimitOptions = {
  /** ile requestów w oknie */
  limit?: number;
  /** szerokość okna w ms */
  windowMs?: number;
  /** etykieta routy — pozwala mieć osobne liczniki per endpoint */
  key?: string;
  /** dodatkowy element klucza (np. userId) — opcjonalnie */
  identifier?: string;
};

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number; response?: undefined }
  | { ok: false; response: NextResponse; remaining: number; resetAt: number };

async function tryUpstash(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: number } | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try {
    // dynamic import — paczki są optional
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Ratelimit } = require('@upstash/ratelimit');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require('@upstash/redis');
    const rl = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${Math.max(1, Math.floor(windowMs / 1000))} s`),
      analytics: false,
      prefix: 'pp:rl',
    });
    const res = await rl.limit(identifier);
    return { success: res.success, remaining: res.remaining, reset: res.reset };
  } catch {
    return null;
  }
}

function memoryLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = memoryStore.get(identifier);
  if (!bucket || bucket.resetAt < now) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }
  if (bucket.count >= limit) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }
  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, reset: bucket.resetAt };
}

export async function rateLimit(req: Request, opts: RateLimitOptions = {}): Promise<RateLimitResult> {
  const limit = opts.limit ?? 30;
  const windowMs = opts.windowMs ?? 60_000;
  const ip = clientIp(req);
  const identifier = [opts.key ?? 'global', ip, opts.identifier ?? ''].filter(Boolean).join(':');

  const upstash = await tryUpstash(identifier, limit, windowMs);
  const result = upstash ?? memoryLimit(identifier, limit, windowMs);

  const headers = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
      ok: false,
      remaining: 0,
      resetAt: result.reset,
      response: NextResponse.json(
        {
          error: 'RateLimitExceeded',
          message: 'Za dużo żądań. Spróbuj ponownie za chwilę.',
          retryAfter,
        },
        {
          status: 429,
          headers: { ...headers, 'Retry-After': String(retryAfter) },
        }
      ),
    };
  }

  return { ok: true, remaining: result.remaining, resetAt: result.reset };
}

/** Convenience: rate-limit z gotowymi presetami dla typowych endpointów. */
export const RL_PRESETS = {
  /** Formularz lead — bardzo restrykcyjnie, antyspam */
  lead: { limit: 5, windowMs: 60_000, key: 'lead' },
  /** Review — moderacja chroni nas, ale i tak limit */
  review: { limit: 10, windowMs: 60_000, key: 'review' },
  /** AI chat — kosztowny (OpenAI), ostry limit */
  aiChat: { limit: 20, windowMs: 60_000, key: 'ai-chat' },
  /** AI match — taniej, ale agreguje wyniki */
  aiMatch: { limit: 60, windowMs: 60_000, key: 'ai-match' },
  /** Moderate */
  moderate: { limit: 30, windowMs: 60_000, key: 'moderate' },
  /** Booking */
  booking: { limit: 10, windowMs: 60_000, key: 'booking' },
  /** Widget token issue */
  widgetIssue: { limit: 10, windowMs: 60_000, key: 'widget-issue' },
  /** Domyślny */
  default: { limit: 60, windowMs: 60_000, key: 'default' },
} as const;
