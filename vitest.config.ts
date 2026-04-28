import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['node_modules', '.next', 'e2e', 'dist', 'build'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Reportamos toda la lógica (domain + application) para visibilidad,
      // pero el gate solo aplica a `domain/**` (lógica pura, alta densidad
      // de tests). `application/**` mezcla hooks, server actions y queries
      // que requieren E2E real para cubrirlas — ver C2 sprint hardening-2b.
      include: ['src/features/**/domain/**', 'src/features/**/application/**'],
      // Gate de regresión: refleja el snapshot real de cobertura `domain/**`
      // a 2026-04-28. La meta de spec sigue siendo 90% (coding-standards.md);
      // se sube progresivamente en hardening-2b cuando se añadan tests al
      // remanente de `domain/` y se incluya `application/` en el gate.
      thresholds: {
        'src/features/**/domain/**': {
          lines: 79,
          functions: 79,
          branches: 79,
          statements: 79,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/test/server-only.ts'),
    },
  },
})
