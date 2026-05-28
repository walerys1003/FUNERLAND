import { NextResponse } from 'next/server';
import { getServerUser, getUserCompanies, AUTH_CONFIGURED } from '@/lib/auth/session';
import { widgetRepo, subscriptionRepo } from '@/lib/marketplace/repo';
import { companies as ALL_COMPANIES } from '@/lib/data';
import {
  generateWidgetToken,
  buildEmbedSnippet,
  buildIframeSnippet,
  type WidgetVariant,
} from '@/lib/widget/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/widget/issue
 *
 * Issues a new widget token for the caller's company and persists the configuration
 * (token + variant + allowed_origins) in company_widgets table.
 *
 * Body:
 *   {
 *     variant?: 'card' | 'banner' | 'compact' | 'reviews'
 *     allowedOrigins?: string[]   // empty = unrestricted
 *     primaryColor?: string
 *     theme?: 'light' | 'dark' | 'auto'
 *   }
 *
 * Premium plan required (returns 403 otherwise).
 * In demo mode (no auth) — falls back to the first premium company in seed data.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      variant?: WidgetVariant;
      allowedOrigins?: string[];
      primaryColor?: string;
      theme?: 'light' | 'dark' | 'auto';
    };

    // Resolve company
    let companySlug: string | undefined;
    let plan = 'free';

    if (AUTH_CONFIGURED) {
      const user = await getServerUser();
      if (!user) {
        return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
      }
      const userCompanies = await getUserCompanies();
      const first = userCompanies[0];
      if (!first) {
        return NextResponse.json({ error: 'Brak przypisanej firmy' }, { status: 403 });
      }
      companySlug = first.slug;
      const sub = await subscriptionRepo.forCompany(first.slug);
      plan = sub?.plan || ALL_COMPANIES.find((c) => c.slug === first.slug)?.plan || 'free';
    } else {
      // Demo fallback — pick first premium company from seed
      const demo = ALL_COMPANIES.find((c) => c.plan === 'premium') || ALL_COMPANIES[0];
      companySlug = demo.slug;
      plan = demo.plan;
    }

    if (plan !== 'premium') {
      return NextResponse.json(
        {
          error: 'Widget embeddable jest dostępny w planie Premium.',
          currentPlan: plan,
        },
        { status: 403 },
      );
    }

    const variant: WidgetVariant = body.variant && ['card', 'banner', 'compact', 'reviews'].includes(body.variant)
      ? body.variant
      : 'card';

    const allowedOrigins = Array.isArray(body.allowedOrigins)
      ? body.allowedOrigins
          .map((o) => String(o).trim())
          .filter((o) => o.length > 0 && o.length < 200)
          .slice(0, 20)
      : [];

    // Generate signed token
    const token = generateWidgetToken({
      companySlug: companySlug!,
      variant,
    });

    // Persist (no-op in demo mode; returns in-memory record otherwise)
    const widget = await widgetRepo.upsert({
      companySlug: companySlug!,
      token,
      variant,
      theme: body.theme || 'light',
      primaryColor: body.primaryColor || '#2E4F3E',
      allowedOrigins,
    });

    const url = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;

    return NextResponse.json({
      ok: true,
      token,
      variant,
      companySlug,
      allowedOrigins,
      widget,
      snippets: {
        script: buildEmbedSnippet({ token, baseUrl, variant }),
        iframe: buildIframeSnippet({ token, baseUrl, variant }),
      },
      embedUrl: `${baseUrl}/widget/${token}/embed?variant=${variant}`,
      jsUrl: `${baseUrl}/widget/${token}/embed.js`,
    });
  } catch (e: any) {
    console.error('widget/issue error:', e);
    return NextResponse.json({ error: 'Wystąpił błąd przy wystawianiu widgetu' }, { status: 500 });
  }
}

/** GET — list issued widgets for the caller's company. */
export async function GET() {
  try {
    let companySlug: string | undefined;

    if (AUTH_CONFIGURED) {
      const user = await getServerUser();
      if (!user) return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
      const userCompanies = await getUserCompanies();
      companySlug = userCompanies[0]?.slug;
    } else {
      const demo = ALL_COMPANIES.find((c) => c.plan === 'premium') || ALL_COMPANIES[0];
      companySlug = demo.slug;
    }
    if (!companySlug) return NextResponse.json({ widgets: [] });

    const widgets = await widgetRepo.forCompany(companySlug);
    return NextResponse.json({ widgets, companySlug });
  } catch (e) {
    return NextResponse.json({ widgets: [] });
  }
}
