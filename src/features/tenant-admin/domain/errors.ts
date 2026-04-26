// Errores de dominio para tenant-admin.
// Los códigos string coinciden con las excepciones de la migración 00053 (accept_invite / create_invite / revoke_invite)
// para permitir mapeo directo desde errores Postgres a instancias tipadas en infrastructure.

import { ConflictError, NotFoundError, ForbiddenError } from '@/lib/errors'

export class TenantAlreadyExistsError extends ConflictError {
  override readonly code = 'TENANT_ALREADY_EXISTS' as const
  constructor(message = 'Ya existe un tenant con ese nombre') {
    super(message)
    this.name = 'TenantAlreadyExistsError'
  }
}

export class HotelSlugConflictError extends ConflictError {
  override readonly code = 'HOTEL_SLUG_CONFLICT' as const
  constructor(
    public readonly slug: string,
    message?: string
  ) {
    super(message ?? `El slug "${slug}" ya está en uso en este tenant`)
    this.name = 'HotelSlugConflictError'
  }
}

export class InviteNotFoundError extends NotFoundError {
  override readonly code = 'INVITE_NOT_FOUND' as const
  constructor(message = 'Invitación no encontrada o token inválido') {
    super('Invite', message)
    this.name = 'InviteNotFoundError'
  }
}

export class InviteExpiredError extends ConflictError {
  override readonly code = 'INVITE_EXPIRED' as const
  constructor(message = 'La invitación ha expirado') {
    super(message)
    this.name = 'InviteExpiredError'
  }
}

export class InviteAlreadyAcceptedError extends ConflictError {
  override readonly code = 'INVITE_ALREADY_ACCEPTED' as const
  constructor(message = 'La invitación ya fue aceptada') {
    super(message)
    this.name = 'InviteAlreadyAcceptedError'
  }
}

export class InviteRevokedError extends ConflictError {
  override readonly code = 'INVITE_REVOKED' as const
  constructor(message = 'La invitación fue revocada por el administrador') {
    super(message)
    this.name = 'InviteRevokedError'
  }
}

export class InviteEmailMismatchError extends ForbiddenError {
  override readonly code = 'INVITE_EMAIL_MISMATCH' as const
  constructor(message = 'La invitación es para otro email distinto al que tienes en sesión') {
    super(message)
    this.name = 'InviteEmailMismatchError'
  }
}

export class AlreadyMemberError extends ConflictError {
  override readonly code = 'ALREADY_MEMBER' as const
  constructor(
    public readonly email: string,
    message?: string
  ) {
    super(message ?? `${email} ya es miembro activo del hotel`)
    this.name = 'AlreadyMemberError'
  }
}

export class MembershipNotFoundError extends NotFoundError {
  override readonly code = 'MEMBERSHIP_NOT_FOUND' as const
  constructor(
    public readonly membershipId: string,
    message?: string
  ) {
    super('Membership', message ?? `Membership no encontrada: ${membershipId}`)
    this.name = 'MembershipNotFoundError'
  }
}
