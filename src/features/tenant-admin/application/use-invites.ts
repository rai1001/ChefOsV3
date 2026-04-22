'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchInvites } from '../infrastructure/invite-queries'
import type { Invite } from '../domain/types'
import { parseCursor, type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useInvites(
  hotelId: string | undefined,
  onlyPending = false,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Invite>>({
    queryKey: ['tenant-admin', 'invites', hotelId, onlyPending, pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchInvites(supabase, hotelId!, onlyPending, pagination)
    },
  })
}

export function useInvitesInfinite(
  hotelId: string | undefined,
  onlyPending = false,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedResult<Invite>>({
    queryKey: ['tenant-admin', 'invites', hotelId, 'infinite', onlyPending, pageSize ?? null],
    enabled: !!hotelId,
    initialPageParam: '0',
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      return fetchInvites(supabase, hotelId!, onlyPending, {
        pageSize,
        offset: parseCursor(pageParam as string | null),
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
