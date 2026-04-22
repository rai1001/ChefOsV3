import type { Role, UXProfile, Membership } from './types'

export const ROLE_TO_PROFILE: Record<Role, UXProfile> = {
  superadmin: 'oficina',
  direction: 'oficina',
  admin: 'oficina',
  head_chef: 'cocina',
  sous_chef: 'cocina',
  cook: 'cocina',
  maintenance: 'cocina',
  commercial: 'comercial',
  room: 'comercial',
  reception: 'comercial',
  operations: 'comercial',
  procurement: 'compras',
  warehouse: 'compras',
}

export function uxProfileFromRole(role: Role): UXProfile {
  return ROLE_TO_PROFILE[role]
}

export function hasRole(currentRole: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(currentRole)
}

export function isActiveMembership(membership: Pick<Membership, 'is_active'>): boolean {
  return membership.is_active === true
}
