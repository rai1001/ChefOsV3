// Reglas puras del dominio `import` (sprint-03c).

/**
 * Normaliza el nombre de receta para usar como FK case-insensitive.
 * trim + lowercase + colapsa espacios internos múltiples.
 */
export function normalizeRecipeName(name: string | null | undefined): string {
  if (!name) return ''
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Parsea un campo CSV (alérgenos, tags) de Excel.
 * "gluten, lactosa,frutos_secos" → ['gluten', 'lactosa', 'frutos_secos'].
 * Tolera separador ; o , y espacios extra. Filtra vacíos y duplicados.
 */
export function parseCsvField(raw: string | null | undefined): string[] {
  if (!raw) return []
  const items = String(raw)
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
  return Array.from(new Set(items))
}

/**
 * Convierte un valor de celda Excel (string|number|null|Date) a número.
 * Devuelve null si no es convertible.
 */
export function cellToNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    // Acepta "12,5" (formato europeo) y "12.5".
    const normalized = raw.trim().replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/**
 * Convierte una celda Excel a string trimmed. Vacío/null → null.
 */
export function cellToString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  return s.length > 0 ? s : null
}

/**
 * Verifica que cada ingredient.recipe_name matchea al menos una recipe.name.
 * Devuelve el set de recipe_names normalizados que NO matchean.
 */
export function findOrphanIngredientRecipes(
  recipeNames: readonly string[],
  ingredientRecipeNames: readonly string[]
): Set<string> {
  const validSet = new Set(recipeNames.map(normalizeRecipeName))
  const orphans = new Set<string>()
  for (const name of ingredientRecipeNames) {
    const normalized = normalizeRecipeName(name)
    if (normalized && !validSet.has(normalized)) {
      orphans.add(normalized)
    }
  }
  return orphans
}
