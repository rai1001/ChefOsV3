'use server'

import { createClient } from '@/lib/supabase/server'
import { createInvite } from '../infrastructure/invite-queries'
import { sendInviteEmail } from '../infrastructure/send-invite-email'
import type { CreateInviteInput } from '../domain/types'
import { buildAbsoluteUrl } from '@/lib/app-url'

export interface CreateInviteActionResult {
  invite_id: string
  email: string
  role: string
  expires_at: string
  email_sent: boolean
  /**
   * URL plana del invite. Devuelta SIEMPRE (útil para dev cuando no hay RESEND_API_KEY,
   * se copia y pega manualmente). En prod con email enviado, es seguro mostrarla solo al
   * admin que creó el invite en su propia sesión inmediatamente tras crearlo (no persistir).
   */
  invite_url: string
}

/**
 * Server Action: crea invite (obtiene token plano) + envía email + devuelve resultado
 * sin exponer el token al cliente (solo la URL completa que lo contiene).
 *
 * Arquitectura ADR-0009: el token plano solo vive server-side + en el email + en la URL
 * que el admin ve una vez. Jamás se almacena ni se vuelve a consultar.
 *
 * SEC-003 (Codex): el origin se resuelve desde NEXT_PUBLIC_APP_URL validado contra
 * APP_URL_ALLOWLIST. NO se leen `host`/`x-forwarded-proto` de los headers (vector
 * de phishing si proxy mal configurado).
 */
export async function createInviteAction(
  input: CreateInviteInput
): Promise<CreateInviteActionResult> {
  const supabase = await createClient()

  const result = await createInvite(supabase, input)
  const inviteUrl = buildAbsoluteUrl(`/invite/${encodeURIComponent(result.token)}`)

  // Info del inviter para personalizar email
  const { data: inviterData } = await supabase.auth.getUser()
  const inviterName: string | null =
    (inviterData?.user?.user_metadata?.full_name as string | undefined) ??
    (inviterData?.user?.email ? (inviterData.user.email.split('@')[0] ?? null) : null)

  // Nombre del hotel + tenant para email
  const { data: hotelRow } = await supabase
    .from('hotels')
    .select('name, tenants(name)')
    .eq('id', input.hotel_id)
    .maybeSingle()

  const hotelName = (hotelRow as { name?: string } | null)?.name ?? 'tu hotel'
  const tenantName =
    ((hotelRow as { tenants?: { name?: string } | null } | null)?.tenants?.name as
      | string
      | undefined) ?? 'ChefOS'

  const emailResult = await sendInviteEmail({
    toEmail: result.email,
    role: input.role,
    hotelName,
    tenantName,
    inviterName,
    inviteUrl,
    expiresAt: result.expires_at,
  })

  return {
    invite_id: result.invite_id,
    email: result.email,
    role: result.role,
    expires_at: result.expires_at,
    email_sent: emailResult.sent,
    invite_url: inviteUrl,
  }
}
