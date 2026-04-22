'use server'

import { createClient } from '@/lib/supabase/server'
import { acceptInviteRpc } from '../infrastructure/invite-queries'
import type { AcceptInviteResult } from '../domain/types'

/**
 * Server Action: acepta invite tras login.
 * El caller debe estar autenticado. El RPC valida email match contra auth.users.
 */
export async function acceptInviteAction(token: string): Promise<AcceptInviteResult> {
  const supabase = await createClient()
  return acceptInviteRpc(supabase, token)
}
