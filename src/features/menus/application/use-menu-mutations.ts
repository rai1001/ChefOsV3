'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createMenu,
  deleteMenu,
  updateMenu,
  type CreateMenuInput,
  type UpdateMenuInput,
} from '../infrastructure/menu-queries'
import type { Menu } from '../domain/types'

export function useCreateMenu(hotelId: string | undefined, userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateMenuInput): Promise<Menu> => {
      if (!hotelId || !userId) throw new Error('hotelId y userId requeridos')
      const supabase = createClient()
      return createMenu(supabase, hotelId, userId, input)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'list'] }),
  })
}

export function useUpdateMenu(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuId, input }: { menuId: string; input: UpdateMenuInput }) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateMenu(supabase, hotelId, menuId, input)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['menus', 'list'] })
      qc.invalidateQueries({ queryKey: ['menus', 'detail', hotelId, vars.menuId] })
    },
  })
}

export function useDeleteMenu(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (menuId: string) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await deleteMenu(supabase, hotelId, menuId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', 'list'] }),
  })
}
