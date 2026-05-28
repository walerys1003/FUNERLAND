import { stats, testimonials } from '@/lib/data';
import { Quote } from 'lucide-react';

const partners = [
  { name: 'Hospicjum Caritas', mark: '✛' },
  { name: 'Stowarzyszenie Pogrzebowe', mark: 'SP' },
  { name: 'ZUS', mark: 'ZUS' },
  { name: 'Polskie Stowarzyszenie Kremacyjne', mark: '🜂' },
  { name: 'Fundacja Wsparcia Rodzin', mark: '◇' },
  { name: 'Zakład Ubezpieczeń Społecznych', mark: '§' },
];

export function TrustStats() {
  return (
    <section className="section bg-cream">
      <div className="container-page">
        <h2 className="text-center font-heading text-h2 md:text-[40px] mb-12 md:mb-16">
          Dlaczego rodziny nam ufają
        </h2>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
          <div className="grid grid-cols-2 gap-y-12 gap-x-8">
            <Stat value={stats.verifiedCompanies.toLocaleString('pl-PL')} label="zweryfikowanych firm" accent />
            <Stat value={stats.familiesHelped.toLocaleString('pl-PL')} label="rodzin pomożonych" />
            <Stat value={`${stats.averageRating}/5`} label="średnia ocena" />
            <Stat value={`${stats.priceTransparency}%`} label="transparentność cen" />
          </div>

          <div className="card p-7 md:p-9 bg-white relative">
            <Quote className="w-7 h-7 text-accent-green/70 mb-4" />
            <p className="font-heading text-[22px] md:text-[24px] leading-snug text-navy italic">
              „{testimonials[0].quote}"
            </p>
            <p className="mt-5 text-[14px] font-medium text-navy">{testimonials[0].author}</p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-6 gap-y-6 gap-x-8 items-center opacity-70">
          {partners.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-text-secondary">
              <span className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border-line text-[12px] font-semibold">
                {p.mark}
              </span>
              <span className="text-[12px] leading-tight">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="border-b border-border-line pb-2">
      <div
        className={`font-heading text-[44px] md:text-[56px] leading-none ${
          accent ? 'text-accent-green' : 'text-navy'
        }`}
      >
        {value}
      </div>
      <div className="mt-3 text-[14px] text-text-secondary">{label}</div>
    </div>
  );
}
