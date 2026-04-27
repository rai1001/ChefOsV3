// Rate limiting basado en Upstash Redis (Edge-compatible).
// Cubre SEC-002 (Codex): proteger endpoints sensibles (login, signup,
// forgot-password, accept-invite) contra brute force y abuso.
//
// Diseño: tres preset configurables por path. Cada preset usa un sliding window
// distinto. Si las variables UPSTASH_* no están definidas, la función `checkRateLimit`
// devuelve `{ ok: true }` con un warning en logs (modo dev/test seguro).
//
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { type NextRequest } from 'next/server'

export type RateLimitPreset = 'login' | 'signup' | 'forgot-password' | 'invite-accept'

interface PresetConfig {
  windowSeconds: number
  maxRequests: number
}

const PRESETS: Record<RateLimitPreset, PresetConfig> = {
  login: { windowSeconds: 60, maxRequests: 5 },
  signup: { windowSeconds: 600, maxRequests: 5 },
  'forgot-password': { windowSeconds: 900, maxRequests: 3 },
  'invite-accept': { windowSeconds: 60, maxRequests: 10 },
}

interface RateLimiterCacheEntry {
  limiter: Ratelimit
  redis: Redis
}

let cached: Record<string, RateLimiterCacheEntry> | null = null
let warned = false

function getRedisOrSkip(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (!warned) {
      console.warn(
        '[chefos] UPSTASH_REDIS_REST_URL/TOKEN no configuradas — rate limiting deshabilitado (modo dev/test).'
      )
      warned = true
    }
    return null
  }
  return new Redis({ url, token })
}

function getLimiter(preset: RateLimitPreset): RateLimiterCacheEntry | null {
  if (cached?.[preset]) return cached[preset]

  const redis = getRedisOrSkip()
  if (!redis) return null

  const config = PRESETS[preset]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
    analytics: false,
    prefix: `chefos:rl:${preset}`,
  })

  if (!cached) cached = {}
  cached[preset] = { limiter, redis }
  return cached[preset]
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  reset: number
  retryAfterSeconds: number
}

export async function checkRateLimit(
  preset: RateLimitPreset,
  identifier: string
): Promise<RateLimitResult> {
  const entry = getLimiter(preset)
  if (!entry) {
    // Modo skip (dev sin Upstash): siempre permitido. Producción debería tener vars.
    return { ok: true, remaining: Number.POSITIVE_INFINITY, reset: 0, retryAfterSeconds: 0 }
  }
  const result = await entry.limiter.limit(identifier)
  const retryAfterSeconds = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))
  return {
    ok: result.success,
    remaining: result.remaining,
    reset: result.reset,
    retryAfterSeconds,
  }
}

// Identificador para rate limit. Usa IP cuando está disponible (Vercel Edge), fallback "anonymous".
// Para flows autenticados, combinar con el user id externamente: `${ip}:${userId}`.
export function identifierFromRequest(request: NextRequest): string {
  // Vercel provee request.ip. Si está disponible, es seguro usarlo.
  if (request.ip) {
    return request.ip
  }

  // En desarrollo local request.ip suele ser undefined.
  // Podríamos fallback a headers, pero para prevenir spoofing de IPs,
  // solo debemos confiar en headers si estamos seguros de que vienen de un proxy de confianza
  // o estamos en un entorno de desarrollo seguro.
  // Por simplicidad y seguridad, si no hay request.ip confiable, retornamos anonymous,
  // delegando la protección adicional a los IDs de usuario u otros mecanismos.
  return 'anonymous'
}
