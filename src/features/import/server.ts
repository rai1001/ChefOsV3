import 'server-only'

/**
 * Contrato público server-only del módulo `import` (17º oficial, ADR-0013).
 *
 * Use estos helpers desde Server Components, Server Actions, Route Handlers.
 * NO importar desde Client Components (rompería el build).
 */

export { getImportRunServer } from './application/get-import-run.server'
