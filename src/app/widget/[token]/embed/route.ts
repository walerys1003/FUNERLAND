import { NextResponse } from 'next/server';
import { verifyWidgetToken, type WidgetVariant } from '@/lib/widget/token';
import { companies as ALL } from '@/lib/data';
import { reviewStore } from '@/lib/marketplace/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /widget/[token]/embed?variant=card|banner|compact|reviews
 *
 * Returns standalone HTML page rendered inside an iframe on third-party sites.
 * No site chrome (header/footer) — just the widget content with inline styles.
 *
 * Implemented as Route Handler (not page.tsx) to bypass the root layout entirely.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const verified = verifyWidgetToken(token);

  if (!verified.ok) {
    return new NextResponse(errorHtml(`Token nieprawidłowy: ${verified.error}`), {
      status: 200,
      headers: htmlHeaders(),
    });
  }

  const { c: slug } = verified.payload;
  const url = new URL(req.url);
  const variant =
    (url.searchParams.get('variant') as WidgetVariant | null) || verified.payload.v || 'card';

  const company = ALL.find((x) => x.slug === slug);
  if (!company) {
    return new NextResponse(errorHtml('Firma nie istnieje lub została usunięta.'), {
      status: 200,
      headers: htmlHeaders(),
    });
  }

  const baseUrl = `${url.protocol}//${url.host}`;
  const profileUrl = `${baseUrl}/firma/${company.slug}?utm_source=widget&utm_medium=embed&utm_campaign=${variant}`;
  const recentReviews = reviewStore
    .forCompany(company.slug, false)
    .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 3);

  let body = '';
  if (variant === 'banner') body = renderBanner(company, profileUrl);
  else if (variant === 'compact') body = renderCompact(company, profileUrl);
  else if (variant === 'reviews') body = renderReviews(company, profileUrl, recentReviews);
  else body = renderCard(company, profileUrl);

  const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${escapeHtml(company.name)} — PolskiePogrzeby.pl</title>
<style>${WIDGET_CSS}</style>
</head>
<body>
${body}
<script>
// post-message height to parent for auto-resize
(function(){
  function send(){
    try {
      var h = document.documentElement.scrollHeight || document.body.scrollHeight;
      window.parent && window.parent.postMessage({ __pp: 'resize', height: h }, '*');
    } catch(_){}
  }
  window.addEventListener('load', send);
  setTimeout(send, 50);
  setTimeout(send, 500);
})();
</script>
</body>
</html>`;

  return new NextResponse(html, { status: 200, headers: htmlHeaders() });
}

function htmlHeaders(): HeadersInit {
  return {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=300, s-maxage=300',
    // Allow embedding via iframe; widget is meant to be embedded.
    'x-frame-options': 'ALLOWALL',
    'content-security-policy': "frame-ancestors *",
  };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const WIDGET_CSS = `
*{box-sizing:border-box}
body{margin:0;padding:0;background:transparent;color:#1a1a1a;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:13.5px;line-height:1.4}
.pp-w{background:#fff;border:1px solid #e7e0d4;border-radius:14px;padding:14px;box-shadow:0 2px 8px rgba(15,42,68,.06);max-width:480px}
.pp-row{display:flex;gap:12px;align-items:flex-start}
.pp-logo{width:48px;height:48px;border-radius:10px;background:#0F2A44;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;flex-shrink:0;font-family:Georgia,serif}
.pp-name{font-weight:600;color:#0F2A44;font-size:14.5px;margin:0 0 2px;font-family:Georgia,serif;letter-spacing:-.2px}
.pp-meta{font-size:12px;color:#6b6256;margin:0}
.pp-stars{color:#d97706;font-size:13px;letter-spacing:1px}
.pp-stars span{color:#d6d3d1}
.pp-rating{display:inline-flex;gap:6px;align-items:center;margin-top:4px;font-size:12px;color:#3d3833}
.pp-rating b{color:#0F2A44}
.pp-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.pp-badge{font-size:10.5px;padding:2px 7px;border-radius:99px;border:1px solid #d6d3d1;color:#3d3833;background:#fafaf7}
.pp-badge.verified{background:#ecfdf5;border-color:#a7f3d0;color:#047857}
.pp-cta{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.pp-btn{display:inline-flex;align-items:center;justify-content:center;padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:500;text-decoration:none;border:1px solid transparent;transition:all .15s}
.pp-btn-primary{background:#0F2A44;color:#fff}
.pp-btn-primary:hover{background:#1a3a5c}
.pp-btn-secondary{background:#fff;color:#0F2A44;border-color:#cbd5e1}
.pp-btn-secondary:hover{background:#f8fafc}
.pp-footer{margin-top:10px;padding-top:8px;border-top:1px solid #f1ede4;display:flex;justify-content:space-between;align-items:center;font-size:10.5px;color:#9ca3af}
.pp-footer a{color:#9ca3af;text-decoration:none}
.pp-footer a:hover{color:#0F2A44}
.pp-compact{display:flex;align-items:center;justify-content:space-between;padding:10px 12px}
.pp-compact .pp-name{font-size:13px}
.pp-banner{padding:12px 16px}
.pp-banner .pp-row{align-items:center}
.pp-banner .pp-name{font-size:15px}
.pp-review{padding:8px 0;border-bottom:1px solid #f1ede4}
.pp-review:last-child{border-bottom:0}
.pp-review-title{font-weight:600;color:#0F2A44;font-size:12.5px;margin:0 0 2px}
.pp-review-body{font-size:12px;color:#3d3833;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.pp-review-meta{font-size:10.5px;color:#9ca3af;margin-top:2px}
`;

function stars(rating: number): string {
  const full = Math.round(rating);
  let out = '';
  for (let i = 0; i < 5; i++) out += i < full ? '★' : '<span>★</span>';
  return `<span class="pp-stars">${out}</span>`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function renderCard(c: typeof ALL[number], url: string): string {
  return `<div class="pp-w">
  <div class="pp-row">
    <div class="pp-logo">${escapeHtml(initials(c.name))}</div>
    <div style="flex:1;min-width:0">
      <h3 class="pp-name">${escapeHtml(c.name)}</h3>
      <p class="pp-meta">${escapeHtml(c.city)}${c.district ? ' · ' + escapeHtml(c.district) : ''}</p>
      <div class="pp-rating">${stars(c.rating)} <b>${c.rating.toFixed(1)}</b> / 5 · ${c.reviewsCount} opinii</div>
      <div class="pp-badges">
        ${c.isVerified ? '<span class="pp-badge verified">✓ Zweryfikowana</span>' : ''}
        ${c.phone24h ? '<span class="pp-badge">24/7</span>' : ''}
        ${c.yearsActive >= 20 ? `<span class="pp-badge">${c.yearsActive} lat na rynku</span>` : ''}
      </div>
    </div>
  </div>
  <div class="pp-cta">
    <a class="pp-btn pp-btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">Zobacz profil</a>
    <a class="pp-btn pp-btn-secondary" href="${escapeHtml(url)}#kontakt" target="_blank" rel="noopener">Kontakt</a>
  </div>
  ${renderFooter(url)}
</div>`;
}

function renderBanner(c: typeof ALL[number], url: string): string {
  return `<div class="pp-w pp-banner">
  <div class="pp-row">
    <div class="pp-logo">${escapeHtml(initials(c.name))}</div>
    <div style="flex:1;min-width:0">
      <h3 class="pp-name">${escapeHtml(c.name)}</h3>
      <div class="pp-rating">${stars(c.rating)} <b>${c.rating.toFixed(1)}</b> · ${c.reviewsCount} opinii${c.isVerified ? ' · <span style="color:#047857">✓ zweryfikowana</span>' : ''}</div>
    </div>
    <a class="pp-btn pp-btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">Zobacz profil</a>
  </div>
  ${renderFooter(url, true)}
</div>`;
}

function renderCompact(c: typeof ALL[number], url: string): string {
  return `<a class="pp-w pp-compact" href="${escapeHtml(url)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:flex">
  <div style="min-width:0;flex:1">
    <div class="pp-name" style="margin:0">${escapeHtml(c.name)}</div>
    <div class="pp-rating">${stars(c.rating)} <b>${c.rating.toFixed(1)}</b> · ${c.reviewsCount} opinii</div>
  </div>
  <span class="pp-btn pp-btn-primary" style="flex-shrink:0">Profil →</span>
</a>`;
}

function renderReviews(c: typeof ALL[number], url: string, reviews: any[]): string {
  const reviewItems =
    reviews.length === 0
      ? '<p class="pp-meta" style="padding:8px 0">Brak opublikowanych opinii.</p>'
      : reviews
          .map(
            (r) => `<div class="pp-review">
    <div class="pp-rating">${stars(r.rating)} <b>${r.rating}</b>/5</div>
    <h4 class="pp-review-title">${escapeHtml(r.title || '')}</h4>
    <p class="pp-review-body">${escapeHtml(r.body || '')}</p>
    <div class="pp-review-meta">${escapeHtml(r.authorName || 'Klient')}${r.createdAt ? ' · ' + new Date(r.createdAt).toLocaleDateString('pl-PL') : ''}</div>
  </div>`,
          )
          .join('');
  return `<div class="pp-w">
  <div class="pp-row">
    <div style="flex:1;min-width:0">
      <h3 class="pp-name">${escapeHtml(c.name)}</h3>
      <div class="pp-rating">${stars(c.rating)} <b>${c.rating.toFixed(1)}</b> / 5 · ${c.reviewsCount} opinii</div>
    </div>
  </div>
  <div style="margin-top:8px">${reviewItems}</div>
  <div class="pp-cta">
    <a class="pp-btn pp-btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">Wszystkie opinie</a>
  </div>
  ${renderFooter(url)}
</div>`;
}

function renderFooter(url: string, compact = false): string {
  if (compact) return '';
  return `<div class="pp-footer">
  <span>Powered by</span>
  <a href="https://polskiepogrzeby.pl?utm_source=widget&utm_medium=embed" target="_blank" rel="noopener">PolskiePogrzeby.pl</a>
</div>`;
}

function errorHtml(msg: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Widget</title><style>${WIDGET_CSS}</style></head>
<body><div class="pp-w" style="text-align:center;color:#9ca3af;font-size:12px">${escapeHtml(msg)}</div></body></html>`;
}
