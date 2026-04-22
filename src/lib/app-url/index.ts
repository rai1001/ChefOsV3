// Canonical app URL — única fuente de verdad para construir URLs absolutas (callbacks
// de Supabase Auth, links de invitación por email, etc.).
//
// Cubre SEC-003 (Codex): NO leer `host`/`x-forwarded-proto` de los headers de la
// request. Un proxy mal configurado podría permitir spoofing del header Host y
// generar enlaces de invitación apuntando a dominios de atacante.
//
// La URL se toma exclusivamente de `NEXT_PUBLIC_APP_URL` y se valida contra una
// allowlist por entorno. En dev, si la variable no está definida, se usa
// `http://localhost:3000` como default seguro.

const DEFAULT_DEV_URL = 'http://localhost:3000'

const DEFAULT_ALLOWLIST = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const

function parseAllowlist(): string[] {
  const envList = process.env.APP_URL_ALLOWLIST
  if (!envList) return [...DEFAULT_ALLOWLIST]
  return envList
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

function normalize(rawUrl: string): string {
  try {
    const u = new URL(rawUrl)
    return `${u.protocol}//${u.host}`
  } catch {
    return ''
  }
}

export interface AppUrlOptions {
  // Si true, lanza si la URL no está en la allowlist en producción.
  // Default: true en producción, false en dev/test.
  enforceAllowlist?: boolean
}

export class InvalidAppUrlError extends Error {
  readonly code = 'INVALID_APP_URL' as const
  constructor(public readonly attemptedUrl: string, public readonly allowlist: string[]) {
    super(
      `App URL "${attemptedUrl}" no está en la allowlist permitida. Configurada: ${allowlist.join(', ')}`
    )
    this.name = 'InvalidAppUrlError'
  }
}

export function getCanonicalAppUrl(options?: AppUrlOptions): string {
  const env = process.env.NODE_ENV
  const isProd = env === 'production'
  const enforceAllowlist = options?.enforceAllowlist ?? isProd

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
  const candidate = normalize(fromEnv ?? '') || DEFAULT_DEV_URL

  const allowlist = parseAllowlist().map(normalize).filter(Boolean)

  if (enforceAllowlist) {
    if (!allowlist.includes(candidate)) {
      throw new InvalidAppUrlError(candidate, allowlist)
    }
  }

  return candidate
}

// Construye una URL absoluta con path. Garantiza que el resultado pertenece al dominio canónico.
export function buildAbsoluteUrl(path: string, options?: AppUrlOptions): string {
  const base = getCanonicalAppUrl(options)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
