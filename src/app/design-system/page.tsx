import {
  CoffinIcon,
  UrnIcon,
  CrematoriumIcon,
  CeremonyIcon,
  StreamIcon,
  TransportIcon,
  GravestoneIcon,
  MorgueIcon,
  CandleIcon,
  FlowerIcon,
} from '@/components/icons';

export const metadata = {
  title: 'Design System — Polskie Pogrzeby',
  description: 'Tokeny, ikony, komponenty UI',
};

const icons = [
  { name: 'CoffinIcon', label: 'Trumna · Zakłady pogrzebowe', Icon: CoffinIcon },
  { name: 'UrnIcon', label: 'Urna · Kremacja', Icon: UrnIcon },
  { name: 'CrematoriumIcon', label: 'Krematorium', Icon: CrematoriumIcon },
  { name: 'CeremonyIcon', label: 'Ceremonia', Icon: CeremonyIcon },
  { name: 'StreamIcon', label: 'Transmisja online', Icon: StreamIcon },
  { name: 'TransportIcon', label: 'Transport zwłok', Icon: TransportIcon },
  { name: 'GravestoneIcon', label: 'Nagrobek · Kamieniarz', Icon: GravestoneIcon },
  { name: 'MorgueIcon', label: 'Chłodnia', Icon: MorgueIcon },
  { name: 'CandleIcon', label: 'Świeca pamięci', Icon: CandleIcon },
  { name: 'FlowerIcon', label: 'Kwiaciarnia pogrzebowa', Icon: FlowerIcon },
];

export default function DesignSystemPage() {
  return (
    <div className="container-page section">
      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl md:text-5xl text-navy mb-4">Design System</h1>
        <p className="text-navy/70 text-lg">
          Tokeny kolorów, typografia, ikony i komponenty UI marki <em>Polskie Pogrzeby</em>.
        </p>
      </div>

      {/* COLORS */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-navy mb-6">Paleta kolorów</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'cream', hex: '#F5F1EA', label: 'Tło — Cream' },
            { name: 'navy', hex: '#0F1B2D', label: 'Tekst — Navy' },
            { name: 'accent-green', hex: '#2E4F3E', label: 'Akcent — Zieleń' },
            { name: 'gold', hex: '#C9A65F', label: 'Detal — Złoto' },
          ].map((c) => (
            <div key={c.name} className="card">
              <div className="h-24 rounded-lg mb-3" style={{ background: c.hex }} />
              <div className="text-sm font-medium text-navy">{c.label}</div>
              <div className="font-mono text-xs text-navy/60 mt-1">{c.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-navy mb-6">Typografia</h2>
        <div className="card space-y-4">
          <div>
            <span className="text-xs text-navy/60 font-mono">Display · Lora 72px</span>
            <div className="font-heading text-7xl text-navy leading-tight">Pożegnaj godnie</div>
          </div>
          <div>
            <span className="text-xs text-navy/60 font-mono">H1 · Lora 48px</span>
            <div className="font-heading text-5xl text-navy">Bez presji, bez ukrytych kosztów</div>
          </div>
          <div>
            <span className="text-xs text-navy/60 font-mono">H2 · Lora 32px</span>
            <div className="font-heading text-3xl text-navy">Trzy kroki do spokojnego pożegnania</div>
          </div>
          <div>
            <span className="text-xs text-navy/60 font-mono">Body · Inter 16px</span>
            <div className="text-base text-navy/80 max-w-2xl">
              Pomagamy rodzinom w najtrudniejszych momentach życia. Porównaj zweryfikowane firmy pogrzebowe w Twoim mieście, otrzymaj 3 oferty w 24 godziny.
            </div>
          </div>
        </div>
      </section>

      {/* ICONS */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-navy mb-2">Custom Icons</h2>
        <p className="text-navy/60 mb-6">10 ikon dziedzicznych — outline, stroke 1.6, używają currentColor.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {icons.map(({ name, label, Icon }) => (
            <div key={name} className="card text-center">
              <div className="flex justify-center mb-3 text-accent-green">
                <Icon size={48} />
              </div>
              <div className="text-sm font-medium text-navy">{label}</div>
              <div className="font-mono text-[10px] text-navy/50 mt-1">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPONENTS */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-navy mb-6">Komponenty</h2>

        {/* Buttons */}
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-navy mb-4">Przyciski</h3>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Otrzymaj 3 oferty</button>
            <button className="btn-secondary">Zobacz cennik</button>
            <button className="btn-ghost">Dowiedz się więcej</button>
          </div>
        </div>

        {/* Form elements */}
        <div className="card mb-6 max-w-md">
          <h3 className="text-sm font-medium text-navy mb-4">Formularz</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Imię i nazwisko</label>
              <input className="input" placeholder="Anna Kowalska" />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" placeholder="+48 ___ ___ ___" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="card">
          <h3 className="text-sm font-medium text-navy mb-4">Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="badge-verified">Zweryfikowana</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
              24h opieka
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/15 text-[#8B6F33] text-xs font-medium">
              Premium
            </span>
          </div>
        </div>
      </section>

      {/* SPACING & RADIUS */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-navy mb-6">Spacing & Radius</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Btn radius 12px', cls: 'rounded-btn' },
            { label: 'Card radius 24px', cls: 'rounded-card' },
            { label: 'Soft shadow', cls: 'rounded-card shadow-soft' },
            { label: 'Lift shadow', cls: 'rounded-card shadow-lift' },
          ].map((s) => (
            <div key={s.label} className={`bg-white p-6 border border-border-soft ${s.cls}`}>
              <div className="text-sm text-navy">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
