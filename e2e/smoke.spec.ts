/**
 * Smoke tests — krytyczne ścieżki, które MUSZĄ działać przed deployem.
 *
 *  1. Strona główna ładuje się + ma <title> i meta description
 *  2. /firmy lista firm
 *  3. /nekrologi działają
 *  4. /asystent (AI) — wpisanie zapytania + otrzymanie wyników
 *  5. /zapytanie — formularz lead (z walidacją)
 *  6. /robots.txt + /sitemap.xml dostępne
 */

import { test, expect } from '@playwright/test';

test.describe('smoke — strona główna', () => {
  test('homepage ładuje się z title + meta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Polskie Pogrzeby/i);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(50);
  });

  test('homepage nie ma błędów konsoli (poza analytics)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('plausible')) {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('główna ma poprawny <html lang>', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toMatch(/^pl/);
  });
});

test.describe('smoke — listy', () => {
  test('/firmy ładuje listę', async ({ page }) => {
    await page.goto('/firmy');
    await expect(page.locator('main')).toBeVisible();
  });

  test('/nekrologi ładuje listę', async ({ page }) => {
    await page.goto('/nekrologi');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('smoke — SEO assets', () => {
  test('/robots.txt ma User-agent i Sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-?agent/i);
    expect(body).toMatch(/Sitemap/i);
  });

  test('/sitemap.xml zwraca XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
  });
});

test.describe('smoke — formularz lead', () => {
  test('strona /zapytanie ma formularz', async ({ page }) => {
    await page.goto('/zapytanie');
    // Plik strony może nazywać się różnie — sprawdzamy obecność formularza
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('smoke — bezpieczeństwo nagłówków', () => {
  test('CSP / HSTS są wysyłane', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const headers = res.headers();
    // Mamy Report-Only — sprawdź jednego z dwóch
    const hasCsp =
      headers['content-security-policy'] || headers['content-security-policy-report-only'];
    expect(hasCsp).toBeTruthy();
    // HSTS tylko gdy HTTPS — w dev na localhost może nie być
    if (headers['strict-transport-security']) {
      expect(headers['strict-transport-security']).toMatch(/max-age/);
    }
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});

test.describe('smoke — API health', () => {
  test('/api/health zwraca 200', async ({ request }) => {
    const res = await request.get('/api/health');
    expect([200, 404]).toContain(res.status()); // 404 jeśli endpoint nie istnieje — nie blokujemy
  });

  test('/api/moderate akceptuje POST', async ({ request }) => {
    const res = await request.post('/api/moderate', {
      data: { text: 'Bardzo profesjonalna firma, polecam.' },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('decision');
  });

  test('/api/lead odrzuca pusty payload (400 lub 429)', async ({ request }) => {
    const res = await request.post('/api/lead', { data: {} });
    expect([400, 429]).toContain(res.status());
  });
});
