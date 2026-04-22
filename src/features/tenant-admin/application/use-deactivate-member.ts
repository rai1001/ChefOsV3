'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { deactivateMember, reactivateMember } from '../infrastructure/team-queries'

export function useDeactivateMember(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (membershipId: string) => {
      const supabase = createClient()
      await deactivateMember(supabase, membershipId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'team', hotelId] })
    },
  })
}

export function useReactivateMember(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (membershipId: string) => {
      const supabase = createClient()
      await reactivateMember(supabase, membershipId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'team', hotelId] })
    },
  })
}
