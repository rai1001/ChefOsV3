'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchMenus } from '../infrastructure/menu-queries'
import type { Menu } from '../domain/types'
import { parseCursor, type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useMenus(
  hotelId: string | undefined,
  onlyActive = true,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Menu>>({
    queryKey: ['menus', hotelId, 'list', onlyActive, pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchMenus(supabase, hotelId!, onlyActive, pagination)
    },
  })
}

export function useMenusInfinite(
  hotelId: string | undefined,
  onlyActive = true,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedResult<Menu>>({
    queryKey: ['menus', hotelId, 'list', 'infinite', onlyActive, pageSize ?? null],
    enabled: !!hotelId,
    initialPageParam: '0',
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      return fetchMenus(supabase, hotelId!, onlyActive, {
        pageSize,
        offset: parseCursor(pageParam as string | null),
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
