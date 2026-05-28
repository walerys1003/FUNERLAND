'use client';

import { useState } from 'react';
import { CheckCircle2, Info, FileDown, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { CalculatorPreview } from '@/components/calculator-preview';

const steps = [
  { q: 'W jakim mieście odbędzie się pogrzeb?', name: 'city' },
  { q: 'Jaki rodzaj pogrzebu?', name: 'type' },
  { q: 'Jakiej trumny / urny szukasz?', name: 'coffin' },
  { q: 'Czy potrzebujesz transportu?', name: 'transport' },
  { q: 'Ceremonia kościelna czy świecka?', name: 'ceremony' },
  { q: 'Kwiaty, nekrologi, dodatki?', name: 'extras' },
];

export default function CalculatorPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div>
      <div className="container-page py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-line text-[12.5px] text-text-secondary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            Oparte na 12 000 rzeczywistych pogrzebach
          </span>
          <h1 className="font-heading text-[40px] md:text-[52px] leading-tight">
            Kalkulator kosztów pogrzebu
          </h1>
          <p className="mt-4 text-text-secondary">
            6 krótkich pytań. Szacunek w 60 sekund. Bez podawania danych kontaktowych.
          </p>
        </div>

        {!done ? (
          <div className="card max-w-2xl mx-auto p-7 md:p-10">
            <div className="flex items-center justify-between text-[12px] text-text-secondary mb-2">
              <span>Krok {step + 1} z {steps.length}</span>
              <span>~{Math.max(60 - step * 10, 10)}s pozostało</span>
            </div>
            <div className="h-1.5 bg-border-soft rounded-full mb-8">
              <div
                className="h-full bg-accent-green rounded-full transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            <h2 className="font-heading text-[26px] leading-snug">{steps[step].q}</h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {getOptions(step).map((o) => (
                <button
                  key={o}
                  className="rounded-2xl border border-border-soft p-5 text-left hover:border-accent-green hover:bg-cream/60 transition"
                >
                  <div className="font-medium text-navy">{o}</div>
                  <div className="text-[12.5px] text-text-muted mt-1">{getOptionHint(step, o)}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Wróć
              </button>
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="btn-primary">
                  Dalej <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setDone(true)} className="btn-primary">
                  Pokaż mój koszt <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <CalculatorPreview />
        )}
      </div>
    </div>
  );
}

function getOptions(step: number) {
  const opts: Record<number, string[]> = {
    0: ['Warszawa', 'Kraków', 'Wrocław', 'Łódź'],
    1: ['Tradycyjny', 'Kremacja', 'Świecki', 'Wyznaniowy'],
    2: ['Sosna podstawowa', 'Sosna szlachetna', 'Dąb', 'Urna ceramiczna'],
    3: ['Tak, krajowy', 'Tak, międzynarodowy', 'Nie, mam swój', 'Nie wiem'],
    4: ['Kościelna katolicka', 'Inna wyznaniowa', 'Świecka z mistrzem ceremonii', 'Bez ceremonii'],
    5: ['Wieniec + nekrolog', 'Tylko wiązanka', 'Tylko nekrolog', 'Bez dodatków'],
  };
  return opts[step] || [];
}
function getOptionHint(step: number, opt: string) {
  if (step === 1) {
    if (opt === 'Kremacja') return 'od 3 200 zł';
    if (opt === 'Tradycyjny') return 'od 3 800 zł';
    return 'indywidualnie';
  }
  if (step === 2) {
    if (opt === 'Sosna podstawowa') return '1 200 – 1 800 zł';
    if (opt === 'Sosna szlachetna') return '1 800 – 4 000 zł';
    if (opt === 'Dąb') return '2 800 – 6 000 zł';
    return '300 – 800 zł';
  }
  return '';
}
