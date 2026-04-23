import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

// V2 tiene product_categories? Pendiente de verificar con query a DB en runtime.
// Si no existe, este archivo se desactiva. Contrato mínimo para TS:

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
    .from('product_categories')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('name', { ascending: true })

  // Si la tabla no existe en v2, Supabase devuelve error code 42P01.
  // Tolerante: retorna [] para no romper UI hasta confirmar schema.
  if (error) {
    if ((error as { code?: string }).code === '42P01') return []
    throw mapSupabaseError(error, { resource: 'product_category' })
  }
  return (data as ProductCategoryRow[]) ?? []
}
