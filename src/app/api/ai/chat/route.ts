import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT_ASSISTANT, SAFETY_RESPONSES } from '@/lib/ai/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  sessionId?: string;
};

// Simple keyword-based crisis detection (PL)
const CRISIS_KEYWORDS = [
  'nie chcę żyć',
  'samobój',
  'odebrać sobie życie',
  'nie wytrzymam',
  'chce umrzeć',
  'nie ma sensu',
  'skończyć ze sobą',
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

// Simple rate limiting (in-memory; for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Spróbuj ponownie za chwilę.' },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ChatRequest;
    const { messages = [], sessionId } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Brak wiadomości' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'Brak wiadomości użytkownika' }, { status: 400 });
    }

    // Crisis check — return safety response immediately
    if (detectCrisis(lastUserMessage.content)) {
      return NextResponse.json({
        message: SAFETY_RESPONSES.crisis,
        sessionId,
        flagged: 'crisis',
      });
    }

    // If no OpenAI key configured → return mock response (dev/preview safe)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        message: `Dzięki za pytanie. W tej chwili działam w trybie demo (brak konfiguracji OpenAI w środowisku).

Wkrótce uruchomimy pełnego asystenta AI, który pomoże Państwu:
- wybrać typ ceremonii (tradycyjny / kremacja / świecki),
- zrozumieć koszty i formalności,
- otrzymać 3 spersonalizowane oferty.

Tymczasem zachęcam do wypełnienia formularza zapytaniowego — bezpośrednio dostaną Państwo oferty od sprawdzonych zakładów.`,
        sessionId,
        mock: true,
      });
    }

    // Real OpenAI call
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_ASSISTANT },
          ...messages.slice(-10), // last 10 for context
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('OpenAI error:', err);
      return NextResponse.json(
        { error: 'Chwilowo nie mogę odpowiedzieć. Spróbuj proszę za chwilę.' },
        { status: 502 }
      );
    }

    const data = await openaiRes.json();
    const message = data.choices?.[0]?.message?.content || 'Przepraszam, nie udało się wygenerować odpowiedzi.';

    // TODO: log to Supabase ai_logs table
    // await supabaseAdmin.from('ai_logs').insert({ session_id: sessionId, user_message: lastUserMessage.content, ai_response: message, model: 'gpt-4o-mini', ip });

    return NextResponse.json({ message, sessionId });
  } catch (e: any) {
    console.error('AI chat error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd. Spróbuj proszę ponownie.' },
      { status: 500 }
    );
  }
}
