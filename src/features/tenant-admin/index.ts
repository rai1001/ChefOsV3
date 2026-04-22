/**
 * Contrato público del módulo `tenant-admin` — safe para Client y Server Components.
 *
 * Módulo 15º oficial (ADR-0009). Ownership: tenants, hotels (crear), memberships (mutar),
 * invites email+token.
 *
 * **Regla de oro**: nada fuera de este módulo debe importar desde
 * `./domain`, `./application` o `./infrastructure` directamente.
 */

// ── Domain types ───────────────────────────────────────────────────
export type {
  Invite,
  InviteStatus,
  TeamMember,
  TenantWithHotelInput,
  CreateHotelInput,
  CreateInviteInput,
  CreateInviteResult,
  AcceptInviteResult,
} from './domain/types'

export { COMMON_TIMEZONES, COMMON_CURRENCIES } from './domain/types'

// ── Invariants ─────────────────────────────────────────────────────
export {
  INVITE_STATUS_LABELS,
  INVITE_STATUS_VARIANT,
  isInviteExpired,
  isInviteAccepted,
  isInviteRevoked,
  isInviteAcceptable,
  computeInviteStatus,
  canRevokeInvite,
} from './domain/invariants'

export type { StatusVariant } from './domain/invariants'

// ── Errors ─────────────────────────────────────────────────────────
export {
  TenantAlreadyExistsError,
  HotelSlugConflictError,
  InviteNotFoundError,
  InviteExpiredError,
  InviteAlreadyAcceptedError,
  InviteRevokedError,
  InviteEmailMismatchError,
  AlreadyMemberError,
  MembershipNotFoundError,
} from './domain/errors'

// ── Application: client hooks ──────────────────────────────────────
export { useCreateTenantWithHotel } from './application/use-create-tenant-with-hotel'
export { useTenantHotels } from './application/use-tenant-hotels'
export { useCreateHotel } from './application/use-create-hotel'
export { useTeamMembers } from './application/use-team-members'
export { useUpdateMemberRole } from './application/use-update-member-role'
export { useDeactivateMember, useReactivateMember } from './application/use-deactivate-member'
export { useInvites } from './application/use-invites'
export { useCreateInvite } from './application/use-create-invite'
export { useRevokeInvite } from './application/use-revoke-invite'

// ── Application: server actions (importables desde client-side pero ejecutan server) ──
export { createInviteAction } from './application/create-invite-action'
export type { CreateInviteActionResult } from './application/create-invite-action'
export { acceptInviteAction } from './application/accept-invite-action'

// NOTE: InvitePreview type y el helper server-only preview-invite están en `./server`.
