import type { MenuSection, MenuType } from './types'

export const MENU_TYPE_LABELS: Record<MenuType, string> = {
  buffet: 'Buffet',
  seated: 'Emplatado',
  cocktail: 'Cóctel',
  tasting: 'Degustación',
  daily: 'Diario',
}

/**
 * Ordena secciones por sort_order ascendente.
 */
export function sortSections<T extends Pick<MenuSection, 'sort_order'>>(
  sections: ReadonlyArray<T>
): T[] {
  return [...sections].sort((a, b) => a.sort_order - b.sort_order)
}

/**
 * Formatea precio para UI (EUR por defecto, respeta currency si se pasa).
 */
export function formatMenuPrice(price: number | null | undefined, currency = 'EUR'): string {
  if (price == null) return '—'
  return price.toLocaleString('es-ES', { style: 'currency', currency })
}

/**
 * Computa el siguiente sort_order disponible (para añadir sección nueva al final).
 */
export function nextSectionSortOrder(
  sections: ReadonlyArray<Pick<MenuSection, 'sort_order'>>
): number {
  if (sections.length === 0) return 0
  return Math.max(...sections.map((s) => s.sort_order)) + 1
}

/**
 * Agrega alérgenos de una lista de recetas (dedup + ordena).
 * Expone la misma lógica que recipes.mergeAllergens pero localizada al dominio menus.
 */
export function aggregateAllergens(recipes: ReadonlyArray<{ allergens: string[] }>): string[] {
  const set = new Set<string>()
  for (const r of recipes) {
    for (const a of r.allergens) set.add(a)
  }
  return Array.from(set).sort()
}
