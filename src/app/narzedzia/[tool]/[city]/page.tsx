import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, Calculator } from 'lucide-react';

import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import {
  webPageJsonLd,
  softwareApplicationJsonLd,
  placeJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';

import {
  CITY_META,
  CITY_SLUGS,
  TOOL_META,
  TOOL_SLUGS,
  getCityMeta,
  buildLocalContent,
  localToolPath,
  type ToolKey,
} from '@/lib/content/local-tool-content';

import KosztPogrzebuClient from '../../koszt-pogrzebu/client';
import ZasilekPogrzebowyClient from '../../zasilek-pogrzebowy/client';
import KredytClient from '../../kredyt-pogrzebowy/client';
import PorownajClient from '../../porownaj-oferty/client';
import ChecklistClient from '../../checklista/client';
import DocumentsClient from '../../dokumenty/client';
import SpeechClient from '../../mowa-pogrzebowa/client';

type Params = { tool: string; city: string };

// ── Static generation: 7 tools × 7 cities = 49 routes ─────────────────────
export function generateStaticParams() {
  const params: Params[] = [];
  for (const tool of TOOL_SLUGS) {
    for (const city of CITY_SLUGS) {
      params.push({ tool, city });
    }
  }
  return params;
}

function isValidTool(t: string): t is ToolKey {
  return (TOOL_SLUGS as readonly string[]).includes(t);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tool, city } = await params;
  if (!isValidTool(tool)) return {};
  const cityMeta = getCityMeta(city);
  if (!cityMeta) return {};

  const t = TOOL_META[tool];
  const path = localToolPath(tool, city);
  const title = `${t.h1(cityMeta.locative)} | PolskiePogrzeby.pl`;
  const description = t.desc(cityMeta);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: t.h1(cityMeta.locative),
      description,
      url: path,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(t.headline + ' w ' + cityMeta.locative)}&subtitle=${encodeURIComponent(t.tagline)}&type=tool`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

function ToolClient({ tool }: { tool: ToolKey }) {
  switch (tool) {
    case 'koszt-pogrzebu':
      return <KosztPogrzebuClient />;
    case 'zasilek-pogrzebowy':
      return <ZasilekPogrzebowyClient />;
    case 'kredyt-pogrzebowy':
      return <KredytClient />;
    case 'porownaj-oferty':
      return <PorownajClient />;
    case 'checklista':
      return <ChecklistClient />;
    case 'dokumenty':
      return <DocumentsClient />;
    case 'mowa-pogrzebowa':
      return <SpeechClient />;
  }
}

export default async function ToolCityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tool, city } = await params;
  if (!isValidTool(tool)) notFound();
  const cityMeta = getCityMeta(city);
  if (!cityMeta) notFound();

  const t = TOOL_META[tool];
  const path = localToolPath(tool, city);
  const blocks = buildLocalContent(tool, cityMeta);

  const otherCities = CITY_META.filter((c) => c.slug !== city).slice(0, 6);
  const otherTools = TOOL_SLUGS.filter((s) => s !== tool);

  const jsonLd = combineJsonLd(
    webPageJsonLd({
      name: t.h1(cityMeta.locative),
      description: t.desc(cityMeta),
      url: path,
      breadcrumb: [
        { name: 'Strona główna', url: '/' },
        { name: 'Narzędzia', url: '/narzedzia' },
        { name: t.headline, url: `/narzedzia/${tool}` },
        { name: cityMeta.name, url: path },
      ],
    }),
    softwareApplicationJsonLd({
      name: `${t.name} — ${cityMeta.name}`,
      description: t.desc(cityMeta),
      url: path,
      applicationCategory: t.category,
    }),
    placeJsonLd({
      name: cityMeta.name,
      region: cityMeta.voivodeship,
      description: `Usługi pogrzebowe w ${cityMeta.locative} — ${cityMeta.companiesCount} zweryfikowanych firm.`,
      populationCount: cityMeta.population,
      url: `/narzedzia/${tool}/${city}`,
    }),
  );

  return (
    <div className="bg-cream">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb + hero */}
      <div className="container-page pt-6">
        <Breadcrumbs
          items={[
            { name: 'Narzędzia', url: '/narzedzia' },
            { name: t.headline, url: `/narzedzia/${tool}` },
            { name: cityMeta.name, url: path },
          ]}
        />
      </div>

      <section className="bg-navy text-white py-12 md:py-16">
        <div className="container-page">
          <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-white/70 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {cityMeta.name} · woj. {cityMeta.voivodeship}
          </div>
          <h1 className="font-heading text-[32px] md:text-[44px] leading-tight max-w-3xl">
            {t.h1(cityMeta.locative)}
          </h1>
          <p className="mt-4 text-white/85 max-w-2xl leading-relaxed">{t.desc(cityMeta)}</p>

          <div className="mt-6 flex flex-wrap gap-4 text-[13px] text-white/70">
            <span>
              <strong className="text-white">{cityMeta.companiesCount}</strong> zweryfikowanych firm
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Średni czas reakcji <strong className="text-white">{cityMeta.responseHours}h</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Bezpłatnie · bez logowania
            </span>
          </div>
        </div>
      </section>

      {/* The actual interactive tool */}
      <ToolClient tool={tool} />

      {/* Local SEO copy */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-page max-w-3xl">
          <div className="prose-funeral">
            {blocks.map((b, i) => (
              <div key={i} className="mb-10">
                <h2>{b.heading}</h2>
                {b.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {b.list && (
                  <ul>
                    {b.list.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local cemeteries strip */}
      <section className="py-10 bg-cream border-t border-border-soft">
        <div className="container-page">
          <h2 className="font-heading text-[22px] mb-4">
            Cmentarze w {cityMeta.locative}
          </h2>
          <div className="flex flex-wrap gap-2">
            {cityMeta.cemeteries.map((cm) => (
              <span
                key={cm}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-border-soft text-[13px] text-text-secondary"
              >
                {cm}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links: same tool, other cities */}
      <section className="py-10 bg-white border-t border-border-soft">
        <div className="container-page">
          <h2 className="font-heading text-[22px] mb-5">
            {t.headline} w innych miastach
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={localToolPath(tool, c.slug)}
                className="card card-hover p-4 group text-[14px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-green group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-[11.5px] text-text-muted mt-0.5">
                  woj. {c.voivodeship} · {c.companiesCount} firm
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links: same city, other tools */}
      <section className="py-10 bg-cream border-t border-border-soft">
        <div className="container-page">
          <h2 className="font-heading text-[22px] mb-5">
            Inne narzędzia dla mieszkańców {cityMeta.locative}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherTools.map((ot) => {
              const meta = TOOL_META[ot];
              return (
                <Link
                  key={ot}
                  href={localToolPath(ot, city)}
                  className="card card-hover p-4 group text-[14px]"
                >
                  <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 text-accent-green mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{meta.headline}</div>
                      <div className="text-[11.5px] text-text-muted mt-0.5">{meta.tagline}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-green group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
