'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hasPermission, useActiveHotel } from '@/features/identity'
import { createClient } from '@/lib/supabase/client'
import {
  addRecipeToSection,
  fetchSectionRecipes,
  removeRecipeFromSection,
  type AddRecipeToSectionInput,
} from '../infrastructure/section-queries'
import type { MenuSectionRecipe } from '../domain/types'

const key = (hotelId: string | undefined, sectionId: string | null | undefined) =>
  ['menus', 'section-recipes', hotelId, sectionId] as const

export function useSectionRecipes(
  hotelId: string | undefined,
  sectionId: string | null | undefined
) {
  return useQuery<MenuSectionRecipe[]>({
    queryKey: key(hotelId, sectionId),
    enabled: !!hotelId && !!sectionId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchSectionRecipes(supabase, hotelId!, sectionId!)
    },
  })
}

export function useAddRecipeToSection(hotelId: string | undefined) {
  const qc = useQueryClient()
  const activeHotel = useActiveHotel()
  return useMutation({
    mutationFn: async (input: AddRecipeToSectionInput) => {
      const role = activeHotel.data?.role
      if (!role || !hasPermission(role, 'menu.manage')) throw new Error('Sin permisos para gestionar menús')
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return addRecipeToSection(supabase, hotelId, input)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: key(hotelId, vars.section_id) }),
  })
}

export function useRemoveRecipeFromSection(
  hotelId: string | undefined,
  sectionId: string
) {
  const qc = useQueryClient()
  const activeHotel = useActiveHotel()
  return useMutation({
    mutationFn: async (sectionRecipeId: string) => {
      const role = activeHotel.data?.role
      if (!role || !hasPermission(role, 'menu.manage')) throw new Error('Sin permisos para gestionar menús')
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await removeRecipeFromSection(supabase, hotelId, sectionRecipeId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(hotelId, sectionId) }),
  })
}
