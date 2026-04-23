import 'server-only'

import { Resend } from 'resend'

/**
 * Lazy singleton del cliente Resend. Skip graceful si `RESEND_API_KEY` no está definida
 * (típico en dev) — los callers deben comprobar el retorno null y fallback a link copy-paste.
 */
let cached: Resend | null = null
let warned = false

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    if (!warned && process.env.NODE_ENV !== 'test') {
      console.warn(
        '[email] RESEND_API_KEY no configurada — emails serán skippeados, devolviendo link plano.'
      )
      warned = true
    }
    return null
  }
  if (!cached) {
    cached = new Resend(key)
  }
  return cached
}

export const DEFAULT_FROM = process.env.RESEND_FROM ?? 'ChefOS <onboarding@resend.dev>'
