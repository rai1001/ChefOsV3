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

function getNormalizedAllowlist(): string[] {
  return parseAllowlist().map(normalize).filter(Boolean)
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

export class MissingAppUrlError extends Error {
  readonly code = 'MISSING_APP_URL' as const
  constructor() {
    super('NEXT_PUBLIC_APP_URL es obligatoria y debe ser válida en producción')
    this.name = 'MissingAppUrlError'
  }
}

export function getCanonicalAppUrl(options?: AppUrlOptions): string {
  const env = process.env.NODE_ENV
  const isProd = env === 'production'
  const enforceAllowlist = options?.enforceAllowlist ?? isProd

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ''
  const normalizedFromEnv = normalize(fromEnv)

  if (isProd && !normalizedFromEnv) {
    throw new MissingAppUrlError()
  }

  const candidate = normalizedFromEnv || DEFAULT_DEV_URL
  const allowlist = getNormalizedAllowlist()

  if (enforceAllowlist) {
    if (!allowlist.includes(candidate)) {
      throw new InvalidAppUrlError(candidate, allowlist)
    }
  }

  return candidate
}

// Devuelve el origin preferido solo si pertenece a la allowlist.
// Si no, cae al origin canónico para evitar redirects a hosts no confiables.
export function getAllowedAppOrigin(preferredOrigin?: string | null): string {
  const canonical = getCanonicalAppUrl()
  const normalizedPreferred = preferredOrigin ? normalize(preferredOrigin) : ''
  const allowlist = getNormalizedAllowlist()

  if (normalizedPreferred && allowlist.includes(normalizedPreferred)) {
    return normalizedPreferred
  }

  return canonical
}

// Construye una URL absoluta con path. Garantiza que el resultado pertenece al dominio canónico.
export function buildAbsoluteUrl(path: string, options?: AppUrlOptions): string {
  const base = getCanonicalAppUrl(options)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
