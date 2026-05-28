'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  FileText,
  Download,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { DOC_TEMPLATES, fillTemplate, type DocTemplate } from '@/lib/tools/checklists';

const CATEGORY_LABELS: Record<DocTemplate['category'], string> = {
  zus: 'ZUS / KRUS',
  praca: 'Pracodawca',
  usc: 'USC',
  bank: 'Bank',
  spadek: 'Spadek',
};

export default function DocumentsClient() {
  const [selectedId, setSelectedId] = useState<string>(DOC_TEMPLATES[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => DOC_TEMPLATES.find((d) => d.id === selectedId) || DOC_TEMPLATES[0],
    [selectedId],
  );

  const output = useMemo(() => fillTemplate(selected.template, values), [selected, values]);

  function update(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function selectTemplate(id: string) {
    setSelectedId(id);
    setValues({});
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function download() {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)] py-10">
      <div className="container-page max-w-6xl">
        <Link
          href="/narzedzia"
          className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-accent-green"
        >
          <ChevronLeft className="w-4 h-4" /> Wszystkie narzędzia
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green-light text-accent-green flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-[28px] md:text-[34px] leading-tight">
              Generator wzorów dokumentów
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary">
              Wybierz wzór, uzupełnij dane, pobierz lub wydrukuj. Dane nie są zapisywane na serwerze.
            </p>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Templates list */}
          <aside className="space-y-2">
            {DOC_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={`w-full text-left card p-4 transition-all focus:outline-none focus:ring-2 focus:ring-accent-green/40 ${
                  selectedId === t.id ? 'border-accent-green bg-accent-green-light/30' : ''
                }`}
              >
                <div className="text-[10.5px] uppercase tracking-wider text-text-secondary font-semibold">
                  {CATEGORY_LABELS[t.category]}
                </div>
                <div className="mt-1 font-semibold text-[14px]">{t.title}</div>
                <div className="mt-1 text-[12px] text-text-secondary line-clamp-2">
                  {t.description}
                </div>
              </button>
            ))}
          </aside>

          {/* Form + Preview */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-5 space-y-3">
              <h2 className="font-heading text-[16px]">Dane do wypełnienia</h2>
              {selected.fields.map((f) => (
                <div key={f.name}>
                  <label className="label">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      placeholder={f.placeholder}
                      value={values[f.name] || ''}
                      onChange={(e) => update(f.name, e.target.value)}
                      className="input !h-auto !py-2"
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={values[f.name] || ''}
                      onChange={(e) => update(f.name, e.target.value)}
                      className="input !h-10"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="card p-5 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="font-heading text-[16px]">Podgląd</h2>
                <div className="flex gap-1.5">
                  <button
                    onClick={copy}
                    className="px-2.5 py-1.5 rounded-md bg-cream-dark/40 hover:bg-cream-dark/60 text-[12px] inline-flex items-center gap-1"
                    title="Kopiuj"
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
                    <Download className="w-3.5 h-3.5" /> .txt
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1.5 rounded-md bg-cream-dark/40 hover:bg-cream-dark/60 text-[12px] inline-flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="flex-1 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-text-secondary bg-cream/40 rounded-lg p-3 max-h-[500px] overflow-auto">
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
