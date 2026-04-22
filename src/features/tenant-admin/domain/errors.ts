// Errores de dominio para tenant-admin.
// Los códigos string coinciden con las excepciones de la migración 00053 (accept_invite / create_invite / revoke_invite)
// para permitir mapeo directo desde errores Postgres a instancias tipadas en infrastructure.

export class TenantAlreadyExistsError extends Error {
  readonly code = 'TENANT_ALREADY_EXISTS' as const
  constructor(message = 'Ya existe un tenant con ese nombre') {
    super(message)
    this.name = 'TenantAlreadyExistsError'
  }
}

export class HotelSlugConflictError extends Error {
  readonly code = 'HOTEL_SLUG_CONFLICT' as const
  constructor(
    public readonly slug: string,
    message?: string
  ) {
    super(message ?? `El slug "${slug}" ya está en uso en este tenant`)
    this.name = 'HotelSlugConflictError'
  }
}

export class InviteNotFoundError extends Error {
  readonly code = 'INVITE_NOT_FOUND' as const
  constructor(message = 'Invitación no encontrada o token inválido') {
    super(message)
    this.name = 'InviteNotFoundError'
  }
}

export class InviteExpiredError extends Error {
  readonly code = 'INVITE_EXPIRED' as const
  constructor(message = 'La invitación ha expirado') {
    super(message)
    this.name = 'InviteExpiredError'
  }
}

export class InviteAlreadyAcceptedError extends Error {
  readonly code = 'INVITE_ALREADY_ACCEPTED' as const
  constructor(message = 'La invitación ya fue aceptada') {
    super(message)
    this.name = 'InviteAlreadyAcceptedError'
  }
}

export class InviteRevokedError extends Error {
  readonly code = 'INVITE_REVOKED' as const
  constructor(message = 'La invitación fue revocada por el administrador') {
    super(message)
    this.name = 'InviteRevokedError'
  }
}

export class InviteEmailMismatchError extends Error {
  readonly code = 'INVITE_EMAIL_MISMATCH' as const
  constructor(message = 'La invitación es para otro email distinto al que tienes en sesión') {
    super(message)
    this.name = 'InviteEmailMismatchError'
  }
}

export class AlreadyMemberError extends Error {
  readonly code = 'ALREADY_MEMBER' as const
  constructor(
    public readonly email: string,
    message?: string
  ) {
    super(message ?? `${email} ya es miembro activo del hotel`)
    this.name = 'AlreadyMemberError'
  }
}

export class MembershipNotFoundError extends Error {
  readonly code = 'MEMBERSHIP_NOT_FOUND' as const
  constructor(
    public readonly membershipId: string,
    message?: string
  ) {
    super(message ?? `Membership no encontrada: ${membershipId}`)
    this.name = 'MembershipNotFoundError'
  }
}
