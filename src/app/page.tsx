import Link from 'next/link';
import { Hero } from '@/components/hero';
import { TrustStats } from '@/components/trust-stats';
import { ThreeSteps } from '@/components/three-steps';
import { CalculatorPreview } from '@/components/calculator-preview';
import { CompanyCard } from '@/components/company-card';
import { companies, articles, obituaries } from '@/lib/data';
import { ArrowRight, Building2, Flame, Flower2, Truck, Video, Mic } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStats />
      <ThreeSteps />
      <CategoriesSection />
      <CalculatorPreview />

      <section className="section">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-heading text-h2 md:text-[40px]">
              Zaufane firmy w Warszawie
            </h2>
            <Link href="/warszawa/zaklady-pogrzebowe" className="btn-ghost">
              Zobacz wszystkie 247 firm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {companies.slice(0, 4).map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        </div>
      </section>

      <ObituariesSection />
      <ArticlesSection />
      <B2BCallout />
    </>
  );
}

function CategoriesSection() {
  const cats = [
    { slug: 'zaklady-pogrzebowe', name: 'Zakłady pogrzebowe', desc: 'Pełna organizacja ceremonii', Icon: Building2 },
    { slug: 'kremacja', name: 'Kremacja', desc: 'Krematoria i obsługa', Icon: Flame },
    { slug: 'kwiaciarnie-pogrzebowe', name: 'Kwiaciarnie', desc: 'Wieńce, wiązanki, kwiaty', Icon: Flower2 },
    { slug: 'transport-zwlok', name: 'Transport zwłok', desc: 'Krajowy i międzynarodowy', Icon: Truck },
    { slug: 'transmisje-online', name: 'Transmisje online', desc: 'Ceremonia na żywo', Icon: Video },
    { slug: 'mistrzowie-ceremonii', name: 'Mistrzowie ceremonii', desc: 'Pogrzeb świecki', Icon: Mic },
  ];
  return (
    <section className="section bg-cream">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-h2 md:text-[40px]">Wszystko, czego potrzebujesz</h2>
          <p className="mt-4 text-text-secondary">
            Zaufane firmy w 8 kategoriach. Porównaj ceny, opinie i wybierz spokojnie.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/warszawa/${c.slug}`}
              className="card card-hover p-6 group flex items-start gap-4"
            >
              <span className="w-12 h-12 rounded-xl bg-cream-dark inline-flex items-center justify-center text-accent-green group-hover:bg-accent-green-light transition">
                <c.Icon className="w-6 h-6" strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="font-heading text-[18px]">{c.name}</h3>
                <p className="text-[14px] text-text-secondary mt-1">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[13px] text-accent-green font-medium">
                  Zobacz firmy <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ObituariesSection() {
  return (
    <section className="section bg-cream">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-heading text-h2 md:text-[40px]">Nekrologi i wspomnienia</h2>
          <p className="mt-4 text-text-secondary">
            Pożegnaj bliskich godnie. Bezpłatna publikacja, wsparcie rodziny.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {obituaries.slice(0, 6).map((o) => (
            <div
              key={o.slug}
              className={`card p-6 text-center ${o.isPremium ? 'border-gold/60 bg-[#FAF6EC]' : ''}`}
            >
              {o.isPremium && (
                <div className="text-[11px] text-gold font-semibold tracking-wider uppercase mb-2">
                  Premium · z transmisją online
                </div>
              )}
              <div className="h-24 mb-4 flex items-center justify-center text-border-line">
                <svg viewBox="0 0 80 60" className="h-full">
                  <path d="M10 50 Q 20 20 30 50 M 40 50 Q 50 25 60 50 M 65 50 Q 70 30 75 50" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </div>
              <h3 className="font-heading text-[20px]">{o.name}</h3>
              <p className="text-[14px] text-text-secondary mt-1">
                {o.birth} – {o.death}
              </p>
              <p className="text-[13.5px] italic text-text-secondary mt-2">{o.role}</p>
              <p className="text-[13px] text-navy mt-3">{o.city}</p>
              <p className="text-[12.5px] text-text-muted">{o.ceremonyDate}</p>
              <div className="mt-4 flex gap-2 justify-center">
                <button className="btn-primary !py-2 !px-4 text-[12.5px]">Złóż kondolencje</button>
                <button className="btn-secondary !py-2 !px-4 text-[12.5px]">Udostępnij</button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/nekrologi" className="btn-secondary">
            Zobacz wszystkie nekrologi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArticlesSection() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-heading text-h2 md:text-[40px]">Poradnik dla rodzin</h2>
            <p className="mt-2 text-text-secondary">Konkretne odpowiedzi na trudne pytania.</p>
          </div>
          <Link href="/poradnik" className="btn-ghost hidden md:inline-flex">
            Wszystkie artykuły <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {articles.map((a) => (
            <Link key={a.slug} href={`/poradnik/${a.slug}`} className="card card-hover p-6 block">
              <div className="text-[12px] text-accent-green font-medium uppercase tracking-wider">
                {a.category}
              </div>
              <h3 className="font-heading text-[19px] leading-snug mt-3">{a.title}</h3>
              <p className="text-[14px] text-text-secondary mt-3 line-clamp-3">{a.excerpt}</p>
              <div className="mt-5 text-[12px] text-text-muted flex items-center gap-2">
                <span>{a.readTime}</span>
                <span>•</span>
                <span>{a.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function B2BCallout() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="card overflow-hidden bg-navy text-white p-10 md:p-14 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <span className="text-[12px] uppercase tracking-wider text-accent-green-light">Dla firm</span>
            <h2 className="font-heading text-h2 md:text-[40px] text-white mt-3">
              Prowadzisz zakład pogrzebowy?
            </h2>
            <p className="mt-4 text-white/75 max-w-md leading-relaxed">
              Dołącz do 847 firm, które już otrzymują leady z Polskich Pogrzebów. 14 dni Pro gratis,
              bez karty kredytowej, anulujesz jednym kliknięciem.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dla-firm" className="btn-primary">
                Zobacz pakiety
              </Link>
              <Link
                href="/dla-firm#claim"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-btn border border-white/30 text-white hover:bg-white/10 transition"
              >
                Przejmij swój profil
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[13.5px]">
            {[
              { v: '847', l: 'aktywnych firm' },
              { v: '12 350', l: 'leadów / miesiąc' },
              { v: '14 dni', l: 'Pro gratis' },
              { v: '0 zł', l: 'plan Basic na zawsze' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="font-heading text-[28px] text-white">{s.v}</div>
                <div className="text-white/65 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
