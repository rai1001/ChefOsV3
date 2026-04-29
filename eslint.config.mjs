import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/**
 * Boundaries entre features (ANTIGR-QW1, sprint-hardening + hardening-2 C5).
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
 *     importar `infrastructure/` ni `domain/` directamente. Esta excepción se aplica
 *     vía la regla `featureBoundaryStrict` que NO bloquea `components/` para `src/app/`.
 *   - Otros módulos `src/features/Y/**` NO pueden importar `components/` de un feature
 *     externo (regla `featureBoundaryStrict` les aplica el bloqueo completo). Si una
 *     UI compartida es necesaria, vive en `src/components/`.
 *   - Dentro del mismo módulo, los imports relativos `../infrastructure/...` son válidos
 *     (no usan `@/features/X/...`).
 */
const FEATURE_INTERNAL_PATTERNS = [
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
]

// Regla suave (sin bloquear `components/`) — para `src/app/**`, `src/lib/**`,
// `src/components/**`. Las pages pueden seguir poniendo un component de feature.
const featureBoundaryRule = {
  files: [
    'src/app/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: FEATURE_INTERNAL_PATTERNS },
    ],
  },
}

// Regla estricta — para `src/features/**`. Aquí SÍ bloquea `components/` cruzados.
const featureBoundaryStrict = {
  files: ['src/features/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...FEATURE_INTERNAL_PATTERNS,
          {
            group: ['@/features/*/components', '@/features/*/components/*'],
            message:
              'No importar `components/` de otro módulo desde un feature. La frontera de UI compartida es `src/components/`. Si una página app necesita un component de feature, sí puede importarlo desde `src/app/**`.',
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
const AUTH_ONBOARD_CROSS_FEATURE_PATTERNS = [
  {
    group: [
      '@/features/!(identity|tenant-admin)/domain',
      '@/features/!(identity|tenant-admin)/domain/*',
    ],
    message:
      'Desde auth/onboard solo se permiten internals de `identity` y `tenant-admin`.',
  },
  {
    group: [
      '@/features/!(identity|tenant-admin)/application',
      '@/features/!(identity|tenant-admin)/application/*',
    ],
    message:
      'Desde auth/onboard solo se permiten internals de `identity` y `tenant-admin`.',
  },
  {
    group: [
      '@/features/!(identity|tenant-admin)/infrastructure',
      '@/features/!(identity|tenant-admin)/infrastructure/*',
    ],
    message:
      'Desde auth/onboard solo se permiten internals de `identity` y `tenant-admin`.',
  },
  {
    group: [
      '@/features/!(identity|tenant-admin)/components',
      '@/features/!(identity|tenant-admin)/components/*',
    ],
    message:
      'Desde auth/onboard solo se permiten internals de `identity` y `tenant-admin`.',
  },
]

const authActionsException = {
  files: [
    'src/app/(auth)/**/*.{ts,tsx}',
    'src/app/(onboard)/**/*.{ts,tsx}',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: AUTH_ONBOARD_CROSS_FEATURE_PATTERNS },
    ],
  },
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  featureBoundaryRule,
  featureBoundaryStrict,
  authActionsException,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
    'supabase/functions/**',
  ]),
])

export default eslintConfig
