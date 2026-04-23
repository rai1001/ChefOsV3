import type { Invite, InviteStatus } from './types'

// ─── Labels ───────────────────────────────────────────────────────────────────

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  revoked: 'Revocada',
  expired: 'Expirada',
}

export type StatusVariant = 'neutral' | 'warning' | 'success' | 'info' | 'urgent'

export const INVITE_STATUS_VARIANT: Record<InviteStatus, StatusVariant> = {
  pending: 'info',
  accepted: 'success',
  revoked: 'urgent',
  expired: 'warning',
}

// ─── Invariantes puros ────────────────────────────────────────────────────────

export function isInviteExpired(
  invite: Pick<Invite, 'expires_at'>,
  now: Date = new Date()
): boolean {
  return new Date(invite.expires_at).getTime() <= now.getTime()
}

export function isInviteAccepted(invite: Pick<Invite, 'accepted_at'>): boolean {
  return invite.accepted_at !== null
}

export function isInviteRevoked(invite: Pick<Invite, 'revoked_at'>): boolean {
  return invite.revoked_at !== null
}

/**
 * Un invite es "aceptable" si está pendiente (no aceptado, no revocado, no expirado)
 * y el email del caller coincide (case-insensitive).
 */
export function isInviteAcceptable(
  invite: Pick<Invite, 'expires_at' | 'accepted_at' | 'revoked_at' | 'email'>,
  callerEmail: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (isInviteAccepted(invite)) return false
  if (isInviteRevoked(invite)) return false
  if (isInviteExpired(invite, now)) return false
  if (!callerEmail) return false
  return invite.email.toLowerCase() === callerEmail.toLowerCase()
}

export function computeInviteStatus(
  invite: Pick<Invite, 'expires_at' | 'accepted_at' | 'revoked_at'>,
  now: Date = new Date()
): InviteStatus {
  if (isInviteAccepted(invite)) return 'accepted'
  if (isInviteRevoked(invite)) return 'revoked'
  if (isInviteExpired(invite, now)) return 'expired'
  return 'pending'
}

export function canRevokeInvite(invite: Pick<Invite, 'accepted_at' | 'revoked_at'>): boolean {
  return !isInviteAccepted(invite) && !isInviteRevoked(invite)
}
