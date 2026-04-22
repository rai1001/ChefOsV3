import 'server-only'

/**
 * Contrato público server-only del módulo `commercial`.
 *
 * Use estos helpers desde Server Components, Server Actions, Route Handlers.
 * NO importar desde Client Components (rompería el build).
 *
 * Para hooks client + types, usar `@/features/commercial` (entry normal).
 */

export {
  getEventServer,
  getEventSpacesServer,
  getEventMenusServer,
  getEventDetailServer,
  getClientServer,
} from './application/get-event.server'
