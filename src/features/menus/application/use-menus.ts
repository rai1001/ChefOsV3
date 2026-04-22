'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchMenus } from '../infrastructure/menu-queries'
import type { Menu } from '../domain/types'

export function useMenus(hotelId: string | undefined, onlyActive = true) {
  return useQuery<Menu[]>({
    queryKey: ['menus', 'list', hotelId, onlyActive],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchMenus(supabase, hotelId!, onlyActive)
    },
  })
}
