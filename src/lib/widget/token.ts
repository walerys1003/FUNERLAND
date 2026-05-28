/**
 * Widget token utility — generate & verify embeddable widget tokens.
 *
 * Strategy: signed token = base64url(JSON payload) + '.' + HMAC-SHA256(payload, secret).
 * Dependency-free (uses Node crypto), works in Next.js Node runtime.
 *
 * Token payload: { c: companySlug, v: variant, ver: 1, iat: epochSeconds }
 * NOT time-limited by default (long-lived embeddable token), but `exp` is supported.
 *
 * For production: pair with `company_widgets` row that stores allowed_origins[] and
 * lets admin revoke tokens. The DB row's `widget_token` (text) is what we issue here.
 */

import crypto from 'crypto';

export type WidgetVariant = 'card' | 'banner' | 'compact' | 'reviews';

export type WidgetPayload = {
  /** Company slug. */
  c: string;
  /** Visual variant. */
  v: WidgetVariant;
  /** Schema version. */
  ver: number;
  /** Issued at (epoch seconds). */
  iat: number;
  /** Optional expiration (epoch seconds). */
  exp?: number;
  /** Optional row id (for DB lookup / revocation). */
  rid?: string;
};

const SECRET =
  process.env.WIDGET_TOKEN_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'polskiepogrzeby-widget-demo-secret-change-in-production';

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(payloadStr: string): string {
  return b64url(crypto.createHmac('sha256', SECRET).update(payloadStr).digest());
}

/** Generate a long-lived widget token for a company. */
export function generateWidgetToken(input: {
  companySlug: string;
  variant?: WidgetVariant;
  ttlSeconds?: number; // optional expiration
  rowId?: string;
}): string {
  const payload: WidgetPayload = {
    c: input.companySlug,
    v: input.variant || 'card',
    ver: 1,
    iat: Math.floor(Date.now() / 1000),
    ...(input.ttlSeconds ? { exp: Math.floor(Date.now() / 1000) + input.ttlSeconds } : {}),
    ...(input.rowId ? { rid: input.rowId } : {}),
  };
  const json = JSON.stringify(payload);
  const head = b64url(Buffer.from(json, 'utf8'));
  const sig = sign(head);
  return `${head}.${sig}`;
}

export type WidgetVerifyError = 'malformed' | 'bad-signature' | 'expired' | 'unknown';
export type VerifyResult =
  | { ok: true; payload: WidgetPayload; error?: undefined }
  | { ok: false; payload?: undefined; error: WidgetVerifyError };

/** Verify a widget token. Returns payload or specific error. */
export function verifyWidgetToken(token: string): VerifyResult {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, error: 'malformed' as const };
  }
  const [head, sig] = token.split('.');
  if (!head || !sig) return { ok: false, error: 'malformed' as const };

  const expected = sign(head);
  // constant-time compare
  if (expected.length !== sig.length) return { ok: false, error: 'bad-signature' as const };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return { ok: false, error: 'bad-signature' as const };

  let payload: WidgetPayload;
  try {
    payload = JSON.parse(b64urlDecode(head).toString('utf8'));
  } catch {
    return { ok: false, error: 'malformed' as const };
  }
  if (!payload || typeof payload.c !== 'string' || !payload.v || payload.ver !== 1) {
    return { ok: false, error: 'malformed' as const };
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: 'expired' as const };
  }
  return { ok: true, payload };
}

/** Check if a request origin is allowed for a widget. */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[] | null | undefined): boolean {
  if (!allowedOrigins || allowedOrigins.length === 0) return true; // unrestricted (demo / new widgets)
  if (!origin) return false;
  try {
    const norm = new URL(origin).origin.toLowerCase();
    return allowedOrigins.some((a) => {
      const ax = a.trim().toLowerCase().replace(/\/$/, '');
      if (!ax) return false;
      if (ax === '*') return true;
      // wildcard subdomain: *.example.com
      if (ax.startsWith('*.')) {
        const suffix = ax.slice(1); // .example.com
        return norm.endsWith(suffix);
      }
      return norm === ax;
    });
  } catch {
    return false;
  }
}

/** Generate the JS embed snippet to copy into client websites. */
export function buildEmbedSnippet(opts: { token: string; baseUrl: string; variant?: WidgetVariant }): string {
  const variant = opts.variant || 'card';
  return `<!-- PolskiePogrzeby.pl widget (${variant}) -->
<div id="pp-widget-${opts.token.slice(0, 8)}"></div>
<script async src="${opts.baseUrl}/widget/${opts.token}/embed.js" data-pp-target="pp-widget-${opts.token.slice(0, 8)}"></script>`;
}

/** Generate the iframe embed snippet (alternative simpler form). */
export function buildIframeSnippet(opts: { token: string; baseUrl: string; variant?: WidgetVariant }): string {
  const variant = opts.variant || 'card';
  const heightMap: Record<WidgetVariant, number> = {
    card: 220,
    banner: 120,
    compact: 80,
    reviews: 360,
  };
  return `<iframe src="${opts.baseUrl}/widget/${opts.token}/embed?variant=${variant}" width="100%" height="${heightMap[variant]}" frameborder="0" scrolling="no" style="border:0;display:block;max-width:480px;" title="PolskiePogrzeby.pl widget"></iframe>`;
}
