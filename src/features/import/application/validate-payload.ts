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

import { ZodIssue } from 'zod'

function formatZodIssues(excelRow: number, issues: ZodIssue[]): RowValidationIssue[] {
  return issues.map((issue) => ({
    excel_row: excelRow,
    field: issue.path.join('.') || undefined,
    message: issue.message,
    severity: 'error',
  }))
}

export function validatePayload(payload: ParsedRecipesPayload): ValidationReport {
  const { recipeIssues, validRecipes } = validateRecipes(payload.recipes)
  const { ingredientIssues, validIngredients } = validateIngredients(payload.ingredients, validRecipes)

  return { recipeIssues, ingredientIssues, validRecipes, validIngredients }
}

function validateRecipes(recipes: ParsedRecipeRow[]) {
  const recipeIssues: RowValidationIssue[] = []
  const validRecipes: ParsedRecipeRow[] = []

  // ─── Validar recetas con Zod ─────────────────────────────────────────────
  // Detectar duplicados de nombre dentro del mismo Excel.
  const seenNames = new Map<string, number>() // normalized name → first excel_row
  for (const row of recipes) {
    const result = parsedRecipeRowSchema.safeParse(row)
    if (!result.success) {
      recipeIssues.push(...formatZodIssues(row.excel_row, result.error.issues))
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

  return { recipeIssues, validRecipes }
}

function validateIngredients(ingredients: ParsedIngredientRow[], validRecipes: ParsedRecipeRow[]) {
  const ingredientIssues: RowValidationIssue[] = []
  const validIngredients: ParsedIngredientRow[] = []

  // ─── Validar ingredientes con Zod ────────────────────────────────────────
  const validRecipeNames = validRecipes.map((r) => r.name)
  const orphans = findOrphanIngredientRecipes(
    validRecipeNames,
    ingredients.map((i) => i.recipe_name)
  )

  for (const row of ingredients) {
    const result = parsedIngredientRowSchema.safeParse(row)
    if (!result.success) {
      ingredientIssues.push(...formatZodIssues(row.excel_row, result.error.issues))
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

  return { ingredientIssues, validIngredients }
}
