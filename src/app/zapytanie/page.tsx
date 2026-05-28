'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, X, Calendar, Zap, CheckCircle2 } from 'lucide-react';

export default function ZapytaniePage() {
  const [step, setStep] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container-page py-12 md:py-16 max-w-2xl mx-auto">
      <div className="card p-7 md:p-10">
        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-green-light text-accent-green flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-[28px] mt-5">Zapytanie wysłane</h2>
            <p className="mt-3 text-text-secondary max-w-md mx-auto">
              W ciągu 24 godzin otrzymasz 3 oferty od zaufanych firm w Twojej okolicy. 
              Sprawdź swój telefon i e-mail.
            </p>
            <Link href="/panel-rodziny" className="btn-primary mt-6 inline-flex">
              Zobacz moje zapytania
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="font-heading text-[28px]">Otrzymaj 3 oferty w 24 godziny</h2>
              <p className="mt-1 text-text-secondary">Bez presji, bez płatności. Tylko Ty decydujesz.</p>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium ${
                      s === step
                        ? 'bg-accent-green text-white'
                        : s < step
                        ? 'bg-accent-green text-white'
                        : 'bg-cream border border-border-line text-text-muted'
                    }`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  {s < 4 && <div className={`w-10 h-px ${s < step ? 'bg-accent-green' : 'bg-border-soft'}`} />}
                </div>
              ))}
            </div>
            <p className="text-center text-[12px] text-text-muted mt-2">Krok {step} z 4</p>

            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div>
                <label className="label">Twoje imię</label>
                <input className="input" placeholder="Wpisz swoje imię" />
              </div>
              <div>
                <label className="label">Telefon kontaktowy</label>
                <div className="input flex items-center gap-2 p-0 px-4">
                  <span className="text-[14px] inline-flex items-center gap-1.5 text-text-secondary border-r border-border-soft pr-3">
                    <span className="inline-block w-5 h-3.5 rounded-sm bg-gradient-to-b from-white to-red-500" />
                    +48
                  </span>
                  <input className="flex-1 h-12 bg-transparent focus:outline-none text-[15px]" placeholder="___ ___ ___" />
                </div>
              </div>
              <div>
                <label className="label">E-mail (opcjonalnie)</label>
                <input className="input" placeholder="Wpisz swój e-mail" />
              </div>

              <div>
                <label className="label">Pilność:</label>
                <div className="grid grid-cols-3 gap-2">
                  <UrgencyOption icon={Zap} label="Natychmiastowa" defaultChecked />
                  <UrgencyOption icon={Calendar} label="Ten tydzień" />
                  <UrgencyOption icon={Calendar} label="Planuję" />
                </div>
              </div>

              <div>
                <label className="label">Krótki opis sytuacji (opcjonalnie)</label>
                <textarea
                  className="input !h-24 py-3"
                  placeholder="Możesz napisać tylko najważniejsze – resztę omówisz przy rozmowie"
                />
              </div>

              <div className="rounded-xl bg-cream/60 border border-border-soft p-3 flex items-start gap-2 text-[12.5px] text-text-secondary">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-accent-green flex-shrink-0" />
                Twoje dane są bezpieczne. Firmy nie zobaczą Twojego numeru zanim klikniesz „pokaż".
              </div>

              <button type="submit" className="btn-primary w-full !py-4 text-[15px]">
                Wyślij zapytanie do 3 firm
              </button>

              <div className="text-center text-[12.5px] text-text-muted">
                <button type="button" className="underline">Wolę najpierw kalkulator</button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11.5px] text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> RODO compliant
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Brak spamu
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Anulujesz w każdej chwili
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function UrgencyOption({ icon: Icon, label, defaultChecked }: any) {
  return (
    <label className={`rounded-xl border p-3 cursor-pointer flex items-center justify-center gap-2 text-[13px] ${
      defaultChecked ? 'border-accent-green bg-accent-green-light text-accent-green font-medium' : 'border-border-soft text-text-secondary hover:border-navy'
    }`}>
      <input type="radio" name="urgency" defaultChecked={defaultChecked} className="sr-only" />
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
  );
}
