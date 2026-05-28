'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { QUICK_REPLIES } from '@/lib/ai/prompts';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    'Dzień dobry. Jestem asystentem PolskiePogrzeby.pl. Wiem, że to trudny czas — jestem tu, aby pomóc Państwu zorganizować pożegnanie bliskiej osoby w spokojny i godny sposób. W czym mogę pomóc?',
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = await res.json();
      const reply: Message = {
        role: 'assistant',
        content: data.message || data.error || 'Przepraszam, nie udało się odpowiedzieć.',
      };
      setMessages([...newMessages, reply]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Wystąpił błąd połączenia. Spróbuj proszę za chwilę.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Zamknij asystenta' : 'Otwórz asystenta'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2E4F3E] text-white shadow-lg transition hover:bg-[#243f31] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#C9A65F]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-[#0F1B2D] px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C9A65F]" />
              <div>
                <div className="font-medium" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
                  Asystent PolskiePogrzeby.pl
                </div>
                <div className="text-xs text-stone-300">Dostępny 24/7 · empatyczny · bez presji</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#2E4F3E] text-white rounded-br-sm'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                  }`}
                >
                  {m.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#2E4F3E]" />
                  <span className="text-sm text-stone-500">Pisze...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 py-2 border-t border-stone-200 bg-white">
              <div className="text-xs text-stone-500 mb-2">Często zadawane:</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition border border-stone-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-stone-200 bg-white px-3 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napisz wiadomość..."
              disabled={loading}
              className="flex-1 rounded-full border border-stone-300 px-4 py-2 text-sm focus:border-[#2E4F3E] focus:outline-none focus:ring-1 focus:ring-[#2E4F3E] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E4F3E] text-white hover:bg-[#243f31] disabled:opacity-40 transition"
              aria-label="Wyślij"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="bg-white border-t border-stone-100 px-4 py-2 text-[10px] text-stone-400 text-center">
            Twoja rozmowa jest poufna. RODO compliant. Nie zastępujemy pomocy psychologicznej.
          </div>
        </div>
      )}
    </>
  );
}
