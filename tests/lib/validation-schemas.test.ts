/**
 * Testy walidacji Zod (lib/validation/schemas.ts).
 *
 * Uwaga: te testy wymagają zainstalowanego `zod`.
 * Bez `zod` schemas.ts wpada w shim który przepuszcza wszystko —
 * w środowisku testowym (CI) zod jest wymagany.
 */

import { describe, it, expect } from 'vitest';
import {
  LeadSchema,
  ReviewSchema,
  BookingSchema,
  AiMatchSchema,
  CheckoutSchema,
  WidgetIssueSchema,
} from '@/lib/validation/schemas';

describe('LeadSchema', () => {
  it('akceptuje poprawny lead', () => {
    const result = LeadSchema.safeParse({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '+48 600 700 800',
    });
    expect(result.success).toBe(true);
  });

  it('odrzuca lead bez nazwiska', () => {
    const result = LeadSchema.safeParse({ name: 'A', email: 'x@y.pl', phone: '+48600700800' });
    expect(result.success).toBe(false);
  });

  it('odrzuca błędny email', () => {
    const result = LeadSchema.safeParse({
      name: 'Jan',
      email: 'not-an-email',
      phone: '+48 600 700 800',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca błędny telefon', () => {
    const result = LeadSchema.safeParse({
      name: 'Jan',
      email: 'a@b.pl',
      phone: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('honeypot website musi być puste', () => {
    const result = LeadSchema.safeParse({
      name: 'Bot',
      email: 'a@b.pl',
      phone: '+48 600 700 800',
      website: 'https://spam.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('ReviewSchema', () => {
  it('akceptuje poprawną opinię', () => {
    const result = ReviewSchema.safeParse({
      companySlug: 'firma-1',
      rating: 5,
      comment: 'Świetna obsługa, polecam.',
    });
    expect(result.success).toBe(true);
  });

  it('odrzuca rating > 5', () => {
    const result = ReviewSchema.safeParse({
      companySlug: 'firma-1',
      rating: 6,
      comment: 'Bardzo dobra firma',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca rating < 1', () => {
    const result = ReviewSchema.safeParse({
      companySlug: 'firma-1',
      rating: 0,
      comment: 'Bardzo dobra firma',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca zbyt krótki komentarz', () => {
    const result = ReviewSchema.safeParse({
      companySlug: 'firma-1',
      rating: 5,
      comment: 'OK',
    });
    expect(result.success).toBe(false);
  });
});

describe('BookingSchema', () => {
  it('akceptuje poprawną rezerwację', () => {
    const result = BookingSchema.safeParse({
      companySlug: 'firma-1',
      date: '2026-06-15',
      slot: '10:00',
      service: 'Konsultacja',
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '600700800',
    });
    expect(result.success).toBe(true);
  });

  it('odrzuca błędny format daty', () => {
    const result = BookingSchema.safeParse({
      companySlug: 'firma-1',
      date: '15-06-2026',
      slot: '10:00',
      service: 'Konsultacja',
      name: 'Jan',
      email: 'a@b.pl',
      phone: '600700800',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca błędny format godziny', () => {
    const result = BookingSchema.safeParse({
      companySlug: 'firma-1',
      date: '2026-06-15',
      slot: '10am',
      service: 'Konsultacja',
      name: 'Jan',
      email: 'a@b.pl',
      phone: '600700800',
    });
    expect(result.success).toBe(false);
  });
});

describe('AiMatchSchema', () => {
  it('akceptuje pustą strukturę (wszystkie pola opcjonalne)', () => {
    const result = AiMatchSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('akceptuje features array', () => {
    const result = AiMatchSchema.safeParse({
      city: 'warszawa',
      features: ['chłodnia', '24/7'],
      verifiedOnly: true,
    });
    expect(result.success).toBe(true);
  });

  it('odrzuca limit > 50', () => {
    const result = AiMatchSchema.safeParse({ limit: 1000 });
    expect(result.success).toBe(false);
  });
});

describe('CheckoutSchema', () => {
  it('akceptuje wszystkie plany DB', () => {
    for (const plan of ['free', 'basic', 'standard', 'pro', 'premium', 'enterprise']) {
      const result = CheckoutSchema.safeParse({
        plan,
        companySlug: 'firma-1',
      });
      expect(result.success, `plan=${plan}`).toBe(true);
    }
  });

  it('odrzuca nieznany plan', () => {
    const result = CheckoutSchema.safeParse({
      plan: 'mega',
      companySlug: 'firma-1',
    });
    expect(result.success).toBe(false);
  });
});

describe('WidgetIssueSchema', () => {
  it('akceptuje 4 warianty widget', () => {
    for (const variant of ['card', 'banner', 'compact', 'reviews']) {
      const result = WidgetIssueSchema.safeParse({
        companySlug: 'firma-1',
        variant,
      });
      expect(result.success, `variant=${variant}`).toBe(true);
    }
  });

  it('odrzuca nieznany variant', () => {
    const result = WidgetIssueSchema.safeParse({
      companySlug: 'firma-1',
      variant: 'huge',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca > 20 allowedOrigins', () => {
    const result = WidgetIssueSchema.safeParse({
      companySlug: 'firma-1',
      allowedOrigins: Array(25).fill('https://example.com'),
    });
    expect(result.success).toBe(false);
  });
});
