// Logger mínimo viable para correlation tracking.
// Emite JSON estructurado a stdout/stderr (compatible con agregadores de Vercel/Datadog/Loki).
// No depende de librería externa: el bundle no crece y el código funciona en Edge runtime.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  correlationId?: string
  userId?: string
  hotelId?: string
  flow?: string
  [key: string]: unknown
}

function uuidV4FromRandomValues(getRandomValues: (array: Uint8Array) => Uint8Array): string {
  const bytes = getRandomValues(new Uint8Array(16))

  const byte6 = bytes.at(6)
  const byte8 = bytes.at(8)

  if (byte6 === undefined || byte8 === undefined) {
    throw new Error('Secure random source returned insufficient bytes for UUID generation.')
  }

  bytes[6] = (byte6 & 0x0f) | 0x40
  bytes[8] = (byte8 & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function newCorrelationId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }

    if (typeof crypto.getRandomValues === 'function') {
      return uuidV4FromRandomValues((array) => crypto.getRandomValues(array))
    }
  }

  throw new Error('Secure crypto API is unavailable; cannot generate correlation ID.')
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
  }
  const serialized = JSON.stringify(entry)
  if (level === 'error') {
    console.error(serialized)
  } else if (level === 'warn') {
    console.warn(serialized)
  } else {
    console.log(serialized)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}
