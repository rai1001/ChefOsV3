import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { previewInvite, type InvitePreview } from '../infrastructure/invite-queries'

/**
 * Server helper: consulta metadata de un invite sin aceptarlo.
 * Requiere que el caller esté autenticado (enforce en el RPC preview_invite).
 *
 * Uso típico: Server Component de `/invite/[token]` antes de mostrar el CTA aceptar.
 */
export async function previewInviteServer(token: string): Promise<InvitePreview> {
  const supabase = await createClient()
  return previewInvite(supabase, token)
}
