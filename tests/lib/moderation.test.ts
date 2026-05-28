/**
 * Testy moderacji polskiej (heuristics.ts) — używają publicznego API.
 *  - moderateText: decision logic, flags, topScore
 *  - reasonLabel: PL labels
 *
 * Implementacja eksportuje TYLKO `moderateText` i `reasonLabel` —
 * heurystyki niskopoziomowe (isValidNIP/isValidPESEL/unleet/repetitionScore)
 * są module-private i testowane pośrednio przez moderateText().
 */

import { describe, it, expect } from 'vitest';
import { moderateText, reasonLabel } from '@/lib/moderation/heuristics';

describe('moderateText — czyste teksty', () => {
  it('przepuszcza neutralną opinię (approve)', () => {
    const result = moderateText('Bardzo profesjonalna obsługa. Wszystko sprawnie zorganizowane.');
    expect(result.decision).toBe('approve');
    expect(result.topScore).toBeLessThan(0.3);
    expect(result.flags.length).toBe(0);
  });

  it('pusty tekst → approve, topScore 0', () => {
    const result = moderateText('');
    expect(result.decision).toBe('approve');
    expect(result.topScore).toBe(0);
    expect(result.flags.length).toBe(0);
  });
});

describe('moderateText — PII detection', () => {
  it('flaguje numer telefonu jako PII (soft)', () => {
    const result = moderateText('Zadzwoń do mnie 600700800 omówimy szczegóły');
    expect(result.flags.some((f) => f.reason === 'pii')).toBe(true);
    // soft PII = 0.7 → decision review
    expect(['review', 'reject']).toContain(result.decision);
  });

  it('flaguje email jako PII', () => {
    const result = moderateText('Skontaktuj się jan.kowalski@example.com');
    expect(result.flags.some((f) => f.reason === 'pii')).toBe(true);
  });

  it('flaguje poprawny PESEL jako hard PII (score 1.0, reject)', () => {
    const result = moderateText('Mój PESEL 44051401458 to tyle');
    const piiFlag = result.flags.find((f) => f.reason === 'pii');
    expect(piiFlag).toBeDefined();
    expect(piiFlag?.matchedTerms).toContain('pesel');
    expect(piiFlag?.score).toBeGreaterThanOrEqual(0.9);
    expect(result.decision).toBe('reject');
  });

  it('flaguje poprawny NIP jako hard PII', () => {
    const result = moderateText('Mój NIP firmowy to 5260250274');
    const piiFlag = result.flags.find((f) => f.reason === 'pii');
    expect(piiFlag).toBeDefined();
    expect(piiFlag?.matchedTerms).toContain('nip');
    expect(piiFlag?.score).toBeGreaterThanOrEqual(0.9);
  });
});

describe('moderateText — link spam', () => {
  it('flaguje jeden URL jako link-spam (soft)', () => {
    const result = moderateText('Zobacz na https://spam.example.com naprawdę warto');
    expect(result.flags.some((f) => f.reason === 'link-spam')).toBe(true);
  });

  it('flaguje 2+ URLi jako twardy link-spam', () => {
    const result = moderateText('https://a.com i jeszcze https://b.com to spam!');
    const linkFlag = result.flags.find((f) => f.reason === 'link-spam');
    expect(linkFlag).toBeDefined();
    expect(linkFlag?.score).toBeGreaterThanOrEqual(0.85);
  });
});

describe('moderateText — all-caps', () => {
  it('flaguje krzyk', () => {
    const result = moderateText('TO JEST BARDZO ZLA FIRMA NIE POLECAM ABSOLUTNIE NIKOMU NIGDY');
    expect(result.flags.some((f) => f.reason === 'all-caps')).toBe(true);
  });
});

describe('moderateText — gibberish/repetition', () => {
  it('flaguje powtórzenia znaków jako gibberish', () => {
    const result = moderateText('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(result.flags.length).toBeGreaterThan(0);
    expect(result.flags.some((f) => f.reason === 'gibberish')).toBe(true);
  });

  it('flaguje powtórzenia słów', () => {
    const result = moderateText('spam spam spam spam spam spam spam spam spam spam');
    expect(result.flags.some((f) => f.reason === 'gibberish')).toBe(true);
  });
});

describe('moderateText — profanity (publiczne API)', () => {
  it('flaguje wyraźną polską przekleństwo-stem', () => {
    // używamy stem "debil" (jeden z PROFANITY_STEMS) — niezbyt wulgarny ale wystarczająco
    const result = moderateText('Jesteście debilami, totalna porażka');
    expect(result.flags.some((f) => f.reason === 'profanity')).toBe(true);
  });

  it('decyzja review/reject przy profanity', () => {
    const result = moderateText('To są idioci i debile');
    expect(['review', 'reject']).toContain(result.decision);
  });
});

describe('moderateText — decision boundaries', () => {
  it('topScore >= 0.85 → reject', () => {
    const result = moderateText('PESEL 44051401458'); // hard PII → score 1.0
    expect(result.decision).toBe('reject');
  });

  it('topScore w przedziale [0.5, 0.85) → review', () => {
    const result = moderateText('Telefon 600700800 do kontaktu'); // soft PII = 0.7
    expect(result.decision).toBe('review');
  });

  it('topScore < 0.5 → approve', () => {
    const result = moderateText('Świetna firma, bardzo polecam wszystkim klientom');
    expect(result.decision).toBe('approve');
  });
});

describe('reasonLabel', () => {
  it('zwraca polskie etykiety dla wszystkich powodów', () => {
    const reasons = ['profanity', 'spam', 'pii', 'all-caps', 'off-topic', 'link-spam', 'gibberish'] as const;
    for (const r of reasons) {
      const label = reasonLabel(r);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
