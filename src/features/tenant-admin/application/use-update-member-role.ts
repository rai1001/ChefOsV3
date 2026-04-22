'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { updateMemberRole } from '../infrastructure/team-queries'
import type { Role } from '@/features/identity'

interface Args {
  membershipId: string
  role: Role
}

export function useUpdateMemberRole(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ membershipId, role }: Args) => {
      const supabase = createClient()
      await updateMemberRole(supabase, membershipId, role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'team', hotelId] })
    },
  })
}
