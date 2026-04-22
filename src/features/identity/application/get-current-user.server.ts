import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createClient, SupabaseEnvMissingError } from '@/lib/supabase/server'
import { NotAuthenticatedError } from '../domain/errors'

/**
 * Obtiene el usuario autenticado desde Server Components / Server Actions.
 * Lanza `NotAuthenticatedError` si no hay sesión. Para UX "opcional",
 * envuelve en try/catch o usa `getCurrentUserOrNull`.
 */
export async function getCurrentUser(): Promise<User> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new NotAuthenticatedError()
  }
  return data.user
}

export async function getCurrentUserOrNull(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  } catch (err) {
    // En dev/test sin env vars, trata al usuario como no autenticado.
    if (err instanceof SupabaseEnvMissingError) return null
    throw err
  }
}
