import type { SupabaseClient } from '@supabase/supabase-js'
import type { Menu, MenuType } from '../domain/types'
import { MenuNotFoundError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

export async function fetchMenus(
  supabase: SupabaseClient,
  hotelId: string,
  onlyActive = true,
  pagination?: PaginationParams
): Promise<PaginatedResult<Menu>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_menus')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (onlyActive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'menu' })
  return buildPaginatedResult((data as Menu[]) ?? [], pageSize, from)
}

export async function fetchMenu(
  supabase: SupabaseClient,
  hotelId: string,
  menuId: string
): Promise<Menu> {
  const { data, error } = await supabase
    .from('v3_menus')
    .select('*')
    .eq('id', menuId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'menu' })
  if (!data) throw new MenuNotFoundError(menuId)
  return data as Menu
}

export interface CreateMenuInput {
  name: string
  menu_type: MenuType
  description?: string | null
  target_food_cost_pct?: number | null
  notes?: string | null
  is_template?: boolean
}

export async function createMenu(
  supabase: SupabaseClient,
  hotelId: string,
  userId: string,
  input: CreateMenuInput
): Promise<Menu> {
  const { data, error } = await supabase
    .from('v3_menus')
    .insert({
      hotel_id: hotelId,
      name: input.name,
      menu_type: input.menu_type,
      description: input.description ?? null,
      target_food_cost_pct: input.target_food_cost_pct ?? null,
      notes: input.notes ?? null,
      is_template: input.is_template ?? false,
      is_active: true,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'menu' })
  return data as Menu
}

export interface UpdateMenuInput extends Partial<CreateMenuInput> {
  is_active?: boolean
}

export async function updateMenu(
  supabase: SupabaseClient,
  hotelId: string,
  menuId: string,
  input: UpdateMenuInput
): Promise<Menu> {
  const { data, error } = await supabase
    .from('v3_menus')
    .update(input)
    .eq('id', menuId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'menu' })
  return data as Menu
}

export async function deleteMenu(
  supabase: SupabaseClient,
  hotelId: string,
  menuId: string
): Promise<void> {
  // Soft delete: is_active=false. Preserva referencias históricas (eventos que usaron el menú).
  const { error } = await supabase
    .from('v3_menus')
    .update({ is_active: false })
    .eq('id', menuId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'menu' })
}
