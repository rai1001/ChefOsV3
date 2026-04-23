// Tipos del módulo `import` (17º oficial, ADR-0013).
// Owner de migración bulk desde Excel/CSV. Sprint-03c cubre recipes.

export const IMPORT_KINDS = ['recipes'] as const
export type ImportKind = (typeof IMPORT_KINDS)[number]

export const IMPORT_STATUSES = ['pending', 'running', 'completed', 'partial', 'failed'] as const
export type ImportStatus = (typeof IMPORT_STATUSES)[number]

export interface ImportFailure {
  kind: 'recipe' | 'ingredient'
  row_index: number
  name: string
  error: string
}

export interface ImportRun {
  id: string
  hotel_id: string
  kind: ImportKind
  status: ImportStatus
  total_rows: number
  ok_rows: number
  failed_rows: number
  errors: ImportFailure[]
  created_by: string
  started_at: string
  finished_at: string | null
}

// ─── Recetas: rows parseados ─────────────────────────────────────────────────

export interface ParsedRecipeRow {
  /** 1-based, fila tal como aparece en Excel (incluye header). */
  excel_row: number
  name: string
  category: string
  servings: number
  description?: string | null
  subcategory?: string | null
  prep_time_min?: number | null
  cook_time_min?: number | null
  rest_time_min?: number | null
  target_price?: number | null
  allergens: string[]
  dietary_tags: string[]
  notes?: string | null
  difficulty?: string | null
}

export interface ParsedIngredientRow {
  excel_row: number
  recipe_name: string
  ingredient_name: string
  quantity_gross: number
  unit?: string | null
  waste_pct: number
  unit_cost: number
  preparation_notes?: string | null
}

export interface ParsedRecipesPayload {
  recipes: ParsedRecipeRow[]
  ingredients: ParsedIngredientRow[]
}

// ─── Validation result (cliente) ─────────────────────────────────────────────

export interface RowValidationIssue {
  excel_row: number
  field?: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationReport {
  recipeIssues: RowValidationIssue[]
  ingredientIssues: RowValidationIssue[]
  /** Recipes válidas (pasaron Zod + cross-validation). */
  validRecipes: ParsedRecipeRow[]
  /** Ingredientes cuyo recipe_name matchea una recipe válida. */
  validIngredients: ParsedIngredientRow[]
}

// ─── Resultado del RPC ───────────────────────────────────────────────────────

export interface ImportResult {
  run_id: string
  ok_count: number
  failed_count: number
  failed: ImportFailure[]
}
