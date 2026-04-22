'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { fetchClients } from '../infrastructure/client-queries'
import type { Client } from '../domain/types'
import { parseCursor, type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useClients(
  hotelId: string | undefined,
  onlyActive = true,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Client>>({
    queryKey: ['commercial', hotelId, 'clients', onlyActive, pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createSupabase()
      return fetchClients(supabase, hotelId!, onlyActive, pagination)
    },
  })
}

export function useClientsInfinite(
  hotelId: string | undefined,
  onlyActive = true,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedResult<Client>>({
    queryKey: ['commercial', hotelId, 'clients', 'infinite', onlyActive, pageSize ?? null],
    enabled: !!hotelId,
    initialPageParam: '0',
    queryFn: async ({ pageParam }) => {
      const supabase = createSupabase()
      return fetchClients(supabase, hotelId!, onlyActive, {
        pageSize,
        offset: parseCursor(pageParam as string | null),
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
