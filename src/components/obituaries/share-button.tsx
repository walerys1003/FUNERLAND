'use client';

import { useState } from 'react';
import { Share2, Copy, Check, QrCode, Download, X } from 'lucide-react';

type Props = {
  slug: string;
  personName: string;
};

export default function ShareButton({ slug, personName }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/nekrologi/${slug}`
      : `/nekrologi/${slug}`;

  async function share() {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `Nekrolog: ${personName}`,
          text: `Pożegnaj ${personName}`,
          url,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
          aria-label="Udostępnij nekrolog"
        >
          <Share2 className="h-4 w-4" /> Udostępnij
        </button>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
          aria-label="Skopiuj link"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Skopiowano' : 'Kopiuj link'}
        </button>
        <button
          onClick={() => setShowQr(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
          aria-label="Kod QR"
        >
          <QrCode className="h-4 w-4" /> QR
        </button>
      </div>

      {showQr && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowQr(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-base font-medium text-stone-900"
                style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
              >
                Kod QR nekrologu
              </h4>
              <button
                onClick={() => setShowQr(false)}
                aria-label="Zamknij"
                className="text-stone-500 hover:text-stone-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Zeskanuj telefonem lub wydrukuj na klepsydrze, programie ceremonii czy
              karcie pamiątkowej. Goście trafią od razu do nekrologu i księgi
              kondolencyjnej.
            </p>
            <div className="flex items-center justify-center bg-white p-3 border border-stone-200 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/obituary/${slug}?format=svg&size=512`}
                alt={`Kod QR nekrologu ${personName}`}
                className="w-56 h-56"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`/api/qr/obituary/${slug}?format=png&size=1024`}
                download={`qr-${slug}.png`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
              >
                <Download className="h-4 w-4" /> PNG
              </a>
              <a
                href={`/api/qr/obituary/${slug}?format=svg&size=1024`}
                download={`qr-${slug}.svg`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
              >
                <Download className="h-4 w-4" /> SVG
              </a>
            </div>
            <p className="mt-3 text-[11px] text-stone-400 break-all">{url}</p>
          </div>
        </div>
      )}
    </>
  );
}
