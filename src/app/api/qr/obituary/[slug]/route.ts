import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { obituaryRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

/**
 * GET /api/qr/obituary/:slug?format=svg|png&size=512
 *
 * Generates a QR code linking to the obituary's canonical URL.
 * Useful for printed materials (klepsydry, programy ceremonii) — guests can
 * scan to access the digital memorial, condolence book and memory wall.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) {
    return NextResponse.json({ error: 'Nie znaleziono nekrologu' }, { status: 404 });
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get('format') || 'svg').toLowerCase();
  const size = Math.min(2048, Math.max(128, parseInt(url.searchParams.get('size') || '512', 10)));

  const targetUrl = `${BASE_URL}/nekrologi/${slug}`;

  try {
    if (format === 'png') {
      const buf = await QRCode.toBuffer(targetUrl, {
        type: 'png',
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#1F2A37', light: '#FFFFFF' },
      });
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          'Content-Disposition': `inline; filename="qr-${slug}.png"`,
        },
      });
    }

    // Default: SVG (lighter, scalable, prints crisply)
    const svg = await QRCode.toString(targetUrl, {
      type: 'svg',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1F2A37', light: '#FFFFFF' },
    });
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Content-Disposition': `inline; filename="qr-${slug}.svg"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Błąd generowania QR' }, { status: 500 });
  }
}
