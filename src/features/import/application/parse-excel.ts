// Parser Excel client-side. Lee un ArrayBuffer (typically de FileReader.result)
// y devuelve los rows estructurados antes de validación Zod.
//
// IMPORTANTE: usa exceljs dynamic import. No lo cargues en server bundles ni en
// hot paths que no sean la UI de import (~870KB minificado).

import type { ParsedRecipesPayload, ParsedIngredientRow, ParsedRecipeRow } from '../domain/types'
import { EmptyImportError, ExcelParseError, MissingSheetError } from '../domain/errors'
import { cellToNumber, cellToString, parseCsvField } from '../domain/invariants'

const SHEET_RECIPES = 'Recetas'
const SHEET_INGREDIENTS = 'Ingredientes'

// Mapeo de columnas (case-insensitive). Cada celda buscará primero el header
// canónico, después aliases comunes (sin acento, en inglés, etc).
const RECIPE_HEADER_ALIASES: Record<string, string[]> = {
  name: ['nombre', 'name', 'receta'],
  category: ['categoria', 'categoría', 'category'],
  servings: ['servings', 'pax', 'raciones', 'porciones'],
  description: ['descripcion', 'descripción', 'description'],
  subcategory: ['subcategoria', 'subcategoría', 'subcategory'],
  prep_time_min: ['tiempo_prep', 'prep_time', 'tiempo preparacion', 'tiempo de preparación'],
  cook_time_min: ['tiempo_coccion', 'cook_time', 'tiempo cocción', 'tiempo de cocción'],
  rest_time_min: ['tiempo_reposo', 'rest_time'],
  target_price: ['precio_objetivo', 'target_price', 'precio'],
  allergens: ['alergenos', 'alérgenos', 'allergens'],
  dietary_tags: ['tags', 'dietary_tags', 'etiquetas'],
  notes: ['notas', 'notes', 'observaciones'],
  difficulty: ['dificultad', 'difficulty'],
}

const INGREDIENT_HEADER_ALIASES: Record<string, string[]> = {
  recipe_name: ['receta_nombre', 'receta', 'recipe', 'recipe_name'],
  ingredient_name: ['ingrediente', 'ingredient', 'ingredient_name', 'nombre'],
  quantity_gross: ['cantidad_bruta', 'cantidad', 'quantity', 'quantity_gross'],
  unit: ['unidad', 'unit'],
  waste_pct: ['merma_pct', 'merma', 'waste_pct', 'waste'],
  unit_cost: ['coste_unitario', 'coste', 'unit_cost', 'precio'],
  preparation_notes: ['notas', 'preparation', 'preparation_notes'],
}

function normalizeHeader(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  return String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '_')
}

function buildColumnMap(
  rawHeaders: unknown[],
  aliasMap: Record<string, string[]>
): Record<string, number> {
  const result: Record<string, number> = {}
  const headerIndex = new Map<string, number>()
  rawHeaders.forEach((header, index) => {
    const normalized = normalizeHeader(header)
    if (!headerIndex.has(normalized)) {
      headerIndex.set(normalized, index)
    }
  })

  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    for (const candidate of [canonical, ...aliases]) {
      const idx = headerIndex.get(normalizeHeader(candidate))
      if (idx !== undefined) {
        result[canonical] = idx
        break
      }
    }
  }
  return result
}

function readCell(row: unknown[], colIdx: number | undefined): unknown {
  if (colIdx === undefined || colIdx < 0) return null
  return row[colIdx] ?? null
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface ParseExcelOptions {
  /** Inyecta un loader custom de exceljs para tests (default: dynamic import). */
  loadExcelJS?: () => Promise<typeof import('exceljs')>
}

export async function parseRecipesExcel(
  buffer: ArrayBuffer,
  options?: ParseExcelOptions
): Promise<ParsedRecipesPayload> {
  let ExcelJS
  try {
    ExcelJS = options?.loadExcelJS
      ? await options.loadExcelJS()
      : await import('exceljs')
  } catch (err) {
    throw new ExcelParseError('No se pudo cargar la librería ExcelJS', err)
  }

  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(buffer)
  } catch (err) {
    throw new ExcelParseError('El archivo no es un Excel válido (.xlsx)', err)
  }

  const recipesSheet = workbook.getWorksheet(SHEET_RECIPES)
  if (!recipesSheet) throw new MissingSheetError(SHEET_RECIPES)

  const ingredientsSheet = workbook.getWorksheet(SHEET_INGREDIENTS)
  if (!ingredientsSheet) throw new MissingSheetError(SHEET_INGREDIENTS)

  const recipes = parseRecipesSheet(recipesSheet)
  const ingredients = parseIngredientsSheet(ingredientsSheet)

  if (recipes.length === 0 && ingredients.length === 0) {
    throw new EmptyImportError()
  }

  return { recipes, ingredients }
}

// ─── Parse Recipes sheet ─────────────────────────────────────────────────────

function parseRecipesSheet(sheet: import('exceljs').Worksheet): ParsedRecipeRow[] {
  const rows = sheetToArray(sheet)
  if (rows.length < 1) return []

  const headers = rows[0] ?? []
  const cols = buildColumnMap(headers, RECIPE_HEADER_ALIASES)
  const out: ParsedRecipeRow[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((c) => c === null || c === '' || c === undefined)) continue

    const name = cellToString(readCell(row, cols.name))
    const category = cellToString(readCell(row, cols.category))
    const servingsRaw = readCell(row, cols.servings)
    const servings = cellToNumber(servingsRaw)

    if (!name && !category && servings === null) continue

    out.push({
      excel_row: i + 1,
      name: name ?? '',
      category: category ?? '',
      servings: servings === null ? 0 : Math.floor(servings),
      description: cellToString(readCell(row, cols.description)),
      subcategory: cellToString(readCell(row, cols.subcategory)),
      prep_time_min: integerOrNull(readCell(row, cols.prep_time_min)),
      cook_time_min: integerOrNull(readCell(row, cols.cook_time_min)),
      rest_time_min: integerOrNull(readCell(row, cols.rest_time_min)),
      target_price: cellToNumber(readCell(row, cols.target_price)),
      allergens: parseCsvField(cellToString(readCell(row, cols.allergens))),
      dietary_tags: parseCsvField(cellToString(readCell(row, cols.dietary_tags))),
      notes: cellToString(readCell(row, cols.notes)),
      difficulty: cellToString(readCell(row, cols.difficulty))?.toLowerCase() ?? null,
    })
  }
  return out
}

function parseIngredientsSheet(sheet: import('exceljs').Worksheet): ParsedIngredientRow[] {
  const rows = sheetToArray(sheet)
  if (rows.length < 1) return []

  const headers = rows[0] ?? []
  const cols = buildColumnMap(headers, INGREDIENT_HEADER_ALIASES)
  const out: ParsedIngredientRow[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((c) => c === null || c === '' || c === undefined)) continue

    const recipe_name = cellToString(readCell(row, cols.recipe_name))
    const ingredient_name = cellToString(readCell(row, cols.ingredient_name))
    const quantity_gross = cellToNumber(readCell(row, cols.quantity_gross)) ?? 0

    if (!recipe_name && !ingredient_name && !quantity_gross) continue

    out.push({
      excel_row: i + 1,
      recipe_name: recipe_name ?? '',
      ingredient_name: ingredient_name ?? '',
      quantity_gross,
      unit: cellToString(readCell(row, cols.unit)),
      waste_pct: cellToNumber(readCell(row, cols.waste_pct)) ?? 0,
      unit_cost: cellToNumber(readCell(row, cols.unit_cost)) ?? 0,
      preparation_notes: cellToString(readCell(row, cols.preparation_notes)),
    })
  }
  return out
}

function integerOrNull(raw: unknown): number | null {
  const n = cellToNumber(raw)
  if (n === null) return null
  return Math.floor(n)
}

// ExcelJS rows tienen forma `[null, c1, c2, c3]` (1-indexed). Normalizamos a 0-indexed.
function sheetToArray(sheet: import('exceljs').Worksheet): unknown[][] {
  const rows: unknown[][] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    // row.values puede ser sparse y 1-indexed según docs.
    const values = Array.isArray(row.values) ? row.values : []
    // Skip the leading null/undefined at index 0 (1-indexed convention).
    rows.push(values.slice(1).map((v) => unwrapCellValue(v)))
  })
  return rows
}

// Cells de fórmulas devuelven { formula, result }. Hyperlinks { text, hyperlink }.
function unwrapCellValue(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    if ('result' in v) return v.result ?? null
    if ('text' in v) return v.text ?? null
    if ('richText' in v && Array.isArray(v.richText)) {
      return v.richText.map((r) => (r as { text?: string }).text ?? '').join('')
    }
    if (v instanceof Date) return v.toISOString()
  }
  return value
}
