import { NextResponse } from 'next/server';
import { verifyWidgetToken, isOriginAllowed } from '@/lib/widget/token';
import { companies as ALL } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /widget/[token]/embed.js
 *
 * Serves a self-contained JS bootstrap that injects the widget iframe into the
 * host page (where the <script src="..."> tag was placed).
 *
 * Returns Content-Type: application/javascript.
 * Includes permissive CORS (origin-checked when company_widgets row has allowed_origins).
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const verified = verifyWidgetToken(token);

  if (!verified.ok) {
    const err = verified.error;
    return new NextResponse(
      `console.error("[PP widget] invalid token: ${err}");`,
      {
        status: 200,
        headers: { 'content-type': 'application/javascript; charset=utf-8' },
      },
    );
  }

  const origin = req.headers.get('origin');
  // In demo mode (no DB), all origins allowed. Production: load allowed_origins
  // from company_widgets table by token and pass to isOriginAllowed().
  const allowedOrigins: string[] | null = null;
  if (!isOriginAllowed(origin, allowedOrigins)) {
    return new NextResponse('console.warn("[PP widget] origin not allowed");', {
      status: 200,
      headers: { 'content-type': 'application/javascript; charset=utf-8' },
    });
  }

  const { c: slug, v: variant } = verified.payload;
  const company = ALL.find((x) => x.slug === slug);
  if (!company) {
    return new NextResponse(
      `console.error("[PP widget] company not found: ${slug}");`,
      {
        status: 200,
        headers: { 'content-type': 'application/javascript; charset=utf-8' },
      },
    );
  }

  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const embedUrl = `${baseUrl}/widget/${token}/embed?variant=${variant}`;

  const heightMap: Record<string, number> = {
    card: 220,
    banner: 120,
    compact: 80,
    reviews: 360,
  };
  const height = heightMap[variant] || 220;

  const js = `(function(){
  var s = document.currentScript;
  var targetId = s && s.getAttribute('data-pp-target');
  var host = targetId ? document.getElementById(targetId) : null;
  if (!host) {
    host = document.createElement('div');
    if (s && s.parentNode) s.parentNode.insertBefore(host, s);
  }
  var ifr = document.createElement('iframe');
  ifr.src = ${JSON.stringify(embedUrl)};
  ifr.width = '100%';
  ifr.height = ${height};
  ifr.frameBorder = '0';
  ifr.scrolling = 'no';
  ifr.title = 'PolskiePogrzeby.pl — ' + ${JSON.stringify(company.name)};
  ifr.style.border = '0';
  ifr.style.display = 'block';
  ifr.style.maxWidth = '480px';
  ifr.style.width = '100%';
  ifr.setAttribute('loading', 'lazy');
  host.appendChild(ifr);
  // Optional: post-message resize support
  window.addEventListener('message', function(e){
    try {
      if (!e || !e.data || e.data.__pp !== 'resize') return;
      if (e.source !== ifr.contentWindow) return;
      if (typeof e.data.height === 'number' && e.data.height > 0) {
        ifr.height = e.data.height;
      }
    } catch(_){}
  });
})();`;

  return new NextResponse(js, {
    status: 200,
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
      'access-control-allow-origin': '*',
      'x-pp-widget': 'v1',
    },
  });
}
