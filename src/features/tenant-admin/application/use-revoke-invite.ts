'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { revokeInvite } from '../infrastructure/invite-queries'

export function useRevokeInvite(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const supabase = createClient()
      await revokeInvite(supabase, inviteId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'invites', hotelId] })
    },
  })
}
