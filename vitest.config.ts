import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config.
 *
 * - Środowisko: jsdom (testy React + DOM)
 * - Alias `@/...` jak w tsconfig (paths)
 * - Setup file dla testing-library
 * - Coverage: tylko src/lib (logika domenowa — UI testujemy przez Playwright)
 */

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/*.d.ts',
        'src/lib/**/types.ts',
        'src/lib/marketplace/store.ts', // seed data
        'src/lib/data.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
