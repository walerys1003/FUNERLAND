'use client';

import { useMemo, useState } from 'react';
import { Copy, Check, Code2, Globe } from 'lucide-react';
import type { WidgetVariant } from '@/lib/widget/token';

type VariantMeta = { key: WidgetVariant; label: string; description: string };

type Props = {
  companySlug: string;
  companyName: string;
  baseUrl: string;
  tokensByVariant: Record<string, string>;
  variants: VariantMeta[];
  isPremium: boolean;
};

type SnippetType = 'script' | 'iframe';

export default function WidgetGenerator({
  companySlug,
  companyName,
  baseUrl,
  tokensByVariant,
  variants,
  isPremium,
}: Props) {
  const [variant, setVariant] = useState<WidgetVariant>('card');
  const [snippetType, setSnippetType] = useState<SnippetType>('script');
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [copied, setCopied] = useState(false);

  const token = tokensByVariant[variant];
  const previewUrl = `${baseUrl}/widget/${token}/embed?variant=${variant}`;

  const heightMap: Record<WidgetVariant, number> = {
    card: 240,
    banner: 130,
    compact: 90,
    reviews: 380,
  };

  const snippet = useMemo(() => {
    const hash = token.slice(0, 8);
    if (snippetType === 'script') {
      return `<!-- PolskiePogrzeby.pl widget (${variant}) -->
<div id="pp-widget-${hash}"></div>
<script async src="${baseUrl}/widget/${token}/embed.js" data-pp-target="pp-widget-${hash}"></script>`;
    }
    const h = heightMap[variant];
    return `<iframe src="${baseUrl}/widget/${token}/embed?variant=${variant}"
  width="100%" height="${h}" frameborder="0" scrolling="no"
  style="border:0;display:block;max-width:480px;"
  title="PolskiePogrzeby.pl — ${companyName.replace(/"/g, '&quot;')}"></iframe>`;
  }, [snippetType, variant, token, baseUrl, companyName]);

  const handleCopy = async () => {
    if (!isPremium) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white border border-border-soft rounded-2xl overflow-hidden">
      {/* Variant tabs */}
      <div className="border-b border-border-soft flex flex-wrap">
        {variants.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setVariant(v.key)}
            className={`px-5 py-3 text-[13.5px] font-medium border-b-2 transition-colors ${
              variant === v.key
                ? 'border-navy text-navy'
                : 'border-transparent text-text-secondary hover:text-navy'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="p-6 grid lg:grid-cols-2 gap-6">
        {/* Left — preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-[15px] text-navy">Podgląd</h3>
            <span className="text-[11px] text-text-muted">{variant}</span>
          </div>
          <div className="bg-cream/50 border border-stone-200 rounded-xl p-4 min-h-[260px] flex items-center justify-center">
            <iframe
              key={`${variant}-${token}`}
              src={previewUrl}
              width="100%"
              height={heightMap[variant]}
              frameBorder={0}
              scrolling="no"
              style={{ border: 0, display: 'block', maxWidth: 480, width: '100%' }}
              title={`Podgląd widgetu — ${variant}`}
            />
          </div>
          <p className="text-[12px] text-text-secondary mt-3">
            {variants.find((v) => v.key === variant)?.description}
          </p>
        </div>

        {/* Right — snippet generator */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-[15px] text-navy">Kod do wklejenia</h3>
            <div className="inline-flex rounded-md border border-stone-300 bg-white overflow-hidden text-[12px]">
              <button
                type="button"
                onClick={() => setSnippetType('script')}
                className={`px-3 py-1 ${snippetType === 'script' ? 'bg-navy text-white' : 'text-text-secondary hover:bg-stone-50'}`}
              >
                JS
              </button>
              <button
                type="button"
                onClick={() => setSnippetType('iframe')}
                className={`px-3 py-1 border-l border-stone-300 ${snippetType === 'iframe' ? 'bg-navy text-white' : 'text-text-secondary hover:bg-stone-50'}`}
              >
                iframe
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-[#0F2A44] text-emerald-50 text-[11.5px] p-4 rounded-xl overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all max-h-[200px]">
              {snippet}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isPremium}
              className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                isPremium
                  ? copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-navy hover:bg-stone-100'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
              title={isPremium ? 'Skopiuj do schowka' : 'Wymaga planu Premium'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Skopiowane
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Kopiuj
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid gap-3 text-[12.5px]">
            <div>
              <label className="block text-[12px] text-text-secondary mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Dozwolone domeny (opcjonalnie)
              </label>
              <input
                type="text"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="np. https://twoja-strona.pl, *.twoja-strona.pl"
                disabled={!isPremium}
                className={`w-full px-3 py-2 rounded-lg border text-[12.5px] ${
                  isPremium
                    ? 'border-stone-300 focus:border-navy focus:outline-none'
                    : 'border-stone-200 bg-stone-50 cursor-not-allowed'
                }`}
              />
              <p className="text-[10.5px] text-text-muted mt-1">
                Zostaw puste, by widget działał wszędzie. Po zapisie ograniczenia działają na
                poziomie iframe + JS bootstrap (CORS).
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11.5px] text-text-secondary">
              <div className="font-medium text-navy mb-1 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> Token (skrócony)
              </div>
              <code className="break-all font-mono text-[10.5px]">{token.slice(0, 32)}...</code>
              <div className="mt-1 text-[10.5px] text-text-muted">
                Token długoterminowy. Możesz go odnowić w dowolnej chwili — stary przestanie
                działać po wygenerowaniu nowego.
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 border border-stone-300 rounded-lg text-[12px] text-navy hover:bg-stone-50"
              >
                Otwórz widget w nowej karcie
              </a>
              <a
                href={`${baseUrl}/firma/${companySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 bg-navy text-white rounded-lg text-[12px] hover:bg-navy-deep"
              >
                Zobacz profil firmy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
