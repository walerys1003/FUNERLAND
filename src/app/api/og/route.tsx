import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PALETTE = {
  navy: '#0F2A44',
  cream: '#F7F2EA',
  accent: '#5A8268',
  accentLight: '#D5E1D9',
  text: '#1B1B1B',
  textSecondary: '#5A5A5A',
  textMuted: '#8A8A8A',
};

type OgType = 'default' | 'tool' | 'article' | 'company' | 'city' | 'obituary';

const TYPE_LABELS: Record<OgType, string> = {
  default: 'PolskiePogrzeby.pl',
  tool: 'Narzędzie',
  article: 'Poradnik',
  company: 'Zakład pogrzebowy',
  city: 'Miasto',
  obituary: 'Wspomnienie',
};

const TYPE_ICONS: Record<OgType, string> = {
  default: '🕊️',
  tool: '🛠️',
  article: '📖',
  company: '🏛️',
  city: '📍',
  obituary: '🕯️',
};

/**
 * Dynamic Open Graph image generator.
 *
 * Usage:
 *   /api/og?title=Kalkulator%20kosztu&type=tool
 *   /api/og?title=Warszawa&subtitle=23%20zak%C5%82adów&type=city
 *
 * Query params:
 *  - title (required): main heading (truncated to ~80 chars)
 *  - subtitle (optional): secondary line under title
 *  - type (optional): default | tool | article | company | city | obituary
 *  - meta (optional): tiny line above title (defaults to derived from type)
 *
 * Returns: 1200×630 PNG with brand-consistent typography.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get('title') || 'Polskie Pogrzeby').slice(0, 100);
    const subtitle = (searchParams.get('subtitle') || '').slice(0, 120);
    const type = (searchParams.get('type') || 'default') as OgType;
    const meta = (searchParams.get('meta') || TYPE_LABELS[type] || 'PolskiePogrzeby.pl').slice(
      0,
      60,
    );
    const icon = TYPE_ICONS[type] || '🕊️';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: PALETTE.cream,
            padding: '64px 72px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              background: PALETTE.navy,
              display: 'flex',
            }}
          />

          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: PALETTE.navy,
                  color: PALETTE.cream,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                🕊️
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: PALETTE.navy,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  display: 'flex',
                }}
              >
                PolskiePogrzeby.pl
              </div>
            </div>
            <div
              style={{
                fontSize: 14,
                color: PALETTE.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 2,
                display: 'flex',
              }}
            >
              Pożegnaj godnie
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              marginTop: 80,
              marginBottom: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 18,
                color: PALETTE.accent,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              <span style={{ display: 'flex', fontSize: 24 }}>{icon}</span>
              <span style={{ display: 'flex' }}>{meta}</span>
            </div>

            <div
              style={{
                fontSize: title.length > 50 ? 56 : 72,
                color: PALETTE.navy,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                maxWidth: 1000,
                display: 'flex',
                fontFamily: 'serif',
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: 28,
                  color: PALETTE.textSecondary,
                  lineHeight: 1.3,
                  maxWidth: 980,
                  display: 'flex',
                  marginTop: 8,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `2px solid ${PALETTE.accentLight}`,
              paddingTop: 24,
              marginTop: 40,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                fontSize: 18,
                color: PALETTE.textSecondary,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', color: PALETTE.accent }}>✓</span>
                <span style={{ display: 'flex' }}>Bezpłatnie</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', color: PALETTE.accent }}>✓</span>
                <span style={{ display: 'flex' }}>Bez logowania</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', color: PALETTE.accent }}>✓</span>
                <span style={{ display: 'flex' }}>Zweryfikowani partnerzy</span>
              </div>
            </div>
            <div
              style={{
                fontSize: 18,
                color: PALETTE.navy,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              polskiepogrzeby.pl
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch (e) {
    console.error('OG generation failed', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
