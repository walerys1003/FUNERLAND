'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  MessageSquareQuote,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  Heart,
} from 'lucide-react';
import { generateSpeech, type SpeechInput } from '@/lib/tools/checklists';

export default function SpeechClient() {
  const [input, setInput] = useState<SpeechInput>({
    personName: '',
    relation: '',
    age: undefined,
    traits: '',
    memory: '',
    passion: '',
    tone: 'osobisty',
    authorName: '',
  });
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  const ready =
    input.personName.trim().length > 0 &&
    input.relation.trim().length > 0 &&
    input.authorName.trim().length > 0;

  const localSpeech = useMemo(() => (ready ? generateSpeech(input) : ''), [input, ready]);
  const speech = aiText || localSpeech;

  async function copy() {
    try {
      await navigator.clipboard.writeText(speech);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function download() {
    const blob = new Blob([speech], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mowa-pozegnalna-${input.personName.replace(/\s+/g, '-').toLowerCase() || 'wzor'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generateWithAI() {
    if (!ready) return;
    setAiLoading(true);
    setAiText(null);
    try {
      const prompt = `Napisz krótką (1-2 minuty czytania) mowę pożegnalną na pogrzeb.
Osoba zmarła: ${input.personName}
Pokrewieństwo do mówcy: ${input.relation}
${input.age ? `Wiek: ${input.age}` : ''}
Cechy charakteru: ${input.traits || '—'}
Pasje / praca: ${input.passion || '—'}
Wspomnienie: ${input.memory || '—'}
Ton: ${input.tone}
Autor: ${input.authorName}

Wymagania: ciepły ton, język polski, bez słów "trup" czy "zwłoki", maksymalnie 250 słów.`;
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'speech', prompt }),
      });
      if (!res.ok) throw new Error('AI nie odpowiada');
      const data = await res.json();
      setAiText(data.content || data.text || localSpeech);
    } catch (e: any) {
      // graceful fallback — keep local speech
      setAiText(null);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)] py-10">
      <div className="container-page max-w-5xl">
        <Link
          href="/narzedzia"
          className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-accent-green"
        >
          <ChevronLeft className="w-4 h-4" /> Wszystkie narzędzia
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Generator mowy pożegnalnej
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Kilka pytań — i&nbsp;otrzymasz szkielet mowy do dopracowania. Możesz też poprosić AI
              o&nbsp;głębszą wersję.
            </p>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-6 space-y-4">
            <Field
              label="Imię i nazwisko zmarłego"
              value={input.personName}
              onChange={(v) => setInput({ ...input, personName: v })}
              placeholder="np. Jan Kowalski"
              required
            />
            <Field
              label="Kim była dla Ciebie ta osoba?"
              value={input.relation}
              onChange={(v) => setInput({ ...input, relation: v })}
              placeholder="np. mój ojciec, moja babcia, mój brat"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Wiek (opcjonalnie)"
                value={input.age?.toString() || ''}
                onChange={(v) => setInput({ ...input, age: v ? Number(v) : undefined })}
                placeholder="np. 78"
                type="number"
              />
              <Field
                label="Twoje imię"
                value={input.authorName}
                onChange={(v) => setInput({ ...input, authorName: v })}
                placeholder="podpis pod mową"
                required
              />
            </div>
            <Field
              label="Cechy charakteru (2–3 słowa)"
              value={input.traits}
              onChange={(v) => setInput({ ...input, traits: v })}
              placeholder="np. ciepła, opiekuńcza, z poczuciem humoru"
            />
            <Field
              label="Pasja lub zawód"
              value={input.passion}
              onChange={(v) => setInput({ ...input, passion: v })}
              placeholder="np. ogrodnictwo, nauczanie dzieci"
            />
            <div>
              <label className="label">Wspomnienie, które chcesz przywołać</label>
              <textarea
                rows={3}
                value={input.memory}
                onChange={(e) => setInput({ ...input, memory: e.target.value })}
                placeholder="np. Każdej niedzieli rano robił dla nas naleśniki..."
                className="input !h-auto !py-2"
              />
            </div>
            <div>
              <label className="label">Ton mowy</label>
              <div className="grid grid-cols-3 gap-2">
                {(['religijny', 'swiecki', 'osobisty'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInput({ ...input, tone: t })}
                    className={`px-3 py-2.5 rounded-lg text-[13px] font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-accent-green/40 transition-all ${
                      input.tone === t
                        ? 'bg-accent-green text-white'
                        : 'bg-cream-dark/40 text-navy hover:bg-cream-dark/60'
                    }`}
                  >
                    {t === 'swiecki' ? 'świecki' : t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateWithAI}
              disabled={!ready || aiLoading}
              className="w-full btn-primary !py-3 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? 'Generuję…' : 'Wzbogać mowę z pomocą AI'}
            </button>
          </div>

          {/* Output */}
          <div className="card p-6 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-heading text-[16px]">Twoja mowa</h2>
              {speech && (
                <div className="flex gap-1.5">
                  <button
                    onClick={copy}
                    className="px-2.5 py-1.5 rounded-md bg-cream-dark/40 hover:bg-cream-dark/60 text-[12px] inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-accent-green" /> Skopiowano
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Kopiuj
                      </>
                    )}
                  </button>
                  <button
                    onClick={download}
                    className="px-2.5 py-1.5 rounded-md bg-cream-dark/40 hover:bg-cream-dark/60 text-[12px] inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1.5 rounded-md bg-cream-dark/40 hover:bg-cream-dark/60 text-[12px] inline-flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {!ready ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted py-12">
                <Heart className="w-10 h-10 text-text-muted/60" />
                <p className="mt-3 text-[14px]">
                  Wypełnij obowiązkowe pola po lewej —<br />
                  mowa pojawi się tutaj.
                </p>
              </div>
            ) : (
              <pre className="flex-1 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-navy bg-cream/40 rounded-lg p-4 max-h-[500px] overflow-auto">
                {speech}
              </pre>
            )}

            {aiText && (
              <div className="mt-3 text-[11.5px] text-accent-green">
                ✓ Wzbogacono przez AI — pamiętaj, by przeczytać i&nbsp;dostosować do siebie.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 card p-5 bg-accent-green-light/30 border-accent-green/20">
          <h3 className="font-heading text-[15px]">Wskazówki przed wystąpieniem</h3>
          <ul className="mt-2 space-y-1 text-[13px] text-text-secondary leading-relaxed">
            <li>• Czytaj wolno — pauzy są naturalne, nie bój się ich.</li>
            <li>• Jeśli nie dasz rady — poproś kogoś bliskiego o&nbsp;dokończenie.</li>
            <li>• Krótko jest lepiej niż długo — 1–2 minuty wystarczą.</li>
            <li>• Skup się na wspomnieniach, nie na okolicznościach śmierci.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input !h-10"
      />
    </div>
  );
}
