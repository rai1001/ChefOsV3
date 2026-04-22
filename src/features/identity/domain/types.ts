export const ROLES = [
  'superadmin',
  'direction',
  'admin',
  'head_chef',
  'sous_chef',
  'cook',
  'commercial',
  'procurement',
  'warehouse',
  'room',
  'reception',
  'operations',
  'maintenance',
] as const

export type Role = (typeof ROLES)[number]

export type UXProfile = 'cocina' | 'oficina' | 'compras' | 'comercial'

export interface Tenant {
  id: string
  name: string
  created_at: string
}

export interface Hotel {
  id: string
  tenant_id: string
  name: string
  slug: string
  timezone: string
  currency: string
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string
  hotel_id: string
  tenant_id: string
  role: Role
  is_active: boolean
  is_default: boolean
  created_at: string
}

/**
 * Returned by RPC `get_active_hotel()`. Representa la combinación hotel+rol
 * activo del usuario actual para el contexto operativo.
 */
export interface ActiveHotel {
  membership_id: string
  hotel_id: string
  hotel_name: string
  hotel_slug: string
  timezone: string
  currency: string
  role: Role
  tenant_id: string
}

/**
 * Returned by RPC `get_user_hotels()`. Uno por cada membership activa.
 */
export interface UserHotel {
  membership_id: string
  hotel_id: string
  hotel_name: string
  hotel_slug: string
  role: Role
  is_default: boolean
}
