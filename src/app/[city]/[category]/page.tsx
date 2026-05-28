import { notFound } from 'next/navigation';
import { cities, categories, getCompaniesByCity, companies as allCompanies } from '@/lib/data';
import { CompanyCard } from '@/components/company-card';
import { Filter, Map as MapIcon } from 'lucide-react';

export function generateStaticParams() {
  const params: { city: string; category: string }[] = [];
  for (const c of cities) for (const cat of categories) params.push({ city: c.slug, category: cat.slug });
  return params;
}

export default async function CityCategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: catSlug } = await params;
  const city = cities.find((c) => c.slug === citySlug);
  const category = categories.find((c) => c.slug === catSlug);
  if (!city || !category) notFound();

  const list = getCompaniesByCity(citySlug);
  const extended = list.length > 0 ? list : allCompanies.slice(0, 4).map((c) => ({ ...c, city: city.name, citySlug }));

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="text-[13px] text-text-muted mb-5">
        <span>Polska</span> · <span>{city.name}</span> ·{' '}
        <span className="text-navy">{category.name}</span>
      </nav>
      <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-10">
        <aside className="space-y-6">
          <div>
            <h1 className="font-heading text-[28px] leading-tight">
              {category.name} <br /> w {city.name}-Mokotów
            </h1>
            <p className="mt-3 text-[14px] text-text-secondary">
              {extended.length} zweryfikowanych firm w okolicy
            </p>
          </div>

          <div className="card p-5 space-y-5">
            <FilterSection label="Dzielnica">
              <select className="input">
                <option>Mokotów (Wybrano)</option>
                <option>Śródmieście</option>
                <option>Wola</option>
                <option>Ursynów</option>
                <option>Praga-Południe</option>
              </select>
            </FilterSection>

            <FilterSection label="Typ pogrzebu">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="t" defaultChecked className="accent-accent-green" /> Tradycyjny
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="t" className="accent-accent-green" /> Kremacja
              </label>
            </FilterSection>

            <FilterSection label="Dyżur 24/7">
              <Toggle defaultChecked />
            </FilterSection>

            <FilterSection label="Zakres cen">
              <div className="text-[13px] text-text-secondary flex justify-between">
                <span>2 000 zł</span>
                <span>15 000 zł</span>
              </div>
              <div className="relative h-1.5 bg-border-soft rounded-full">
                <div className="absolute left-[15%] right-[20%] top-0 bottom-0 bg-accent-green rounded-full" />
                <div className="absolute left-[15%] top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-accent-green" />
                <div className="absolute left-[80%] top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-accent-green" />
              </div>
              <div className="text-[12px] text-text-secondary flex justify-between">
                <span>4 500 zł</span>
                <span>12 000 zł</span>
              </div>
            </FilterSection>

            <FilterSection label="Tylko z opiniami zweryfikowanymi">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" defaultChecked className="accent-accent-green w-4 h-4" />
                Z opiniami zweryfikowanymi
              </label>
            </FilterSection>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-[22px]">Zakłady pogrzebowe w {city.name}-Mokotów</h2>
            <div className="flex items-center gap-2">
              <select className="h-10 px-3 rounded-btn border border-border-line bg-white text-[13.5px]">
                <option>Sortuj wg: Najlepsze oceny</option>
                <option>Najtańsze</option>
                <option>Najbliżej</option>
                <option>Najnowsze</option>
              </select>
              <button className="h-10 px-3 rounded-btn border border-border-line bg-white text-[13.5px] inline-flex items-center gap-2">
                <MapIcon className="w-4 h-4" /> Widok mapy
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {extended.map((c) => (
              <CompanyCard key={c.slug} company={c as any} />
            ))}
          </div>

          <div className="mt-12 card p-8">
            <h3 className="font-heading text-[22px]">Cmentarze w pobliżu</h3>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                ['Cmentarz Powązkowski', '3.2 km'],
                ['Cmentarz Wawrzyszewski', '4.5 km'],
                ['Cmentarz Żydowski przy ul. Okopowej', '5.1 km'],
                ['Cmentarz Bródnowski', '6.8 km'],
                ['Cmentarz Północny (Wólka Węglowa)', '8.4 km'],
              ].map(([n, d]) => (
                <div key={n} className="rounded-xl border border-border-soft p-4 text-[13px]">
                  <div className="text-text-secondary">⛼</div>
                  <div className="font-medium text-navy mt-1">{n}</div>
                  <div className="text-text-muted mt-0.5">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="text-[12.5px] font-semibold text-navy uppercase tracking-wider">{label}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <span className="relative w-10 h-6 bg-border-soft rounded-full peer-checked:bg-accent-green transition-colors">
        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
