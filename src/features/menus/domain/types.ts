// Dominio menus — 16º módulo oficial (ADR-0010).
// Schema v2 (Supabase compartido, ADR-0003): menus + menu_sections + menu_section_recipes.

export const MENU_TYPES = ['buffet', 'seated', 'cocktail', 'tasting', 'daily'] as const
export type MenuType = (typeof MENU_TYPES)[number]

export interface Menu {
  id: string
  hotel_id: string
  name: string
  description: string | null
  menu_type: MenuType
  is_template: boolean
  target_food_cost_pct: number | null
  total_cost: number
  notes: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface MenuSection {
  id: string
  menu_id: string
  hotel_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface MenuSectionRecipe {
  id: string
  section_id: string
  hotel_id: string
  recipe_id: string
  servings_override: number | null
  price: number | null
  sort_order: number
  created_at: string
}

/**
 * Menú con relaciones hidratadas (útil para detalle).
 */
export interface MenuWithSections extends Menu {
  sections: MenuSectionWithRecipes[]
}

export interface MenuSectionWithRecipes extends MenuSection {
  recipes: MenuSectionRecipe[]
}

/**
 * Alérgenos agregados a partir de todas las recetas del menú.
 */
export interface MenuAllergens {
  total: string[]
  by_section: Record<string, string[]>
}
