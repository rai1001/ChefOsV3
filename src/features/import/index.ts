/**
 * Contrato público del módulo `import` — 17º oficial (ADR-0013).
 *
 * Owner de migración bulk desde Excel/CSV. Sprint-03c cubre recipes.
 * Sprints futuros (catalog, inventory, etc.) reusarán esta infraestructura.
 *
 * **Regla de oro**: nada fuera de este módulo debe importar desde
 * `./domain`, `./application` o `./infrastructure` directamente.
 *
 * Server-only helpers viven en `@/features/import/server`.
 */

// ── Domain types ───────────────────────────────────────────────────
export type {
  ImportKind,
  ImportStatus,
  ImportRun,
  ImportFailure,
  ImportResult,
  ParsedRecipeRow,
  ParsedIngredientRow,
  ParsedRecipesPayload,
  RowValidationIssue,
  ValidationReport,
} from './domain/types'

export { IMPORT_KINDS, IMPORT_STATUSES } from './domain/types'

// ── Domain errors ──────────────────────────────────────────────────
export {
  ExcelParseError,
  MissingSheetError,
  EmptyImportError,
  ImportRunNotFoundError,
} from './domain/errors'

// ── Domain invariants (puro, safe en cliente y server) ─────────────
export {
  normalizeRecipeName,
  parseCsvField,
  cellToNumber,
  cellToString,
  findOrphanIngredientRecipes,
} from './domain/invariants'

// ── Application: parse + validate (ejecutables en cliente) ─────────
export { parseRecipesExcel, type ParseExcelOptions } from './application/parse-excel'
export { validatePayload } from './application/validate-payload'

// ── Application: client hooks ──────────────────────────────────────
export { useImportRecipes } from './application/use-import-recipes'
export { useImportRuns } from './application/use-import-runs'

// ── Components ──────────────────────────────────────────────────────
export { ImportRecipesForm } from './components/import-recipes-form'

// NOTE: schemas Zod (`./application/schemas.ts`) NO se re-exportan —
// se consumen dentro del módulo. Server helpers viven en `./server`.
