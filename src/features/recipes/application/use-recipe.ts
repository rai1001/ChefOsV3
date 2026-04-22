'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchRecipe } from '../infrastructure/recipe-queries'
import type { Recipe } from '../domain/types'

export function useRecipe(hotelId: string | undefined, recipeId: string | null | undefined) {
  return useQuery<Recipe>({
    queryKey: ['recipes', 'detail', hotelId, recipeId],
    enabled: !!hotelId && !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRecipe(supabase, hotelId!, recipeId!)
    },
  })
}
