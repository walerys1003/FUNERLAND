import Link from 'next/link';
import { Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 0,
    suffix: 'na zawsze',
    desc: 'Twoja firma w bazie z podstawowymi danymi',
    features: ['Wizytówka', 'Podstawowe statystyki'],
    cta: 'Rozpocznij za darmo',
    highlight: false,
  },
  {
    name: 'Standard',
    price: 89,
    suffix: 'mc',
    desc: 'Dla małych zakładów (1-3 osoby)',
    features: ['10 leadów/mc gratis', 'Cennik na profilu', 'Mini-website', 'Opinie zweryfikowane'],
    cta: 'Rozpocznij 14 dni gratis',
    highlight: true,
    badge: 'Najpopularniejszy',
  },
  {
    name: 'Pro',
    price: 199,
    suffix: 'mc',
    desc: 'Dla firm w 1-3 miastach',
    features: ['30 leadów/mc gratis', '3 miasta', 'Top listing', 'API', 'Priorytet w rankingu'],
    cta: 'Rozpocznij 14 dni gratis',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 399,
    suffix: 'mc',
    desc: 'Dla sieci i franczyz',
    features: ['80 leadów/mc gratis', '10 miast', 'Dedicated CS', 'Raporty PDF', 'White label'],
    cta: 'Rozpocznij 14 dni gratis',
    highlight: false,
  },
];

const compareRows = [
  ['Wizytówka online', true, true, true, true],
  ['Statystyki odwiedzin', true, true, true, true],
  ['Powiadomienia o leadach', false, true, true, true],
  ['Zarządzanie cennikiem', false, true, true, true],
  ['Integracja z mapami', false, true, true, true],
  ['System opinii', false, true, true, true],
  ['Panel klienta', false, false, true, true],
  ['Dedykowana strona www', false, false, true, true],
];

export default function DlaFirmPage() {
  return (
    <div>
      <div className="container-page pt-14 pb-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-[40px] md:text-[52px] leading-tight">
            Wybierz pakiet dla swojej firmy
          </h1>
          <p className="mt-4 text-text-secondary">
            14 dni Pro gratis. Bez karty kredytowej. Anulujesz jednym kliknięciem.
          </p>
          <div className="mt-7 inline-flex items-center gap-1 p-1 rounded-full border border-border-line bg-white text-[13px]">
            <button className="px-4 py-1.5 rounded-full">Miesięcznie</button>
            <button className="px-4 py-1.5 rounded-full bg-accent-green text-white">
              Rocznie (-20%)
            </button>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`card p-7 relative ${
                p.highlight ? 'border-accent-green border-2 shadow-lift' : ''
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent-green text-white text-[11.5px] font-medium">
                  {p.badge}
                </span>
              )}
              <h3 className="font-heading text-[22px]">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-[40px]">{p.price} zł</span>
                <span className="text-[13px] text-text-secondary">/ {p.suffix}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-text-muted">{p.desc}</p>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]">
                    <Check className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-7 w-full ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 card overflow-hidden">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-cream/60 border-b border-border-soft">
                <th className="text-left p-4 font-semibold text-navy">Funkcjonalności</th>
                <th className="p-4 font-semibold">Basic</th>
                <th className="p-4 font-semibold">Standard</th>
                <th className="p-4 font-semibold">Pro</th>
                <th className="p-4 font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className="border-b border-border-soft last:border-0">
                  <td className="p-4 text-text-secondary">{row[0] as string}</td>
                  {row.slice(1).map((v, j) => (
                    <td key={j} className="p-4 text-center">
                      {v ? (
                        <Check className="w-5 h-5 text-accent-green inline" />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 text-center">
          <h2 className="font-heading text-h2">Już 423 zakłady ufają Polskie Pogrzeby</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { name: 'Fiatona Pogrzeby', q: 'Polskie Pogrzeby gratulacje! Świetny portal nastrojem nas, że socjalistycznego platform stworzaj rwest to grow my business.' },
              { name: 'Donala Pogrzeby', q: 'Polskie Pogrzeby platform, rwest by nie chebra na trzymistnem. Niedy wymienic. Tam towa, tą scingli mi zweryfikamie.' },
              { name: 'Marlina Christmaas', q: 'Polskie Pogrzeby owners założam platform stowalarczom operatów m od prawo wnoa company w simpliifim do operacji.' },
            ].map((t) => (
              <div key={t.name} className="card p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream-dark" />
                  <div>
                    <div className="font-semibold text-[14px]">{t.name}</div>
                    <div className="text-[12px] text-text-muted">Polskie Pogrzeby</div>
                  </div>
                </div>
                <p className="mt-4 text-[13.5px] text-text-secondary italic leading-relaxed">
                  „{t.q}"
                </p>
              </div>
            ))}
          </div>
        </div>

        <div id="claim" className="mt-20 card p-10 md:p-14 bg-navy text-white">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-accent-green-light text-[12px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Przejmij swój profil
              </span>
              <h2 className="font-heading text-h2 text-white mt-3">
                Twoja firma jest już w naszej bazie
              </h2>
              <p className="mt-4 text-white/75 max-w-md">
                Sprawdź, czy znaleźliśmy Twoją firmę wśród 847 polskich zakładów. Przejmij darmowy
                profil w 5 minut i otrzymaj 1 lead gratis.
              </p>
            </div>
            <form className="space-y-3">
              <input className="input bg-white/95" placeholder="NIP firmy" />
              <input className="input bg-white/95" placeholder="Numer telefonu" />
              <button className="btn-primary w-full">
                Sprawdź swój profil <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[12px] text-white/55 text-center">
                Bez zobowiązań · RODO compliant
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
