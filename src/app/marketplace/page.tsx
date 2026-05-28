import Link from 'next/link';
import { ALL_CATEGORIES } from '@/lib/marketplace/categories';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Marketplace — PolskiePogrzeby.pl',
  description:
    'Wszystkie usługi pogrzebowe w jednym miejscu: zakłady, kwiaciarnie, kamieniarze, krematoria, transport. Porównaj, sprawdź opinie, zamów.',
};

export default function MarketplacePage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0F1B2D] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A65F]/20 text-[#C9A65F] text-sm mb-4">
            <Sparkles className="h-4 w-4" /> Marketplace usług funeralnych
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            Wszystko, czego potrzebujecie<br />
            <span className="text-[#C9A65F]">w jednym miejscu.</span>
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto mb-8">
            Zweryfikowane firmy, transparentne ceny, opinie rodzin. Wybierz kategorię i zamów online.
          </p>
          <div className="flex items-center gap-2 justify-center text-sm text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Bez ukrytych kosztów · RODO compliant · Wsparcie 24/7
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-medium text-stone-800 mb-2" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
          5 kategorii usług
        </h2>
        <p className="text-stone-600 mb-10">
          Każdą kategorię można rezerwować osobno lub przez zakład pogrzebowy (kompleksowo).
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/rezerwacja/${c.slug}`}
                className="group bg-white rounded-2xl p-6 border border-stone-200 hover:border-[#C9A65F] hover:shadow-lg transition-all"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-medium text-stone-900 mb-2" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
                  {c.name}
                </h3>
                <p className="text-sm text-stone-600 mb-4 min-h-[3rem]">{c.shortDescription}</p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-xs text-stone-500">{c.bookingSteps.length} kroków</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#2E4F3E] group-hover:gap-2 transition-all">
                    Zarezerwuj <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}

          {/* CTA: complete package */}
          <Link
            href="/zapytanie"
            className="group bg-gradient-to-br from-[#2E4F3E] to-[#1c3528] text-white rounded-2xl p-6 border border-transparent hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-[#C9A65F]/20 flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-[#C9A65F]" />
            </div>
            <h3 className="text-xl font-medium mb-2" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
              Pakiet kompleksowy
            </h3>
            <p className="text-sm text-stone-200 mb-4 min-h-[3rem]">
              Zostawcie wszystko jednej firmie. Otrzymacie 3 oferty zakładów pogrzebowych w 24h.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-stone-300">Średnia oszczędność: 8%</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A65F] group-hover:gap-2 transition-all">
                Wypełnij zapytanie <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Why us */}
      <div className="bg-white py-16 px-4 border-t border-stone-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-medium text-center text-stone-800 mb-12" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            Dlaczego rodziny wybierają PolskiePogrzeby.pl?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-medium text-[#2E4F3E] mb-2">Bez presji</div>
              <p className="text-stone-600">
                Firmy nie dzwonią natarczywie. Ty decydujesz, kiedy i z kim chcesz rozmawiać.
              </p>
            </div>
            <div>
              <div className="text-3xl font-medium text-[#2E4F3E] mb-2">Bez ukrytych kosztów</div>
              <p className="text-stone-600">
                Wszystkie ceny widać od razu w profilu firmy. Brak niespodzianek na fakturze.
              </p>
            </div>
            <div>
              <div className="text-3xl font-medium text-[#2E4F3E] mb-2">Tylko zweryfikowane firmy</div>
              <p className="text-stone-600">
                Każda firma przechodzi weryfikację NIP, dokumentów i opinii rodzin. Trust-first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
