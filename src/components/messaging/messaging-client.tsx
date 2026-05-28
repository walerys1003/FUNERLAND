'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send, MessageCircle, User2, Building2, Loader2 } from 'lucide-react';

type Thread = {
  id: string;
  companySlug: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  bookingNumber?: string;
  updatedAt: string;
  unreadForCompany: number;
  unreadForCustomer: number;
};

type Message = {
  id: string;
  threadId: string;
  authorRole: 'customer' | 'company' | 'system';
  authorName: string;
  body: string;
  createdAt: string;
};

type Props =
  | { role: 'company'; companySlug: string; customerEmail?: never }
  | { role: 'customer'; customerEmail: string; companySlug?: never };

export default function MessagingClient(props: Props) {
  const { role } = props;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [sending, setSending] = useState(false);

  const params = useMemo(() => {
    if (role === 'company') return `role=company&companySlug=${(props as any).companySlug}`;
    return `role=customer&email=${encodeURIComponent((props as any).customerEmail)}`;
  }, [role, props]);

  // Load threads
  useEffect(() => {
    setLoadingThreads(true);
    fetch(`/api/messaging?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setThreads(d.threads || []);
        if (d.threads?.[0]) setActive(d.threads[0].id);
      })
      .finally(() => setLoadingThreads(false));
  }, [params]);

  // Load messages for active thread + poll every 5s
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const load = () =>
      fetch(`/api/messaging?threadId=${active}`)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setMessages(d.messages || []);
        });
    load();
    // Mark as read
    fetch('/api/messaging', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: active, role, action: 'markRead' }),
    });
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [active, role]);

  async function send() {
    if (!active || !input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: active,
          authorRole: role,
          authorName: role === 'company' ? 'Firma' : 'Klient',
          body: input.trim(),
        }),
      });
      const d = await res.json();
      if (d.ok && d.message) {
        setMessages((m) => [...m, d.message]);
        setInput('');
      }
    } finally {
      setSending(false);
    }
  }

  const activeThread = threads.find((t) => t.id === active);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="grid md:grid-cols-[280px_1fr] min-h-[500px]">
        {/* Threads list */}
        <aside className="border-r border-stone-200 bg-stone-50 overflow-y-auto max-h-[600px]">
          <div className="px-4 py-3 border-b border-stone-200">
            <h2 className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Wątki ({threads.length})
            </h2>
          </div>
          {loadingThreads ? (
            <div className="p-6 text-center text-stone-400 text-sm">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-1" /> Ładuję...
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-stone-500 text-sm">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-stone-300" />
              Brak wiadomości.
              <br />
              Wątki tworzą się automatycznie po rezerwacji.
            </div>
          ) : (
            <ul>
              {threads.map((t) => {
                const unread =
                  role === 'company' ? t.unreadForCompany : t.unreadForCustomer;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setActive(t.id)}
                      className={`w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-white transition ${
                        active === t.id ? 'bg-white' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-stone-900 truncate">
                          {role === 'company' ? t.customerName : t.companySlug}
                        </div>
                        {unread > 0 && (
                          <span className="bg-[#C9A65F] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 truncate mt-0.5">{t.subject}</div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {new Date(t.updatedAt).toLocaleString('pl-PL', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Conversation */}
        <section className="flex flex-col">
          {activeThread ? (
            <>
              <header className="px-5 py-3 border-b border-stone-200 bg-white">
                <div className="text-sm font-medium text-stone-900">{activeThread.subject}</div>
                <div className="text-xs text-stone-500">
                  {role === 'company'
                    ? `${activeThread.customerName} · ${activeThread.customerEmail}`
                    : `Firma: ${activeThread.companySlug}`}
                  {activeThread.bookingNumber && ` · ${activeThread.bookingNumber}`}
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-stone-50 max-h-[450px]">
                {messages.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-8">
                    Brak wiadomości. Napisz pierwszy.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine =
                      (role === 'company' && m.authorRole === 'company') ||
                      (role === 'customer' && m.authorRole === 'customer');
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        {!mine && (
                          <div className="h-7 w-7 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                            {m.authorRole === 'company' ? (
                              <Building2 className="h-4 w-4 text-stone-600" />
                            ) : (
                              <User2 className="h-4 w-4 text-stone-600" />
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                            mine
                              ? 'bg-[#2E4F3E] text-white rounded-br-sm'
                              : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                          }`}
                        >
                          {m.body}
                          <div
                            className={`text-[10px] mt-1 ${
                              mine ? 'text-white/70' : 'text-stone-400'
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="border-t border-stone-200 p-3 bg-white flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  maxLength={4000}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="px-4 py-2 rounded-lg bg-[#2E4F3E] text-white text-sm hover:bg-[#26412F] disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Wyślij
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
              Wybierz wątek po lewej.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
