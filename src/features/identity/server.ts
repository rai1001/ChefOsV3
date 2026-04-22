import 'server-only'

/**
 * Contrato público server-only del módulo `identity`.
 *
 * Use estos helpers desde Server Components, Server Actions y Route Handlers.
 * NO importar desde Client Components (rompería el build).
 *
 * Para hooks client, usar `@/features/identity` (entry normal).
 */

export {
  getCurrentUser,
  getCurrentUserOrNull,
} from './application/get-current-user.server'

export { getActiveHotel, getActiveHotelOrNull } from './application/get-active-hotel.server'
