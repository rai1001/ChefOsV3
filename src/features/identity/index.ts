/**
 * Contrato público del módulo `identity` — safe para Client y Server Components.
 *
 * Server-only helpers (getCurrentUser, getActiveHotel) viven en
 * `@/features/identity/server` para evitar filtrar `next/headers` + cookies al bundle cliente.
 *
 * **Regla de oro**: nada fuera de este módulo debe importar desde
 * `./domain`, `./application` o `./infrastructure` directamente.
 *
 * Ver `.ai/specs/core-constraints.md § 7`.
 */

// ── Domain types ───────────────────────────────────────────────────
export type {
  Role,
  UXProfile,
  Tenant,
  Hotel,
  Profile,
  Membership,
  ActiveHotel,
  UserHotel,
} from './domain/types'

export { ROLES } from './domain/types'

// ── Invariants (pure functions) ────────────────────────────────────
export { ROLE_TO_PROFILE, uxProfileFromRole, hasRole, isActiveMembership } from './domain/invariants'

// ── Permissions ────────────────────────────────────────────────────
export type { Permission } from './domain/permissions'
export { PERMISSIONS, hasPermission } from './domain/permissions'

// ── Errors ─────────────────────────────────────────────────────────
export {
  NotAuthenticatedError,
  NoActiveHotelError,
  InsufficientRoleError,
} from './domain/errors'

// ── Application: client hooks ──────────────────────────────────────
export { useCurrentUser } from './application/use-current-user'
export { useActiveHotel } from './application/use-active-hotel'
export { useUserHotels } from './application/use-user-hotels'
export { useSwitchHotel } from './application/use-switch-hotel'
export { useSignOut } from './application/use-sign-out'

// NOTE: server helpers (getCurrentUser, getActiveHotel) viven en
// `@/features/identity/server` (entry con `import 'server-only'`).
// Schemas Zod (`./application/schemas.ts`) e `./infrastructure/*` NO se re-exportan —
// se consumen directamente desde las Server Actions del módulo.
