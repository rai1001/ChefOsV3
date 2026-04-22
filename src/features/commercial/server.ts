import 'server-only'

/**
 * Contrato público server-only del módulo `commercial`.
 *
 * Reservado para helpers que lean/muten datos comerciales desde Server Components,
 * Server Actions o Route Handlers sin cargar hooks React al bundle cliente.
 *
 * Por ahora está vacío: las páginas del módulo usan hooks client (`@/features/commercial`)
 * y Server Actions locales en `src/app/(app)/events/*` para mutations.
 *
 * Cuando algún flujo necesite leer eventos directamente en un Server Component
 * (p. ej. una ruta `/events/[id]/print` server-rendered), añadir aquí un helper
 * `getEventServer(hotelId, eventId)` apoyado en `infrastructure/event-queries.ts`.
 */

export {}
