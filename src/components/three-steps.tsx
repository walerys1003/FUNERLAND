import { FileEdit, MailCheck, HandHeart, ArrowRight } from 'lucide-react';

const steps = [
  {
    n: 1,
    title: 'Wypełnij krótki formularz',
    body: 'Podaj podstawowe informacje o Twoich oczekiwaniach, abyśmy mogli Ci pomóc.',
    Icon: FileEdit,
  },
  {
    n: 2,
    title: 'Otrzymaj 3 oferty w 24h',
    body: 'Otrzymasz spersonalizowane wyceny od zaufanych zakładów pogrzebowych w Twojej okolicy.',
    Icon: MailCheck,
  },
  {
    n: 3,
    title: 'Wybierz spokojnie, bez presji',
    body: 'Porównaj oferty i wybierz opcję, która najlepiej odpowiada Twoim potrzebom i budżetowi.',
    Icon: HandHeart,
  },
];

export function ThreeSteps() {
  return (
    <section className="section">
      <div className="container-page">
        <h2 className="text-center font-heading text-h2 md:text-[40px] mb-12 md:mb-16">
          Trzy kroki do spokojnego pożegnania
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="card p-7 md:p-8 h-full text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-cream border border-border-line flex items-center justify-center font-heading text-[18px] text-navy mb-5">
                  {s.n}
                </div>
                <s.Icon className="w-9 h-9 mx-auto text-navy mb-5" strokeWidth={1.4} />
                <h3 className="font-heading text-[20px] mb-3">{s.title}</h3>
                <p className="text-[14.5px] text-text-secondary leading-relaxed">{s.body}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight
                  className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 w-8 h-8 text-border-line"
                  strokeWidth={1.2}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
