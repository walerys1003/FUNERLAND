'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Clock, BadgePercent } from 'lucide-react';
import { cities } from '@/lib/data';

export function Hero() {
  const [city, setCity] = useState('');
  return (
    <section className="relative overflow-hidden">
      <div className="container-page pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-xl animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-line text-[12.5px] text-text-secondary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              847 zweryfikowanych firm w Polsce
            </span>
            <h1 className="font-heading text-[44px] md:text-display leading-[1.05] tracking-tight">
              Pożegnaj <br />
              godnie.<br />
              <span className="text-accent-green">Bez presji.</span>
            </h1>
            <p className="mt-6 text-[17px] text-text-secondary leading-relaxed max-w-md">
              Porównaj zweryfikowane zakłady pogrzebowe w Twoim mieście. Otrzymaj 3 oferty z cenami
              w 24 godziny — bez płatności, bez zobowiązań.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (city) window.location.href = `/${city}/zaklady-pogrzebowe`;
              }}
              className="mt-8 bg-white rounded-2xl border border-border-soft shadow-soft p-2 flex items-center max-w-lg"
            >
              <div className="pl-3 pr-2 text-text-muted">
                <Search className="w-5 h-5" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 h-12 bg-transparent text-navy text-[15px] focus:outline-none"
              >
                <option value="">Twoje miasto</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button className="btn-primary !py-3 !px-5">Sprawdź koszt w 60s</button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-[13.5px] text-text-secondary">
              <Feature icon={ShieldCheck} label="Sprawdzeni partnerzy" />
              <Feature icon={Clock} label="24/7 wsparcie" />
              <Feature icon={BadgePercent} label="Transparentne ceny" />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <HeroPhonesIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-8 h-8 rounded-full border border-border-line inline-flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent-green" strokeWidth={1.6} />
      </span>
      {label}
    </span>
  );
}

function HeroPhonesIllustration() {
  return (
    <div className="relative h-[520px]">
      <div className="absolute left-2 top-10 w-[200px] h-[420px] rounded-[36px] bg-white border border-border-soft shadow-card p-4 -rotate-3">
        <div className="h-3 w-12 rounded-full bg-cream-dark mx-auto mb-5" />
        <div className="font-heading text-[22px] leading-tight">
          Pożegnaj<br />godnie.<br />Bez presji.
        </div>
        <div className="mt-4 h-10 rounded-xl bg-cream-dark/60 flex items-center px-3 text-[12px] text-text-muted">
          Twoje miasto
        </div>
        <div className="mt-2 h-10 rounded-xl bg-accent-green text-white text-[12px] flex items-center justify-center">
          Sprawdź koszt w 60s
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Sprawdzeni', '24/7', 'Ceny'].map((t) => (
            <div key={t} className="h-12 rounded-lg border border-border-soft flex flex-col items-center justify-center text-[10px] text-text-secondary">
              <div className="w-3 h-3 rounded-full border border-accent-green mb-1" />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-[200px] top-0 w-[220px] h-[460px] rounded-[36px] bg-white border border-border-soft shadow-lift p-4 z-10">
        <div className="flex items-center justify-between text-[11px] text-text-secondary border-b border-border-soft pb-2">
          <span className="text-accent-green font-medium">Profil firmy</span>
          <span>Opinie</span>
        </div>
        <div className="mt-3 font-heading text-[18px]">
          Zakład Pogrzebowy<br />Aurora <span className="text-accent-green">✓</span>
        </div>
        <div className="mt-3 h-32 rounded-2xl bg-cream-dark" />
        <div className="mt-4 text-[14px] font-medium">od 4 200 zł</div>
        <div className="mt-3 h-9 rounded-xl bg-accent-green text-white text-[12px] flex items-center justify-center gap-2">
          Zadzwoń 24/7
        </div>
        <div className="mt-2 h-9 rounded-xl border border-border-line text-[12px] flex items-center justify-center">
          Wyślij zapytanie
        </div>
      </div>

      <div className="absolute right-0 top-6 w-[210px] h-[440px] rounded-[36px] bg-white border border-border-soft shadow-card p-4 rotate-3">
        <div className="h-1.5 bg-accent-green rounded-full mb-4 w-2/3" />
        <div className="font-heading text-[19px] leading-tight">Otrzymaj 3 oferty w 24h</div>
        {['Imię i nazwisko', 'Telefon kontaktowy', 'Lokalizacja', 'Szczegóły usługi'].map((p) => (
          <div key={p} className="mt-3 h-10 rounded-xl border border-border-soft px-3 flex items-center text-[11.5px] text-text-muted">
            {p}
          </div>
        ))}
        <div className="mt-4 h-10 rounded-xl bg-accent-green text-white text-[12px] flex items-center justify-center">
          Otrzymaj darmowe wyceny
        </div>
        <div className="mt-2 text-center text-[10px] text-text-muted">RODO compliant • bez zobowiązań</div>
      </div>
    </div>
  );
}
