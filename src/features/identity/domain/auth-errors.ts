// Catálogo cerrado de errores que el flujo de autenticación puede mostrar al usuario.
// Cubre SEC-001 (Codex): nunca exponemos `error.message` crudo de Supabase porque facilita
// enumeración de cuentas y filtra detalles internos del proveedor.
//
// Convención:
//   - userMessage: NEUTRO. Para login y forgot-password todos los fallos no operativos
//     comparten el mismo mensaje (no decir "email no existe" vs "password incorrecto").
//   - internalMessage: detalle real de Supabase. Sólo va a logs internos.
//   - code: discriminante para tests y telemetría.

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'email_already_in_use'
  | 'weak_password'
  | 'rate_limited'
  | 'network_error'
  | 'generic'

export interface MappedAuthError {
  readonly code: AuthErrorCode
  readonly userMessage: string
  readonly internalMessage: string
  readonly retryAfterSeconds?: number
}

const NEUTRAL_LOGIN_MESSAGE = 'Credenciales incorrectas. Si el problema persiste, contacta con soporte.'
const NEUTRAL_RESET_MESSAGE = 'No hemos podido procesar la solicitud. Inténtalo de nuevo en unos minutos.'

interface AuthErrorLike {
  message?: string
  status?: number
  code?: string
  name?: string
}

function asAuthError(raw: unknown): AuthErrorLike {
  if (raw === null || typeof raw !== 'object') {
    return { message: typeof raw === 'string' ? raw : 'unknown error' }
  }
  return raw as AuthErrorLike
}

// Mapea un error de Supabase Auth a un MappedAuthError.
// `flow` ajusta el userMessage por defecto (login vs reset) cuando el código no es
// directamente accionable por el usuario.
export function mapAuthError(
  raw: unknown,
  flow: 'login' | 'signup' | 'reset' = 'login'
): MappedAuthError {
  const e = asAuthError(raw)
  const message = e.message ?? ''
  const lower = message.toLowerCase()
  const status = e.status

  // Rate limit (Supabase Auth devuelve 429 con header Retry-After cuando aplica)
  if (status === 429 || lower.includes('rate limit') || lower.includes('too many')) {
    return {
      code: 'rate_limited',
      userMessage: 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
      internalMessage: message || 'Auth rate limited',
    }
  }

  // Credenciales inválidas (login)
  if (lower.includes('invalid login') || lower.includes('invalid credentials') || status === 400) {
    return {
      code: 'invalid_credentials',
      userMessage: flow === 'reset' ? NEUTRAL_RESET_MESSAGE : NEUTRAL_LOGIN_MESSAGE,
      internalMessage: message || 'Invalid credentials',
    }
  }

  // Email no confirmado
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return {
      code: 'email_not_confirmed',
      userMessage: 'Necesitas confirmar tu email antes de entrar. Revisa tu bandeja y la carpeta de spam.',
      internalMessage: message,
    }
  }

  // Email ya en uso (signup)
  if (lower.includes('user already registered') || lower.includes('already registered') || lower.includes('email already')) {
    if (flow === 'signup') {
      return {
        code: 'email_already_in_use',
        userMessage: 'Si el email está registrado recibirás instrucciones por correo.',
        internalMessage: message,
      }
    }
  }

  // Password débil (signup)
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('short') || lower.includes('characters'))) {
    return {
      code: 'weak_password',
      userMessage: 'La contraseña no cumple los requisitos mínimos. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.',
      internalMessage: message,
    }
  }

  // Errores de red / fetch
  if (lower.includes('fetch') || lower.includes('network') || e.name === 'TypeError') {
    return {
      code: 'network_error',
      userMessage: 'No hemos podido contactar con el servicio. Revisa tu conexión e inténtalo de nuevo.',
      internalMessage: message || 'Network error contacting auth provider',
    }
  }

  // Fallback
  return {
    code: 'generic',
    userMessage: flow === 'reset' ? NEUTRAL_RESET_MESSAGE : NEUTRAL_LOGIN_MESSAGE,
    internalMessage: message || 'Unknown auth error',
  }
}
