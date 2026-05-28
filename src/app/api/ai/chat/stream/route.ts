import { SYSTEM_PROMPT_ASSISTANT, SAFETY_RESPONSES } from '@/lib/ai/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

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

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

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

function sseChunk(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/ai/chat/stream — Server-Sent Events streaming chat.
 *
 * Body: { messages: ChatMessage[], sessionId?: string }
 * Response: text/event-stream with events:
 *   - { delta: "..." }     (incremental tokens)
 *   - { done: true }       (end of stream)
 *   - { error: "..." }     (error info)
 *   - { flagged: "crisis" }(safety override)
 */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response('rate-limit', { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const messages: ChatMessage[] = body.messages || [];
  const sessionId: string | undefined = body.sessionId;
  const lastUser = messages.filter((m) => m.role === 'user').pop();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Crisis short-circuit
        if (lastUser && detectCrisis(lastUser.content)) {
          controller.enqueue(encoder.encode(sseChunk({ flagged: 'crisis' })));
          for (const ch of SAFETY_RESPONSES.crisis.match(/.{1,40}/g) || []) {
            controller.enqueue(encoder.encode(sseChunk({ delta: ch })));
            await new Promise((r) => setTimeout(r, 30));
          }
          controller.enqueue(encoder.encode(sseChunk({ done: true, sessionId })));
          controller.close();
          return;
        }

        if (!process.env.OPENAI_API_KEY) {
          // Mock streaming response
          const mock =
            'Witaj. Działam aktualnie w trybie demonstracyjnym — brak klucza OpenAI. ' +
            'Mogę pomóc w wyborze typu ceremonii, oszacowaniu kosztów i dopasowaniu firm. ' +
            'Napisz, w jakim mieście i z jakim budżetem szukasz wsparcia.';
          for (const word of mock.split(/(\s+)/)) {
            controller.enqueue(encoder.encode(sseChunk({ delta: word })));
            await new Promise((r) => setTimeout(r, 25));
          }
          controller.enqueue(encoder.encode(sseChunk({ done: true, sessionId, mock: true })));
          controller.close();
          return;
        }

        // Real OpenAI streaming
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT_ASSISTANT },
              ...messages.slice(-10),
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (!openaiRes.ok || !openaiRes.body) {
          controller.enqueue(encoder.encode(sseChunk({ error: 'openai-error' })));
          controller.close();
          return;
        }

        const reader = openaiRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(sseChunk({ delta })));
              }
            } catch {
              // ignore malformed lines
            }
          }
        }

        controller.enqueue(encoder.encode(sseChunk({ done: true, sessionId })));
        controller.close();
      } catch (e: any) {
        controller.enqueue(encoder.encode(sseChunk({ error: e?.message || 'stream-failed' })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
