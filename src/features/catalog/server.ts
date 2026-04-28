import 'server-only'

/**
 * Contrato público server-only del módulo `catalog`.
 *
 * Use estos helpers desde Server Components, Server Actions, Route Handlers.
 * NO importar desde Client Components (rompería el build).
 *
 * Para hooks client + types, usar `@/features/catalog` (entry normal).
 */

export { getProductServer } from './application/get-product.server'
export { getSupplierServer } from './application/get-supplier.server'
