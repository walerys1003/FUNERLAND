import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Web-vitals collection endpoint.
 *
 * Receives Core Web Vitals beacons from <WebVitals /> in client.
 * In production: forwards to Vercel Analytics / custom sink (currently logs only).
 *
 * Accepts both JSON body and raw text (sendBeacon often uses text/plain).
 */
export async function POST(req: NextRequest) {
  try {
    // sendBeacon may send body as plain text — handle both
    const raw = await req.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      // ignore malformed body
    }

    const enriched = {
      ...payload,
      ts: Date.now(),
      ua: req.headers.get('user-agent') || undefined,
      country: req.headers.get('x-vercel-ip-country') || undefined,
    };

    // Lightweight log — replace with downstream sink (Logflare, Sentry, etc.) later.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[vitals]', enriched);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'vitals' });
}
