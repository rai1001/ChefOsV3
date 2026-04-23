'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchCategories,
  type ProductCategoryRow,
} from '../infrastructure/category-queries'

export function useProductCategories(hotelId: string | undefined) {
  return useQuery<ProductCategoryRow[]>({
    queryKey: ['catalog', 'categories', 'list', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchCategories(supabase, hotelId!)
    },
    staleTime: 60_000,
  })
}
