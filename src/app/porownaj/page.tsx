import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X as XIcon,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Building2,
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/breadcrumbs';
import JsonLd from '@/components/seo/json-ld';
import { webPageJsonLd, itemListJsonLd, combineJsonLd } from '@/lib/seo/json-ld';
import { companies, getCompanyBySlug, type Company } from '@/lib/data';
import { minPrice, featureLabel } from '@/lib/marketplace/filters';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

type SearchParams = Promise<{ firmy?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { firmy } = await searchParams;
  const slugs = (firmy || '').split(',').filter(Boolean).slice(0, 4);
  const list = slugs.map(getCompanyBySlug).filter(Boolean) as Company[];
  const names = list.map((c) => c.name).join(' vs ');
  const title = list.length
    ? `Porównaj: ${names} · Polskie Pogrzeby`
    : 'Porównaj firmy pogrzebowe · Polskie Pogrzeby';
  return {
    title,
    description:
      list.length > 0
        ? `Szczegółowe porównanie ${list.length} firm pogrzebowych: ceny, oceny, udogodnienia, kontakt. Wybierz najlepszą.`
        : 'Wybierz firmy z listy /firmy aby porównać ich oferty obok siebie.',
    alternates: { canonical: `${BASE_URL}/porownaj` },
    robots: list.length === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function PorownajPage({ searchParams }: { searchParams: SearchParams }) {
  const { firmy } = await searchParams;
  const slugs = (firmy || '').split(',').filter(Boolean).slice(0, 4);
  const list = slugs.map(getCompanyBySlug).filter(Boolean) as Company[];

  const pageLd = webPageJsonLd({
    name: 'Porównaj firmy pogrzebowe',
    description: 'Porównaj nawet 4 firmy pogrzebowe obok siebie — ceny, oceny, kontakt.',
    url: `${BASE_URL}/porownaj`,
    breadcrumb: [
      { name: 'Strona główna', url: '/' },
      { name: 'Firmy', url: '/firmy' },
      { name: 'Porównanie', url: '/porownaj' },
    ],
  });
  const itemList =
    list.length > 0
      ? itemListJsonLd({
          name: 'Porównywane firmy pogrzebowe',
          items: list.map((c) => ({
            name: c.name,
            url: `/firma/${c.slug}`,
            description: `${c.city} · ★ ${c.rating.toFixed(1)} · ${c.reviewsCount} opinii · od ${minPrice(c).toLocaleString('pl-PL')} zł`,
          })),
        })
      : null;

  // Aggregate feature universe across selected companies
  const featureUniverse = Array.from(
    new Set(list.flatMap((c) => c.features || [])),
  ).sort();

  // Aggregate service universe
  const serviceUniverse = Array.from(
    new Set(list.flatMap((c) => c.services?.map((s) => s.name) || [])),
  ).sort();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-5">
          <Breadcrumbs
            items={[
              { name: 'Firmy', url: '/firmy' },
              { name: 'Porównanie', url: '/porownaj' },
            ]}
          />
        </div>

        <Link
          href="/firmy"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Powrót do wszystkich firm
        </Link>

        <h1
          className="text-3xl md:text-4xl font-medium text-stone-900 mb-2"
          style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
        >
          Porównanie firm pogrzebowych
        </h1>
        <p className="text-stone-600 mb-8">
          {list.length === 0
            ? 'Wybierz firmy na stronie /firmy aby porównać ich oferty obok siebie.'
            : `Porównujesz ${list.length} ${list.length === 1 ? 'firmę' : list.length < 5 ? 'firmy' : 'firm'} obok siebie.`}
        </p>

        {list.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
            <Building2 className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-700 font-medium mb-2">Brak firm do porównania</p>
            <p className="text-sm text-stone-500 mb-6">
              Wybierz min. 2 firmy z listy aby porównać ich oferty.
            </p>
            <Link
              href="/firmy"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2E4F3E] text-white text-sm font-medium hover:bg-[#26412F]"
            >
              Przejdź do firm
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-stone-200 rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-4 font-medium text-stone-500 text-xs uppercase tracking-wider w-44">
                    Cecha
                  </th>
                  {list.map((c) => (
                    <th key={c.slug} className="text-left p-4 align-top border-l border-stone-100 min-w-[200px]">
                      <Link
                        href={`/firma/${c.slug}`}
                        className="font-medium text-stone-900 hover:underline block leading-tight mb-1"
                        style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.city}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <Row label="Cena od">
                  {list.map((c) => {
                    const p = minPrice(c);
                    return (
                      <Cell key={c.slug}>
                        {p > 0 ? (
                          <strong className="text-stone-900">{p.toLocaleString('pl-PL')} zł</strong>
                        ) : (
                          '—'
                        )}
                      </Cell>
                    );
                  })}
                </Row>

                <Row label="Ocena">
                  {list.map((c) => (
                    <Cell key={c.slug}>
                      <div className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                        <span className="font-medium text-stone-900">{c.rating.toFixed(1)}</span>
                        <span className="text-stone-500">/ 5</span>
                      </div>
                    </Cell>
                  ))}
                </Row>

                <Row label="Liczba opinii">
                  {list.map((c) => (
                    <Cell key={c.slug}>{c.reviewsCount}</Cell>
                  ))}
                </Row>

                <Row label="Działa od">
                  {list.map((c) => (
                    <Cell key={c.slug}>{2026 - c.yearsActive} ({c.yearsActive} lat)</Cell>
                  ))}
                </Row>

                <Row label="Zweryfikowano">
                  {list.map((c) => (
                    <Cell key={c.slug}>
                      {c.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Tak ({c.verifiedYear})
                        </span>
                      ) : (
                        <span className="text-stone-400">Nie</span>
                      )}
                    </Cell>
                  ))}
                </Row>

                <Row label="Telefon 24/7">
                  {list.map((c) => (
                    <Cell key={c.slug}>{c.phone24h ? <Yes /> : <No />}</Cell>
                  ))}
                </Row>

                <Row label="Dzielnica">
                  {list.map((c) => (
                    <Cell key={c.slug}>{c.district || '—'}</Cell>
                  ))}
                </Row>

                <Row label="Plan">
                  {list.map((c) => (
                    <Cell key={c.slug}>
                      <span
                        className={`px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider rounded ${
                          c.plan === 'premium'
                            ? 'bg-[#C9A65F] text-white'
                            : c.plan === 'pro'
                            ? 'bg-[#2E4F3E] text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {c.plan}
                      </span>
                    </Cell>
                  ))}
                </Row>

                {/* Features universe */}
                {featureUniverse.length > 0 && (
                  <>
                    <tr className="bg-stone-50">
                      <td colSpan={list.length + 1} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-500 font-medium">
                        Udogodnienia
                      </td>
                    </tr>
                    {featureUniverse.map((f) => (
                      <Row key={f} label={featureLabel(f)}>
                        {list.map((c) => (
                          <Cell key={c.slug}>{c.features?.includes(f) ? <Yes /> : <No />}</Cell>
                        ))}
                      </Row>
                    ))}
                  </>
                )}

                {/* Services universe */}
                {serviceUniverse.length > 0 && (
                  <>
                    <tr className="bg-stone-50">
                      <td colSpan={list.length + 1} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-500 font-medium">
                        Usługi
                      </td>
                    </tr>
                    {serviceUniverse.map((sname) => (
                      <Row key={sname} label={sname}>
                        {list.map((c) => {
                          const s = c.services?.find((sv) => sv.name === sname);
                          return (
                            <Cell key={c.slug}>
                              {s ? (
                                <span className="text-stone-900 font-medium">
                                  {s.from.toLocaleString('pl-PL')} zł
                                </span>
                              ) : (
                                <span className="text-stone-300">—</span>
                              )}
                            </Cell>
                          );
                        })}
                      </Row>
                    ))}
                  </>
                )}

                {/* Contact row */}
                <tr className="bg-stone-50">
                  <td colSpan={list.length + 1} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-500 font-medium">
                    Kontakt
                  </td>
                </tr>
                <Row label="Telefon">
                  {list.map((c) => (
                    <Cell key={c.slug}>
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 text-[#2E4F3E] hover:underline"
                      >
                        <Phone className="h-3 w-3" /> {c.phone}
                      </a>
                    </Cell>
                  ))}
                </Row>
                <Row label="Adres">
                  {list.map((c) => (
                    <Cell key={c.slug}>{c.address}</Cell>
                  ))}
                </Row>

                {/* CTA row */}
                <tr>
                  <td className="p-4 align-top text-xs uppercase tracking-wider text-stone-500 font-medium">
                    Akcja
                  </td>
                  {list.map((c) => (
                    <td key={c.slug} className="p-4 border-l border-stone-100 align-top">
                      <Link
                        href={`/firma/${c.slug}`}
                        className="block w-full text-center px-3 py-2 rounded-lg bg-[#2E4F3E] text-white text-xs font-medium hover:bg-[#26412F] mb-2"
                      >
                        Zobacz profil
                      </Link>
                      <Link
                        href={`/zapytanie?company=${c.slug}`}
                        className="block w-full text-center px-3 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs hover:border-stone-500"
                      >
                        Zapytaj o ofertę
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 text-xs text-stone-400 text-center max-w-2xl mx-auto">
          Porównanie obejmuje dane publiczne i deklarowane przez firmy. Ostateczna oferta i
          szczegóły usług ustalane są bezpośrednio z firmą po wysłaniu zapytania.
        </p>
      </div>

      <JsonLd data={itemList ? combineJsonLd(pageLd, itemList) : pageLd} />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-4 align-top text-xs uppercase tracking-wider text-stone-500 font-medium whitespace-nowrap">
        {label}
      </td>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="p-4 align-top border-l border-stone-100 text-stone-700">{children}</td>;
}

function Yes() {
  return (
    <span className="inline-flex items-center text-emerald-600">
      <Check className="h-4 w-4" />
    </span>
  );
}

function No() {
  return (
    <span className="inline-flex items-center text-stone-300">
      <XIcon className="h-4 w-4" />
    </span>
  );
}
