import {
  AppError,
  ConflictError,
  ForbiddenError,
  InfrastructureError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './index'

// Forma común que devuelve Supabase tanto para PostgrestError como AuthError.
// No importamos los tipos directamente para evitar acoplar tests/lint a paquetes específicos.
interface SupabaseErrorLike {
  message?: string
  code?: string | number
  details?: string | null
  hint?: string | null
  status?: number
}

function asSupabaseError(raw: unknown): SupabaseErrorLike | null {
  if (raw === null || typeof raw !== 'object') return null
  const candidate = raw as SupabaseErrorLike
  if (typeof candidate.message !== 'string' && typeof candidate.code !== 'string' && typeof candidate.code !== 'number') {
    return null
  }
  return candidate
}

// Mapea cualquier error Supabase (PostgrestError, AuthError, RPC custom) a la jerarquía AppError.
//
// Convención de uso:
//   const { data, error } = await supabase.from('events').select(...)
//   if (error) throw mapSupabaseError(error, { resource: 'event' })
//
// Si la feature ya tiene mapeo más específico (ej. tenant-admin/invite-queries),
// ese mapeo va primero y delega a éste como fallback.
export function mapSupabaseError(
  raw: unknown,
  context?: { resource?: string }
): AppError {
  const e = asSupabaseError(raw)
  const message = e?.message ?? (raw instanceof Error ? raw.message || 'Error desconocido' : 'Error desconocido')
  const code = typeof e?.code === 'string' ? e.code : ''
  const status = typeof e?.status === 'number' ? e.status : undefined

  // PostgreSQL standard codes
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  switch (code) {
    case '23505': // unique_violation
      return new ConflictError(message, { cause: raw })
    case '23503': // foreign_key_violation
      return new ConflictError(message, { cause: raw })
    case '23502': // not_null_violation
    case '23514': // check_violation
      return new ValidationError(message, undefined, { cause: raw })
    case '42501': // insufficient_privilege (RLS deniega)
      return new ForbiddenError(message, { cause: raw })
    case 'PGRST116': // PostgREST: no rows where one expected
      return new NotFoundError(context?.resource ?? 'recurso', message, { cause: raw })
    case 'P0003': // ChefOS custom: no active hotel
      return new ForbiddenError(message, { cause: raw })
  }

  // Supabase Auth status codes
  if (status === 401) return new UnauthorizedError(message, { cause: raw })
  if (status === 403) return new ForbiddenError(message, { cause: raw })
  if (status === 404) return new NotFoundError(context?.resource ?? 'recurso', message, { cause: raw })
  if (status === 409) return new ConflictError(message, { cause: raw })
  if (status === 422) return new ValidationError(message, undefined, { cause: raw })

  // Heurísticas sobre el mensaje (último recurso para errores RPC sin código estándar)
  const lower = message.toLowerCase()
  if (lower.includes('not found') || lower.includes('no encontrado')) {
    return new NotFoundError(context?.resource ?? 'recurso', message, { cause: raw })
  }
  if (lower.includes('duplicate') || lower.includes('already exists') || lower.includes('ya existe')) {
    return new ConflictError(message, { cause: raw })
  }
  if (lower.includes('forbidden') || lower.includes('not allowed') || lower.includes('permission denied')) {
    return new ForbiddenError(message, { cause: raw })
  }
  if (lower.includes('unauthorized') || lower.includes('no session')) {
    return new UnauthorizedError(message, { cause: raw })
  }

  return new InfrastructureError(message, { cause: raw })
}
