'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ScaleRecipeLine } from '../domain/line'
import { scaleProductionRecipe } from '../infrastructure/production-rpcs'

export function useScaleRecipe(
  hotelId: string | undefined,
  recipeId: string | undefined,
  targetServings: number | undefined
) {
  return useQuery<ScaleRecipeLine[]>({
    queryKey: ['production', 'scale-recipe', hotelId, recipeId, targetServings ?? null],
    enabled: !!hotelId && !!recipeId && typeof targetServings === 'number' && targetServings > 0,
    queryFn: async () => {
      const supabase = createClient()
      return scaleProductionRecipe(supabase, hotelId!, recipeId!, targetServings!)
    },
  })
}
