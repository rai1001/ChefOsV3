import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type {
  Product,
  ProductsFilter,
} from '../domain/types'
import {
  ProductNotFoundError,
  ProductWrongHotelError,
} from '../domain/errors'
import type { ProductInput } from '../domain/schemas'

// ─── Lista / detalle ──────────────────────────────────────────────────────────

export async function fetchProducts(
  supabase: SupabaseClient,
  filter: ProductsFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<Product>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('products')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('name', { ascending: true })
    .range(from, to)

  if (filter.activeOnly !== false) {
    query = query.eq('is_active', true)
  }
  if (filter.categoryId !== undefined && filter.categoryId !== null) {
    query = query.eq('category_id', filter.categoryId)
  }
  if (filter.search) {
    query = query.ilike('name', `%${filter.search}%`)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'product' })
  return buildPaginatedResult((data as Product[]) ?? [], pageSize, from)
}

export async function fetchProduct(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'product' })
  if (!data) throw new ProductNotFoundError(productId)
  return data as Product
}

// ─── Mutaciones ───────────────────────────────────────────────────────────────

export async function createProduct(
  supabase: SupabaseClient,
  input: ProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      hotel_id: input.hotel_id,
      category_id: input.category_id ?? null,
      name: input.name.trim(),
      description: input.description ?? null,
      sku: input.sku ?? null,
      default_unit_id: input.default_unit_id ?? null,
      min_stock: input.min_stock ?? null,
      max_stock: input.max_stock ?? null,
      reorder_point: input.reorder_point ?? null,
      allergens: input.allergens,
      storage_type: input.storage_type,
      shelf_life_days: input.shelf_life_days ?? null,
      is_active: input.is_active,
    })
    .select('*')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'product' })
  return data as Product
}

export interface UpdateProductInput extends Partial<Omit<ProductInput, 'hotel_id'>> {
  id: string
  hotel_id: string
}

export async function updateProduct(
  supabase: SupabaseClient,
  input: UpdateProductInput
): Promise<Product> {
  const { id, hotel_id, ...rest } = input
  const patch: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) patch[k] = v
  }

  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .eq('hotel_id', hotel_id)
    .select('*')
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'product' })
  if (!data) throw new ProductWrongHotelError(id, hotel_id)
  return data as Product
}

export async function archiveProduct(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'product' })
}

export async function restoreProduct(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: true })
    .eq('id', productId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'product' })
}
