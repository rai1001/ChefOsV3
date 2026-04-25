import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

// v3_product_categories existe como tabla mínima por ADR-0015.
// El fallback 42P01 solo cubre bases locales parcialmente migradas.

export interface ProductCategoryRow {
  id: string
  hotel_id: string
  name: string
  [key: string]: unknown
}

export async function fetchCategories(
  supabase: SupabaseClient,
  hotelId: string
): Promise<ProductCategoryRow[]> {
  const { data, error } = await supabase
    .from('v3_product_categories')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('name', { ascending: true })

  // Si la tabla no existe en una DB local incompleta, Supabase devuelve error code 42P01.
  // Tolerante: retorna [] para no romper UI hasta confirmar schema.
  if (error) {
    if ((error as { code?: string }).code === '42P01') return []
    throw mapSupabaseError(error, { resource: 'product_category' })
  }
  return (data as ProductCategoryRow[]) ?? []
}
