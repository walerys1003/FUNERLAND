/**
 * Vitest setup — globalny init dla testów.
 */
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Domyślnie wymuszamy demo mode — bez prawdziwych integracji w testach
process.env.USE_SUPABASE = 'false';
process.env.NODE_ENV = 'test';

// Stub crypto.randomUUID dla starszych runtime'ów (jsdom < 22)
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.randomUUID) {
  const nodeCrypto = require('node:crypto');
  globalThis.crypto = {
    ...(globalThis.crypto || {}),
    randomUUID: () => nodeCrypto.randomUUID(),
    getRandomValues: (arr: any) => nodeCrypto.randomFillSync(arr),
  } as any;
}

// Wycisz console.warn z optional libów (resend/stripe brak — to OK)
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = String(args[0] || '');
  if (msg.includes('[resend]') || msg.includes('[stripe]') || msg.includes('[sentry]')) return;
  origWarn(...args);
};

// Mock fetch globalnie — testy nie powinny robić prawdziwych HTTP requestów
if (!(globalThis as any).__fetchMocked) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
  (globalThis as any).__fetchMocked = true;
}
