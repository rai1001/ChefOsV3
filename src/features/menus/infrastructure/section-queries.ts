import type { SupabaseClient } from '@supabase/supabase-js'
import type { MenuSection, MenuSectionRecipe } from '../domain/types'
import { RecipeAlreadyInSectionError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function fetchMenuSections(
  supabase: SupabaseClient,
  hotelId: string,
  menuId: string
): Promise<MenuSection[]> {
  const { data, error } = await supabase
    .from('menu_sections')
    .select('*')
    .eq('menu_id', menuId)
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'menu_section' })
  return (data as MenuSection[]) ?? []
}

export interface CreateMenuSectionInput {
  menu_id: string
  name: string
  sort_order: number
}

export async function addMenuSection(
  supabase: SupabaseClient,
  hotelId: string,
  input: CreateMenuSectionInput
): Promise<MenuSection> {
  const { data, error } = await supabase
    .from('menu_sections')
    .insert({
      hotel_id: hotelId,
      menu_id: input.menu_id,
      name: input.name,
      sort_order: input.sort_order,
    })
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'menu_section' })
  return data as MenuSection
}

export async function updateMenuSection(
  supabase: SupabaseClient,
  hotelId: string,
  sectionId: string,
  patch: { name?: string; sort_order?: number }
): Promise<MenuSection> {
  const { data, error } = await supabase
    .from('menu_sections')
    .update(patch)
    .eq('id', sectionId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'menu_section' })
  return data as MenuSection
}

export async function removeMenuSection(
  supabase: SupabaseClient,
  hotelId: string,
  sectionId: string
): Promise<void> {
  const { error } = await supabase
    .from('menu_sections')
    .delete()
    .eq('id', sectionId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'menu_section' })
}

// ─── Section-Recipes ──────────────────────────────────────────────────────────

export async function fetchSectionRecipes(
  supabase: SupabaseClient,
  hotelId: string,
  sectionId: string
): Promise<MenuSectionRecipe[]> {
  const { data, error } = await supabase
    .from('menu_section_recipes')
    .select('*')
    .eq('section_id', sectionId)
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'menu_section_recipe' })
  return (data as MenuSectionRecipe[]) ?? []
}

export interface AddRecipeToSectionInput {
  section_id: string
  recipe_id: string
  servings_override?: number | null
  price?: number | null
  sort_order: number
}

export async function addRecipeToSection(
  supabase: SupabaseClient,
  hotelId: string,
  input: AddRecipeToSectionInput
): Promise<MenuSectionRecipe> {
  const { data, error } = await supabase
    .from('menu_section_recipes')
    .insert({
      hotel_id: hotelId,
      section_id: input.section_id,
      recipe_id: input.recipe_id,
      servings_override: input.servings_override ?? null,
      price: input.price ?? null,
      sort_order: input.sort_order,
    })
    .select()
    .single()
  if (error) {
    // constraint unique(section_id, recipe_id) si existe
    const e = error as { code?: string }
    if (e?.code === '23505') {
      throw new RecipeAlreadyInSectionError(input.section_id, input.recipe_id)
    }
    throw mapSupabaseError(error, { resource: 'menu_section_recipe' })
  }
  return data as MenuSectionRecipe
}

export async function removeRecipeFromSection(
  supabase: SupabaseClient,
  hotelId: string,
  sectionRecipeId: string
): Promise<void> {
  const { error } = await supabase
    .from('menu_section_recipes')
    .delete()
    .eq('id', sectionRecipeId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'menu_section_recipe' })
}
