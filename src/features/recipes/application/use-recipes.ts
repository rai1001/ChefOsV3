'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchRecipes } from '../infrastructure/recipe-queries'
import type { Recipe, RecipesFilter } from '../domain/types'

export function useRecipes(hotelId: string | undefined, filter?: RecipesFilter) {
  return useQuery<Recipe[]>({
    queryKey: ['recipes', 'list', hotelId, filter],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRecipes(supabase, hotelId!, filter)
    },
  })
}
