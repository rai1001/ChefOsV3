'use client'

import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { scaleRecipe } from '../infrastructure/recipe-queries'

interface Args {
  recipeId: string
  newServings: number
}

export function useScaleRecipe(hotelId: string | undefined) {
  return useMutation({
    mutationFn: async ({ recipeId, newServings }: Args): Promise<unknown> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return scaleRecipe(supabase, hotelId, recipeId, newServings)
    },
  })
}
