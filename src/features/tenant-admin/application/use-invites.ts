'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchInvites } from '../infrastructure/invite-queries'
import type { Invite } from '../domain/types'

export function useInvites(hotelId: string | undefined, onlyPending = false) {
  return useQuery<Invite[]>({
    queryKey: ['tenant-admin', 'invites', hotelId, onlyPending],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchInvites(supabase, hotelId!, onlyPending)
    },
  })
}
