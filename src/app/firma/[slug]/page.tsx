import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { companies, getCompanyBySlug } from '@/lib/data';
import { Stars } from '@/components/stars';
import { VerifiedBadge } from '@/components/verified-badge';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Check } from 'lucide-react';
import CompanyGallery from '@/components/marketplace/company-gallery';
import PaymentSection from '@/components/marketplace/payment-section';

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  // Build gallery from existing fields + thematic supporting photos.
  const galleryImages = [
    { src: company.bannerImage, alt: `${company.name} — widok ogólny` },
    { src: company.image, alt: `${company.name} — wnętrze` },
    {
      src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80&auto=format',
      alt: 'Sala ceremonii',
    },
    {
      src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80&auto=format',
      alt: 'Świece i kwiaty',
    },
    {
      src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format',
      alt: 'Kompozycja kwiatowa',
    },
    {
      src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80&auto=format',
      alt: 'Krajobraz cmentarza',
    },
  ];

  const minPrice = company.services.length
    ? Math.min(...company.services.map((s) => s.from))
    : undefined;

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[280px] md:h-[340px] overflow-hidden">
          <Image src={company.bannerImage} alt={company.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
        </div>
        <div className="container-page -mt-24 relative z-10">
          <div className="card p-7 md:p-9">
            <div className="flex items-start gap-6">
              <div className="hidden sm:flex w-14 h-14 rounded-xl border border-border-line bg-white items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-navy" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 3c-2.5 3 -4 6 -4 9a4 4 0 0 0 8 0c0 -3 -1.5 -6 -4 -9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-[34px] md:text-[44px] leading-tight">{company.name}</h1>
                <p className="mt-2 text-[15px] text-text-secondary">
                  {company.city} {company.district} · Działa od {2026 - company.yearsActive} roku
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <VerifiedBadge year={company.verifiedYear} />
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading text-[22px]">{company.rating}</span>
                    <Stars value={company.rating} size={16} />
                  </div>
                  <div className="text-[12.5px] text-text-muted">{company.reviewsCount} opinii zweryfikowanych</div>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-border-soft pt-4 flex flex-wrap gap-6 text-[14px]">
              {['O firmie', 'Galeria', 'Cennik', 'Płatności', 'Opinie'].map((t, i) => (
                <a
                  key={t}
                  href={`#${t.toLowerCase()}`}
                  className={`pb-2 ${
                    i === 2 ? 'text-accent-green border-b-2 border-accent-green font-medium' : 'text-text-secondary hover:text-navy'
                  }`}
                >
                  {t}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-12">
          <section id="galeria" aria-labelledby="galeria-heading">
            <h2 id="galeria-heading" className="font-heading text-h2 mb-5">
              Galeria
            </h2>
            <CompanyGallery images={galleryImages} title={company.name} />
          </section>

          <section id="cennik">
            <h2 className="font-heading text-h2 mb-5">Cennik</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {company.services.map((s, i) => (
                <div key={s.name} className="card p-6">
                  <div className="h-14 mb-4 flex items-center text-accent-green">
                    {i === 0 && <CoffinIcon />}
                    {i === 1 && <UrnIcon />}
                    {i === 2 && <TransportIcon />}
                  </div>
                  <h3 className="font-heading text-[19px]">{s.name}</h3>
                  <p className="mt-1 text-[14px] text-navy font-medium">
                    od {s.from.toLocaleString('pl-PL')} zł
                  </p>
                  <ul className="mt-4 space-y-2 text-[13.5px] text-text-secondary">
                    {(s.description || 'Trumna dębowa lub sosnowa,Obsługa ceremonii pogrzebowej,Przygotowanie ciała,Komplet dokumentów').split(',').slice(0, 4).map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="o-firmie">
            <h2 className="font-heading text-h2 mb-4">O firmie</h2>
            <p className="text-[15.5px] text-text-secondary leading-relaxed max-w-3xl">
              {company.description}
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {company.features.map((f) => (
                <div key={f} className="rounded-xl border border-border-soft px-4 py-3 text-[13.5px] inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-green" /> {f.replace('-', ' ')}
                </div>
              ))}
            </div>
          </section>

          <PaymentSection companyName={company.name} minPrice={minPrice} />

          <PaymentSection companyName={company.name} minPrice={minPrice} />

          <section id="opinie">
            <h2 className="font-heading text-h2 mb-5">Opinie zweryfikowane</h2>
            <div className="space-y-4">
              {[
                { author: 'Anna K.', date: '2 tygodnie temu', rating: 5, content: 'Profesjonalna obsługa w bardzo trudnym momencie. Pełna dyskrecja, transparentne ceny, brak presji. Polecam.' },
                { author: 'Piotr M.', date: 'miesiąc temu', rating: 5, content: 'Cała ceremonia przebiegła z godnością. Doceniam pomoc w formalnościach urzędowych.' },
                { author: 'Joanna S.', date: '2 miesiące temu', rating: 4, content: 'Dziękuję za wsparcie i empatię. Wszystko zostało zorganizowane sprawnie.' },
              ].map((r) => (
                <div key={r.author} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.author}</div>
                      <div className="text-[12.5px] text-text-muted">{r.date}</div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-3 text-[14.5px] text-text-secondary leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky lead form */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="card p-6">
            <h3 className="font-heading text-[20px]">Wyślij zapytanie — bez zobowiązań</h3>
            <p className="mt-1 text-[13px] text-text-secondary">Odpowiedź zwykle w 2-4 godziny.</p>
            <form className="mt-5 space-y-3">
              <input className="input" placeholder="Imię i nazwisko" />
              <input className="input" placeholder="Numer telefonu" />
              <input className="input" placeholder="Adres e-mail" />
              <textarea className="input !h-24 py-3" placeholder="Krótki opis sytuacji (opcjonalnie)" />
              <button type="button" className="btn-primary w-full">
                Wyślij zapytanie
              </button>
            </form>
          </div>

          <div className="card p-6 text-center">
            <div className="text-[13px] text-text-secondary">Zadzwoń teraz</div>
            <a
              href={`tel:${company.phone.replace(/\s/g, '')}`}
              className="mt-1 font-heading text-[22px] inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5 text-accent-green" /> {company.phone}
            </a>
            {company.phone24h && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-accent-green">
                <Clock className="w-3.5 h-3.5" /> Dostępność 24/7
              </div>
            )}
          </div>

          <div className="card p-6 text-[13.5px] space-y-3">
            <div className="flex items-start gap-2 text-text-secondary">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> {company.address}
            </div>
            <div className="flex items-start gap-2 text-text-secondary">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /> kontakt@{company.slug.replace(/-/g, '')}.pl
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CoffinIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 12 L44 12 L52 52 L12 52 Z" />
      <circle cx="32" cy="28" r="2" />
      <path d="M32 32 L32 42" />
      <path d="M28 36 L36 36" />
    </svg>
  );
}
function UrnIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 22 L42 22 L40 48 Q 32 56 24 48 Z" />
      <path d="M20 22 Q 32 12 44 22" />
      <path d="M30 32 Q 32 28 34 32" />
    </svg>
  );
}
function TransportIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 40 L8 24 L40 24 L48 32 L56 32 L56 44 L48 44" />
      <circle cx="18" cy="46" r="4" />
      <circle cx="46" cy="46" r="4" />
      <path d="M22 46 L42 46" />
      <path d="M40 24 L40 32 L48 32" />
    </svg>
  );
}
