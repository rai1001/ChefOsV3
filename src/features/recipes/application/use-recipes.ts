'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchRecipes } from '../infrastructure/recipe-queries'
import type { Recipe, RecipesFilter } from '../domain/types'
import { parseCursor, type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useRecipes(
  hotelId: string | undefined,
  filter?: RecipesFilter,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Recipe>>({
    queryKey: ['recipes', hotelId, 'list', filter, pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRecipes(supabase, hotelId!, filter, pagination)
    },
  })
}

export function useRecipesInfinite(
  hotelId: string | undefined,
  filter?: RecipesFilter,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedResult<Recipe>>({
    queryKey: ['recipes', hotelId, 'list', 'infinite', filter, pageSize ?? null],
    enabled: !!hotelId,
    initialPageParam: '0',
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      return fetchRecipes(supabase, hotelId!, filter, {
        pageSize,
        offset: parseCursor(pageParam as string | null),
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
