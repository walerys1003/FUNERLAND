import Link from 'next/link';
import { Search, MapPin, Star, ShieldCheck, Clock } from 'lucide-react';
import { searchCompanies, searchArticles } from '@/lib/search/meilisearch';

type SearchParams = {
  q?: string;
  type?: string;
  city?: string;
  category?: string;
  verified?: string;
};

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Wyszukiwarka — PolskiePogrzeby.pl',
  description:
    'Znajdź zakład pogrzebowy, kwiaciarnię, kamieniarza, krematorium lub firmę transportową w Twoim mieście. Filtry, opinie, ceny.',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';
  const filters: string[] = [];
  if (sp.city) filters.push(`citySlug = "${sp.city}"`);
  if (sp.category) filters.push(`categories = "${sp.category}"`);
  if (sp.verified === 'true') filters.push(`isVerified = true`);

  const [companies, articles] = await Promise.all([
    searchCompanies(q, { filters: filters.join(' AND ') || undefined, limit: 20 }),
    q ? searchArticles(q, { limit: 5 }) : Promise.resolve({ hits: [], estimatedTotalHits: 0 }),
  ]);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Search bar */}
      <div className="bg-[#0F1B2D] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium text-white mb-6" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            Znajdź sprawdzoną firmę pogrzebową
          </h1>
          <form method="get" className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Wpisz nazwę firmy, kategorię lub usługę..."
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A65F]"
              />
            </div>
            <select
              name="city"
              defaultValue={sp.city || ''}
              className="px-4 py-4 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C9A65F]"
            >
              <option value="">Wszystkie miasta</option>
              <option value="warszawa">Warszawa</option>
              <option value="krakow">Kraków</option>
              <option value="wroclaw">Wrocław</option>
              <option value="lodz">Łódź</option>
              <option value="poznan">Poznań</option>
              <option value="gdansk">Gdańsk</option>
              <option value="lublin">Lublin</option>
            </select>
            <select
              name="category"
              defaultValue={sp.category || ''}
              className="px-4 py-4 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C9A65F]"
            >
              <option value="">Wszystkie kategorie</option>
              <option value="zaklady-pogrzebowe">Zakłady pogrzebowe</option>
              <option value="kremacja">Krematoria</option>
              <option value="kwiaciarnie-pogrzebowe">Kwiaciarnie</option>
              <option value="kamieniarze">Kamieniarze</option>
              <option value="transport-zwlok">Transport</option>
            </select>
            <button
              type="submit"
              className="px-6 py-4 bg-[#C9A65F] text-[#0F1B2D] font-medium rounded-lg hover:bg-[#b8954e] transition"
            >
              Szukaj
            </button>
          </form>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 text-stone-200 cursor-pointer">
              <input
                type="checkbox"
                name="verified"
                value="true"
                defaultChecked={sp.verified === 'true'}
                className="rounded"
              />
              Tylko zweryfikowane firmy
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-stone-800">
            {q ? `Wyniki dla: „${q}"` : 'Wszystkie firmy'}
          </h2>
          <div className="text-sm text-stone-500">
            {companies.estimatedTotalHits} {companies.estimatedTotalHits === 1 ? 'wynik' : 'wyników'}
            {(companies as any).mock && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">tryb demo</span>}
          </div>
        </div>

        {companies.hits.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <p className="text-stone-600 mb-4">Nie znaleźliśmy firm dla tych kryteriów.</p>
            <p className="text-sm text-stone-500">
              Spróbuj zmienić miasto lub kategorię, albo skorzystaj z{' '}
              <Link href="/zapytanie" className="underline text-[#2E4F3E]">
                formularza zapytaniowego
              </Link>{' '}
              — wyślemy zapytanie do 3 firm w Twojej okolicy.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {companies.hits.map((c: any) => (
              <Link
                key={c.id || c.slug}
                href={`/firma/${c.slug}`}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-[#2E4F3E] hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-medium text-stone-900 group-hover:text-[#2E4F3E]">
                    {c.name}
                  </h3>
                  {c.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                      <ShieldCheck className="h-3 w-3" /> Zweryfikowana
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-600 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {c.city}
                  </span>
                  {c.rating && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      {c.rating} {c.reviewsCount && <span className="text-stone-400">({c.reviewsCount})</span>}
                    </span>
                  )}
                  {c.availability24h && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Clock className="h-4 w-4" /> 24h
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-sm text-stone-600 line-clamp-2 mb-3">{c.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(c.categories || []).slice(0, 3).map((cat: string) => (
                      <span key={cat} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                  {c.priceFrom && (
                    <span className="text-sm font-medium text-[#2E4F3E]">od {c.priceFrom} zł</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Articles section */}
        {articles.hits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-medium text-stone-800 mb-4">
              Powiązane artykuły w poradniku
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {articles.hits.map((a: any) => (
                <Link
                  key={a.id || a.slug}
                  href={`/poradnik/${a.slug}`}
                  className="bg-white rounded-xl p-4 border border-stone-200 hover:border-[#C9A65F] transition"
                >
                  <div className="text-sm text-[#C9A65F] mb-1">{a.category}</div>
                  <div className="font-medium text-stone-800">{a.title}</div>
                  {a.excerpt && <div className="text-sm text-stone-600 mt-1 line-clamp-2">{a.excerpt}</div>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
