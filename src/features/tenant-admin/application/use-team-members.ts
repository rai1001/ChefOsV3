'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchTeamMembers } from '../infrastructure/team-queries'
import type { TeamMember } from '../domain/types'

export function useTeamMembers(hotelId: string | undefined) {
  return useQuery<TeamMember[]>({
    queryKey: ['tenant-admin', 'team', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchTeamMembers(supabase, hotelId!)
    },
  })
}
