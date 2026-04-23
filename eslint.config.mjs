import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/**
 * Boundaries entre features (ANTIGR-QW1, sprint-hardening).
 *
 * Ningún módulo debe importar internals (`domain/`, `application/`, `infrastructure/`,
 * `components/`) de OTRO módulo. La frontera oficial es `index.ts` (client safe) y
 * `server.ts` (server-only). Se permiten:
 *   - imports al `index` de otro módulo: `from '@/features/X'`
 *   - imports al `server` de otro módulo: `from '@/features/X/server'`
 *
 * Excepciones:
 *   - Las páginas en `src/app/**` PUEDEN importar `components/` de un módulo (caso
 *     común: poner un component client específico de feature en una página). NO pueden
 *     importar `infrastructure/` ni `domain/` directamente.
 *   - Dentro del mismo módulo, los imports relativos `../infrastructure/...` son válidos
 *     (no usan `@/features/X/...`).
 */
const featureBoundaryRule = {
  files: [
    'src/features/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/domain', '@/features/*/domain/*'],
            message:
              'No importar `domain/` de otro módulo directamente. Usa el contrato público `@/features/X` (index.ts).',
          },
          {
            group: ['@/features/*/application', '@/features/*/application/*'],
            message:
              'No importar `application/` de otro módulo directamente. Usa `@/features/X` (hooks client) o `@/features/X/server` (server helpers).',
          },
          {
            group: ['@/features/*/infrastructure', '@/features/*/infrastructure/*'],
            message:
              'No importar `infrastructure/` (queries, services, supabase) de otro módulo. Usa el server contract `@/features/X/server`.',
          },
        ],
      },
    ],
  },
}

/**
 * Excepción: las server actions de `src/app/(auth)/**` y `src/app/(onboard)/**` SON
 * el frontal del módulo identity / tenant-admin. Pueden tocar internals de SU módulo
 * dueño (schemas Zod, auth-errors mapper) sin pasar por index.ts, igual que un
 * componente interno del módulo lo haría.
 */
const authActionsException = {
  files: ['src/app/(auth)/**/*.{ts,tsx}', 'src/app/(onboard)/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': 'off',
  },
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  featureBoundaryRule,
  authActionsException,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
