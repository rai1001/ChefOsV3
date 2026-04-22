import 'server-only'

/**
 * Contrato público server-only del módulo `menus`.
 *
 * Use estos helpers desde Server Components, Server Actions, Route Handlers.
 * NO importar desde Client Components (rompería el build).
 */

export { getMenuServer, getMenuWithSectionsServer } from './application/get-menu.server'
