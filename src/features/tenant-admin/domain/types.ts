// Dominio tenant-admin — tipos puros sin lógica.
// ADR-0009: módulo 15º oficial. Ownership: tenants, hotels (crear), memberships (mutar), invites.

import type { Role } from '@/features/identity'

export interface Invite {
  id: string
  hotel_id: string
  tenant_id: string
  email: string
  role: Role
  expires_at: string
  created_by: string
  created_at: string
  accepted_at: string | null
  accepted_by: string | null
  revoked_at: string | null
}

export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export interface TeamMember {
  membership_id: string
  user_id: string
  email: string
  full_name: string | null
  role: Role
  is_active: boolean
  is_default: boolean
  joined_at: string
}

export interface TenantWithHotelInput {
  tenant_name: string
  hotel_name: string
  hotel_slug: string
  timezone: string
  currency: string
}

export interface CreateHotelInput {
  tenant_id: string
  name: string
  slug: string
  timezone: string
  currency: string
}

export interface CreateInviteInput {
  hotel_id: string
  email: string
  role: Role
}

/**
 * Respuesta del RPC create_invite. Solo contiene token plano aquí (responsabilidad
 * inmediata: enviarlo por email). NO persistir ni pasar a contextos donde pueda
 * loguearse (console, telemetría, UI permanente).
 */
export interface CreateInviteResult {
  invite_id: string
  token: string
  email: string
  role: Role
  expires_at: string
  hotel_id: string
}

export interface AcceptInviteResult {
  hotel_id: string
  tenant_id: string
  role: Role
}

/**
 * Enum de timezone y currency frecuentes. Lista corta para el form de onboarding;
 * el full set lo maneja Supabase directamente. Sin ownership estricto — los strings
 * están abiertos.
 */
export const COMMON_TIMEZONES = [
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris',
  'Europe/Lisbon',
  'America/New_York',
  'America/Mexico_City',
  'UTC',
] as const

export const COMMON_CURRENCIES = ['EUR', 'USD', 'GBP', 'MXN'] as const
