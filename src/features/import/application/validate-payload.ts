// Aplica Zod + cross-validation a un ParsedRecipesPayload (post-parse cliente).
// Devuelve { validRecipes, validIngredients, recipeIssues, ingredientIssues } —
// suficiente para mostrar preview con counts y errores por fila.

import type {
  ParsedIngredientRow,
  ParsedRecipeRow,
  ParsedRecipesPayload,
  RowValidationIssue,
  ValidationReport,
} from '../domain/types'
import { findOrphanIngredientRecipes, normalizeRecipeName } from '../domain/invariants'
import { parsedIngredientRowSchema, parsedRecipeRowSchema } from './schemas'

export function validatePayload(payload: ParsedRecipesPayload): ValidationReport {
  const recipeIssues: RowValidationIssue[] = []
  const ingredientIssues: RowValidationIssue[] = []
  const validRecipes: ParsedRecipeRow[] = []
  const validIngredients: ParsedIngredientRow[] = []

  // ─── Validar recetas con Zod ─────────────────────────────────────────────
  // Detectar duplicados de nombre dentro del mismo Excel.
  const seenNames = new Map<string, number>() // normalized name → first excel_row
  for (const row of payload.recipes) {
    const result = parsedRecipeRowSchema.safeParse(row)
    if (!result.success) {
      for (const issue of result.error.issues) {
        recipeIssues.push({
          excel_row: row.excel_row,
          field: issue.path.join('.') || undefined,
          message: issue.message,
          severity: 'error',
        })
      }
      continue
    }
    const normalized = normalizeRecipeName(result.data.name)
    const seenAt = seenNames.get(normalized)
    if (seenAt !== undefined) {
      recipeIssues.push({
        excel_row: row.excel_row,
        field: 'name',
        message: `Nombre duplicado en el Excel (también en fila ${seenAt})`,
        severity: 'error',
      })
      continue
    }
    seenNames.set(normalized, row.excel_row)
    validRecipes.push(result.data as ParsedRecipeRow)
  }

  // ─── Validar ingredientes con Zod ────────────────────────────────────────
  const validRecipeNames = validRecipes.map((r) => r.name)
  const orphans = findOrphanIngredientRecipes(
    validRecipeNames,
    payload.ingredients.map((i) => i.recipe_name)
  )

  for (const row of payload.ingredients) {
    const result = parsedIngredientRowSchema.safeParse(row)
    if (!result.success) {
      for (const issue of result.error.issues) {
        ingredientIssues.push({
          excel_row: row.excel_row,
          field: issue.path.join('.') || undefined,
          message: issue.message,
          severity: 'error',
        })
      }
      continue
    }
    const normalized = normalizeRecipeName(result.data.recipe_name)
    if (orphans.has(normalized)) {
      ingredientIssues.push({
        excel_row: row.excel_row,
        field: 'recipe_name',
        message: `Receta "${result.data.recipe_name}" no existe en la hoja Recetas o falló validación`,
        severity: 'error',
      })
      continue
    }
    validIngredients.push(result.data as ParsedIngredientRow)
  }

  return { recipeIssues, ingredientIssues, validRecipes, validIngredients }
}
