import 'server-only'

import { createClient, SupabaseEnvMissingError } from '@/lib/supabase/server'
import { callGetActiveHotel } from '../infrastructure/identity-queries'
import { NoActiveHotelError } from '../domain/errors'
import type { ActiveHotel } from '../domain/types'

/**
 * Obtiene el hotel activo del usuario autenticado desde Server Components.
 * Lanza `NoActiveHotelError` si el user no tiene membership activa.
 */
export async function getActiveHotel(): Promise<ActiveHotel> {
  const supabase = await createClient()
  return callGetActiveHotel(supabase)
}

export async function getActiveHotelOrNull(): Promise<ActiveHotel | null> {
  try {
    return await getActiveHotel()
  } catch (err) {
    if (err instanceof NoActiveHotelError) return null
    if (err instanceof SupabaseEnvMissingError) return null
    // Error de Supabase/red → propagar para que Next muestre error boundary.
    throw err
  }
}
