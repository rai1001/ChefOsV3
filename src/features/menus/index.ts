/**
 * Contrato público del módulo `menus` — 16º oficial (ADR-0010).
 *
 * Owner de composición comercial de menús: secciones, recetas en secciones,
 * alérgenos agregados, precios. Consume `@/features/recipes` por contrato público.
 */

// ── Types ──────────────────────────────────────────────────────────
export type {
  Menu,
  MenuSection,
  MenuSectionRecipe,
  MenuType,
  MenuWithSections,
  MenuSectionWithRecipes,
  MenuAllergens,
} from './domain/types'

export { MENU_TYPES } from './domain/types'

// ── Invariants ─────────────────────────────────────────────────────
export {
  MENU_TYPE_LABELS,
  sortSections,
  formatMenuPrice,
  nextSectionSortOrder,
  aggregateAllergens,
} from './domain/invariants'

// ── Errors ─────────────────────────────────────────────────────────
export {
  MenuNotFoundError,
  MenuSectionNotFoundError,
  RecipeAlreadyInSectionError,
} from './domain/errors'

// ── Application: client hooks ──────────────────────────────────────
export { useMenus, useMenusInfinite } from './application/use-menus'
export { useMenu } from './application/use-menu'
export { useCreateMenu, useUpdateMenu, useDeleteMenu } from './application/use-menu-mutations'
export {
  useMenuSections,
  useAddMenuSection,
  useUpdateMenuSection,
  useRemoveMenuSection,
} from './application/use-menu-sections'
export {
  useSectionRecipes,
  useAddRecipeToSection,
  useRemoveRecipeFromSection,
} from './application/use-section-recipes'
