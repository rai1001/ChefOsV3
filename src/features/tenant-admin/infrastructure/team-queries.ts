import type { SupabaseClient } from '@supabase/supabase-js'
import type { Role } from '@/features/identity'
import type { TeamMember } from '../domain/types'
import { MembershipNotFoundError } from '../domain/errors'

/**
 * Lista miembros del hotel con info de user (email, full_name) del lado server.
 * Usa RPC `get_team_members` si existe en Supabase; fallback a SELECT join
 * sobre memberships + profiles si no (email from auth.users no es accesible vía RLS).
 */
export async function fetchTeamMembers(
  supabase: SupabaseClient,
  hotelId: string
): Promise<TeamMember[]> {
  // Intentar RPC dedicada (a crear si se necesita mejor perf o acceso a auth.users email).
  const rpcResp = await supabase.rpc('get_team_members', { p_hotel_id: hotelId })
  if (!rpcResp.error && rpcResp.data) {
    return rpcResp.data as TeamMember[]
  }

  // Fallback: join memberships + profiles.
  // Email no disponible desde public.* sin RPC SECURITY DEFINER — se muestra '—' hasta que
  // se cree la RPC get_team_members en una migración adicional (fuera de sprint-02b).
  const { data, error } = await supabase
    .from('memberships')
    .select('id, user_id, role, is_active, is_default, created_at, profiles(full_name)')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as {
      id: string
      user_id: string
      role: Role
      is_active: boolean
      is_default: boolean
      created_at: string
      profiles: { full_name: string | null } | { full_name: string | null }[] | null
    }
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      membership_id: r.id,
      user_id: r.user_id,
      email: '—',
      full_name: profile?.full_name ?? null,
      role: r.role,
      is_active: r.is_active,
      is_default: r.is_default,
      joined_at: r.created_at,
    }
  })
}

export async function updateMemberRole(
  supabase: SupabaseClient,
  membershipId: string,
  role: Role
): Promise<void> {
  const { data, error } = await supabase
    .from('memberships')
    .update({ role })
    .eq('id', membershipId)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new MembershipNotFoundError(membershipId)
}

export async function deactivateMember(
  supabase: SupabaseClient,
  membershipId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('memberships')
    .update({ is_active: false })
    .eq('id', membershipId)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new MembershipNotFoundError(membershipId)
}

export async function reactivateMember(
  supabase: SupabaseClient,
  membershipId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('memberships')
    .update({ is_active: true })
    .eq('id', membershipId)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new MembershipNotFoundError(membershipId)
}
