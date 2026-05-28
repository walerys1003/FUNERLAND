import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT_CONTENT_GEN } from '@/lib/ai/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ContentKind =
  | 'obituary'
  | 'thank-you'
  | 'eulogy'
  | 'company-description'
  | 'faq-answer'
  | 'condolence';

type ContentRequest = {
  type: ContentKind;
  context: Record<string, any>;
  tone?: 'tradycyjny' | 'cieply' | 'wzruszajacy' | 'koscielny';
  length?: 'short' | 'medium' | 'long';
};

// Length presets (max tokens)
const LENGTH_TOKENS = { short: 180, medium: 380, long: 800 };

// Rate limit (in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const e = rateLimitMap.get(ip);
  if (!e || e.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (e.count >= 10) return false;
  e.count++;
  return true;
}

function fallbackObituary(ctx: any): string {
  const name = ctx.personName || 'Bliska osoba';
  const city = ctx.city || '';
  const yearOfDeath = ctx.deathDate
    ? new Date(ctx.deathDate).getFullYear()
    : new Date().getFullYear();
  const yearOfBirth = ctx.birthDate ? new Date(ctx.birthDate).getFullYear() : undefined;
  const lifespan = yearOfBirth ? `${yearOfBirth}–${yearOfDeath}` : `${yearOfDeath}`;
  return `Z wielkim smutkiem żegnamy ${name} (${lifespan}). ${
    city ? `Mieszkał${ctx.gender === 'f' ? 'a' : ''} w ${city}. ` : ''
  }Pozostawi${ctx.gender === 'f' ? 'ła' : 'ł'} po sobie pamięć osoby ciepłej, oddanej rodzinie i wartościom, którymi dzielił${ctx.gender === 'f' ? 'a' : ''} się z najbliższymi.

Uroczystość pogrzebowa odbędzie się ${ctx.funeralDate ? new Date(ctx.funeralDate).toLocaleDateString('pl-PL') : '...'}${ctx.funeralPlace ? ` w ${ctx.funeralPlace}` : ''}.

Rodzina prosi o pamięć i modlitwę.`;
}

function fallbackThankYou(ctx: any): string {
  return `Rodzina Zmarł${ctx.gender === 'f' ? 'ej' : 'ego'} ${ctx.personName || ''} składa serdeczne podziękowania wszystkim, którzy wzięli udział w uroczystości pożegnalnej, przesłali wyrazy współczucia oraz wspierali nas w tym trudnym czasie.

Państwa obecność i ciepłe słowa są dla nas ogromnym wsparciem.`;
}

function fallbackCompanyDesc(ctx: any): string {
  const yrs = ctx.yearsActive || 10;
  const city = ctx.city || 'Polsce';
  return `${ctx.name || 'Nasz zakład pogrzebowy'} od ${yrs} lat wspiera rodziny w ${city} w organizacji godnego pożegnania. Stawiamy na transparentność cen, indywidualne podejście do każdej rodziny i 24-godzinną dostępność. Oferujemy pełen zakres usług — od formalności po ceremonię. Bez presji, bez ukrytych kosztów.`;
}

function fallback(type: ContentKind, ctx: any): string {
  switch (type) {
    case 'obituary':
      return fallbackObituary(ctx);
    case 'thank-you':
      return fallbackThankYou(ctx);
    case 'company-description':
      return fallbackCompanyDesc(ctx);
    case 'eulogy':
      return `Drodzy Państwo,

Stoimy dziś razem, by pożegnać ${ctx.personName || 'bliską osobę'}. ${ctx.personName ? `${ctx.personName} ` : 'Osoba ta '}była dla nas kimś wyjątkowym — ciepłym, oddanym, obecnym w każdej chwili, której potrzebowaliśmy.

Pozostanie z nami w naszej pamięci i sercach.`;
    case 'faq-answer':
      return `To częste pytanie. Polskie prawo precyzyjnie reguluje tę kwestię — najlepiej skonsultować się z zakładem pogrzebowym, który zna lokalne procedury i pomoże w pełni przeprowadzić rodzinę przez formalności.`;
    case 'condolence':
      return `Wyrażam najszczersze wyrazy współczucia. Wiem, że żadne słowa nie zastąpią tej, której Państwo właśnie tracicie, ale chcę, byście wiedzieli, że nie jesteście sami. Łączę się z Państwem w bólu.`;
  }
  return '';
}

function buildUserPrompt(type: ContentKind, ctx: any, tone = 'cieply', length = 'medium'): string {
  const ctxLines = Object.entries(ctx)
    .filter(([_, v]) => v != null && v !== '')
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const map: Record<ContentKind, string> = {
    obituary: `Napisz krótki nekrolog (${length}) w tonie ${tone}, w języku polskim, bez nadmiernej patosu, z szacunkiem.`,
    'thank-you': `Napisz podziękowanie po pogrzebie (${length}) w tonie ${tone}, w języku polskim, klasyczne, oficjalne.`,
    eulogy: `Napisz mowę pożegnalną (${length}) w tonie ${tone}, w języku polskim, do wygłoszenia na ceremonii.`,
    'company-description': `Napisz opis firmy pogrzebowej (${length}) w tonie profesjonalnym, w języku polskim, dla wizytówki w marketplace. Bez agresywnej sprzedaży, podkreślając transparentność i empatię.`,
    'faq-answer': `Napisz odpowiedź na pytanie z FAQ (${length}) w języku polskim, rzeczowo, na podstawie polskiego prawa.`,
    condolence: `Napisz krótkie wyrazy współczucia (${length}), w języku polskim, z szacunkiem i empatią.`,
  };
  return `${map[type]}

DANE WEJŚCIOWE:
${ctxLines}

WYMAGANIA:
- NIGDY nie używaj słów "trup", "zwłoki", "umarł".
- Stosuj zwroty: "osoba, która odeszła", "pożegnanie", "odejście".
- Trzymaj się faktów z danych wejściowych.
- Brak emoji.
- Brak hashtagów.
- Brak treści sprzedażowych.`;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Limit zapytań przekroczony.' }, { status: 429 });
    }
    const body = (await req.json()) as ContentRequest;
    if (!body.type || !body.context) {
      return NextResponse.json({ error: 'Wymagane: type, context' }, { status: 400 });
    }
    const tone = body.tone || 'cieply';
    const length = body.length || 'medium';
    const maxTokens = LENGTH_TOKENS[length] || 380;

    // Fallback when no API key configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        text: fallback(body.type, body.context),
        mock: true,
        type: body.type,
      });
    }

    const userPrompt = buildUserPrompt(body.type, body.context, tone, length);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_CONTENT_GEN },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      // graceful fallback
      return NextResponse.json({
        text: fallback(body.type, body.context),
        fallback: true,
        type: body.type,
      });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || fallback(body.type, body.context);
    return NextResponse.json({ text, type: body.type });
  } catch (e: any) {
    console.error('AI content error:', e);
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}
