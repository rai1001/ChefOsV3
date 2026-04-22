'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchMenu } from '../infrastructure/menu-queries'
import type { Menu } from '../domain/types'

export function useMenu(hotelId: string | undefined, menuId: string | null | undefined) {
  return useQuery<Menu>({
    queryKey: ['menus', 'detail', hotelId, menuId],
    enabled: !!hotelId && !!menuId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchMenu(supabase, hotelId!, menuId!)
    },
  })
}
