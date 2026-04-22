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

export function newCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
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
