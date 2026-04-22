'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  addMenuSection,
  fetchMenuSections,
  removeMenuSection,
  updateMenuSection,
  type CreateMenuSectionInput,
} from '../infrastructure/section-queries'
import type { MenuSection } from '../domain/types'

const key = (hotelId: string | undefined, menuId: string | null | undefined) =>
  ['menus', 'sections', hotelId, menuId] as const

export function useMenuSections(
  hotelId: string | undefined,
  menuId: string | null | undefined
) {
  return useQuery<MenuSection[]>({
    queryKey: key(hotelId, menuId),
    enabled: !!hotelId && !!menuId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchMenuSections(supabase, hotelId!, menuId!)
    },
  })
}

export function useAddMenuSection(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateMenuSectionInput) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return addMenuSection(supabase, hotelId, input)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: key(hotelId, vars.menu_id) }),
  })
}

export function useUpdateMenuSection(hotelId: string | undefined, menuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sectionId,
      patch,
    }: {
      sectionId: string
      patch: { name?: string; sort_order?: number }
    }) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateMenuSection(supabase, hotelId, sectionId, patch)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(hotelId, menuId) }),
  })
}

export function useRemoveMenuSection(hotelId: string | undefined, menuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sectionId: string) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await removeMenuSection(supabase, hotelId, sectionId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(hotelId, menuId) }),
  })
}
