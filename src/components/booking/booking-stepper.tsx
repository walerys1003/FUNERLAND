'use client';

import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Calendar, MapPin, Package, User, FileText } from 'lucide-react';
import type { CategoryConfig } from '@/lib/marketplace/categories';

type CategoryPropData = Omit<CategoryConfig, 'icon'>;

type Props = {
  category: CategoryPropData;
  companyName?: string;
  companySlug?: string;
};

type FormData = Record<string, any>;

export default function BookingStepper({ category, companyName, companySlug }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = category.bookingSteps;
  const isLastStep = currentStep === steps.length - 1;

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  }

  function prev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function updateField(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.slug,
          companySlug,
          companyName,
          data: formData,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Coś poszło nie tak');
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-700" />
        </div>
        <h3 className="text-2xl font-medium text-emerald-900 mb-2" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
          Dziękujemy. Państwa zgłoszenie zostało wysłane.
        </h3>
        <p className="text-emerald-800 mb-4">
          {companyName ? <>Firma <strong>{companyName}</strong> skontaktuje się w ciągu 2 godzin.</> : 'Wybrane firmy skontaktują się w ciągu 2 godzin.'}
        </p>
        <p className="text-sm text-emerald-700">
          Sprawdź swoją skrzynkę e-mail — wysłaliśmy potwierdzenie z numerem zgłoszenia.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            Krok {currentStep + 1} z {steps.length}: {steps[currentStep].title}
          </h2>
          <span className="text-sm text-stone-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-1.5">
          <div
            className="bg-[#2E4F3E] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`text-xs px-2 py-1 rounded ${
                i < currentStep
                  ? 'bg-emerald-100 text-emerald-700'
                  : i === currentStep
                  ? 'bg-[#2E4F3E] text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {i < currentStep && <Check className="inline h-3 w-3 mr-1" />}
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-8 min-h-[300px]">
        <p className="text-stone-600 mb-6">{steps[currentStep].description}</p>
        <StepForm
          step={steps[currentStep]}
          stepIndex={currentStep}
          category={category}
          formData={formData}
          updateField={updateField}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
        <button
          onClick={prev}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-1 px-4 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" /> Wstecz
        </button>

        {isLastStep ? (
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2E4F3E] text-white font-medium rounded-lg hover:bg-[#243f31] disabled:opacity-50 transition"
          >
            {submitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
            {!submitting && <Check className="h-4 w-4" />}
          </button>
        ) : (
          <button
            onClick={next}
            className="inline-flex items-center gap-1 px-6 py-2.5 bg-[#2E4F3E] text-white rounded-lg hover:bg-[#243f31] transition"
          >
            Dalej <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============== STEP FORM RENDERER ==============

function StepForm({
  step,
  stepIndex,
  category,
  formData,
  updateField,
}: {
  step: any;
  stepIndex: number;
  category: CategoryPropData;
  formData: FormData;
  updateField: (k: string, v: any) => void;
}) {
  // Step 0 — Type selection (radio)
  if (stepIndex === 0) {
    const options = getStep0Options(category.slug);
    return (
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
              formData[step.id] === opt.value
                ? 'border-[#2E4F3E] bg-emerald-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name={step.id}
              value={opt.value}
              checked={formData[step.id] === opt.value}
              onChange={(e) => updateField(step.id, e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-stone-800">{opt.label}</div>
              {opt.description && <div className="text-sm text-stone-600 mt-0.5">{opt.description}</div>}
            </div>
          </label>
        ))}
      </div>
    );
  }

  // Date + time step (calendar lite)
  if (step.id === 'date-time' || step.id === 'date' || step.id === 'date-delivery') {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Data</label>
          <input
            type="date"
            value={formData[`${step.id}_date`] || ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => updateField(`${step.id}_date`, e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Godzina (orientacyjna)</label>
          <select
            value={formData[`${step.id}_time`] || ''}
            onChange={(e) => updateField(`${step.id}_time`, e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
          >
            <option value="">Wybierz porę</option>
            <option value="rano">Rano (8:00 — 11:00)</option>
            <option value="poludnie">Południe (11:00 — 14:00)</option>
            <option value="popoludnie">Popołudnie (14:00 — 17:00)</option>
            <option value="wieczor">Wieczór (17:00 — 20:00)</option>
            <option value="wszystko-jedno">Wszystko jedno</option>
          </select>
        </div>
      </div>
    );
  }

  // Contact step
  if (step.id === 'contact') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Imię i nazwisko *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
            placeholder="Jan Kowalski"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Telefon *</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
              placeholder="+48 600 000 000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">E-mail *</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
              placeholder="rodzina@example.pl"
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={!!formData.rodo}
            onChange={(e) => updateField('rodo', e.target.checked)}
            className="mt-1"
          />
          <span>
            Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu obsługi zgłoszenia.
            Dane nie są przekazywane stronom trzecim bez zgody. *
          </span>
        </label>
      </div>
    );
  }

  // Review (summary) step
  if (step.id === 'review') {
    return (
      <div className="bg-stone-50 rounded-lg p-5 space-y-2">
        <h4 className="font-medium text-stone-800 mb-3">Podsumowanie zgłoszenia:</h4>
        {Object.entries(formData).length === 0 ? (
          <p className="text-sm text-stone-500">Brak danych do podsumowania.</p>
        ) : (
          Object.entries(formData).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1 border-b border-stone-200 last:border-0">
              <span className="text-stone-500">{k}</span>
              <span className="font-medium text-stone-800 max-w-[60%] text-right truncate">
                {typeof v === 'boolean' ? (v ? 'Tak' : 'Nie') : String(v)}
              </span>
            </div>
          ))
        )}
        <p className="text-xs text-stone-500 mt-4 pt-3 border-t border-stone-200">
          Po wysłaniu otrzymasz na e-mail potwierdzenie z numerem zgłoszenia. Firma skontaktuje się
          w ciągu 2 godzin w godzinach 8:00-20:00.
        </p>
      </div>
    );
  }

  // Generic text field fallback
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{step.title}</label>
      <textarea
        rows={4}
        value={formData[step.id] || ''}
        onChange={(e) => updateField(step.id, e.target.value)}
        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 focus:border-[#2E4F3E] focus:ring-1 focus:ring-[#2E4F3E]"
        placeholder="Opisz szczegóły..."
      />
      <p className="text-xs text-stone-500 mt-2">Pole opcjonalne — możesz pominąć, jeśli nie ma to znaczenia.</p>
    </div>
  );
}

function getStep0Options(categorySlug: string) {
  switch (categorySlug) {
    case 'zaklady-pogrzebowe':
      return [
        { value: 'tradycyjny', label: 'Pogrzeb tradycyjny', description: 'Trumna + ceremonia + pochówek' },
        { value: 'kremacja', label: 'Kremacja', description: 'Kremacja + urna + pożegnanie' },
        { value: 'swiecki', label: 'Pogrzeb świecki', description: 'Bez obrządku religijnego' },
        { value: 'koscielny', label: 'Pogrzeb kościelny', description: 'Z mszą świętą w kościele' },
      ];
    case 'kwiaciarnie-pogrzebowe':
      return [
        { value: 'wieniec', label: 'Wieniec pogrzebowy', description: 'Duża kompozycja na cmentarz' },
        { value: 'wiazanka', label: 'Wiązanka', description: 'Średnia kompozycja, na trumnę lub szarfę' },
        { value: 'bukiet', label: 'Bukiet', description: 'Mniejsza kompozycja, np. dla rodziny' },
        { value: 'kompozycja', label: 'Kompozycja indywidualna', description: 'Na zamówienie, omówione z florystą' },
      ];
    case 'kamieniarze':
      return [
        { value: 'nowy', label: 'Nowy nagrobek', description: 'Wykonanie od podstaw' },
        { value: 'renowacja', label: 'Renowacja', description: 'Naprawa, czyszczenie, polerowanie' },
        { value: 'liternictwo', label: 'Liternictwo', description: 'Wykonanie napisów, dat, sentencji' },
        { value: 'dodatki', label: 'Dodatki (lampka, wazon, krzyż)', description: 'Akcesoria do istniejącego nagrobka' },
      ];
    case 'kremacja':
      return [
        { value: 'standard', label: 'Urna standardowa', description: 'Klasyczna metalowa lub plastikowa' },
        { value: 'drewno', label: 'Urna drewniana', description: 'Dąb / orzech / mahoń' },
        { value: 'ceramika', label: 'Urna ceramiczna', description: 'Premium, ręcznie zdobiona' },
        { value: 'bio', label: 'Urna biodegradowalna', description: 'Eco-friendly, do pochówku ziemnego' },
      ];
    case 'transport-zwlok':
      return [
        { value: 'krajowy', label: 'Transport krajowy', description: 'W obrębie Polski' },
        { value: 'miedzynarodowy', label: 'Transport międzynarodowy', description: 'Z/do zagranicy' },
        { value: 'urna', label: 'Transport urny/prochów', description: 'Po kremacji' },
      ];
    default:
      return [];
  }
}
