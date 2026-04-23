import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AcceptInviteResult,
  CreateInviteInput,
  CreateInviteResult,
  Invite,
  InviteStatus,
} from '../domain/types'
import type { Role } from '@/features/identity'
import {
  AlreadyMemberError,
  InviteAlreadyAcceptedError,
  InviteEmailMismatchError,
  InviteExpiredError,
  InviteNotFoundError,
  InviteRevokedError,
} from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

// ─── Mapeo de códigos Postgres → errores tipados ─────────────────────────────

interface PgError {
  message?: string
  code?: string
}

function mapInviteError(raw: unknown): Error {
  const e = raw as PgError
  const msg = e?.message ?? ''
  if (msg.includes('invite_not_found')) return new InviteNotFoundError()
  if (msg.includes('invite_expired')) return new InviteExpiredError()
  if (msg.includes('invite_already_accepted')) return new InviteAlreadyAcceptedError()
  if (msg.includes('invite_revoked')) return new InviteRevokedError()
  if (msg.includes('invite_already_revoked')) return new InviteRevokedError()
  if (msg.includes('invite_email_mismatch')) return new InviteEmailMismatchError()
  if (msg.includes('already_member'))
    return new AlreadyMemberError('usuario', 'Ya es miembro del hotel')
  return raw instanceof Error ? raw : new Error(msg || 'Error en RPC de invitación')
}

// ─── RPC wrappers ─────────────────────────────────────────────────────────────

export async function createInvite(
  supabase: SupabaseClient,
  input: CreateInviteInput
): Promise<CreateInviteResult> {
  const { data, error } = await supabase.rpc('create_invite', {
    p_hotel_id: input.hotel_id,
    p_email: input.email,
    p_role: input.role,
  })
  if (error) throw mapInviteError(error)
  return data as CreateInviteResult
}

export async function acceptInviteRpc(
  supabase: SupabaseClient,
  token: string
): Promise<AcceptInviteResult> {
  const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
  if (error) throw mapInviteError(error)
  return data as AcceptInviteResult
}

export async function revokeInvite(supabase: SupabaseClient, inviteId: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_invite', { p_invite_id: inviteId })
  if (error) throw mapInviteError(error)
}

export interface InvitePreview {
  email: string
  role: Role
  hotel_id: string
  hotel_name: string
  tenant_id: string
  tenant_name: string
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  status: InviteStatus
}

export async function previewInvite(
  supabase: SupabaseClient,
  token: string
): Promise<InvitePreview> {
  const { data, error } = await supabase.rpc('preview_invite', { p_token: token })
  if (error) throw mapInviteError(error)
  return data as InvitePreview
}

// ─── Lista de invites por hotel (admin UI) ────────────────────────────────────

export async function fetchInvites(
  supabase: SupabaseClient,
  hotelId: string,
  onlyPending = false,
  pagination?: PaginationParams
): Promise<PaginatedResult<Invite>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('invites')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (onlyPending) {
    query = query
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'invite' })
  return buildPaginatedResult((data as Invite[]) ?? [], pageSize, from)
}
