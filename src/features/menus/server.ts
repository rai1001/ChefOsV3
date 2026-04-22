import 'server-only'

/**
 * Contrato público server-only del módulo `menus`.
 * Reservado para helpers server-side que carguen menú + sections + recipes.
 *
 * Por ahora vacío: las páginas detalle usan hooks client (`@/features/menus`).
 * Cuando BEO server-side necesite cargar un menú completo, añadir aquí
 * `getMenuWithSectionsServer(hotelId, menuId)`.
 */

export {}
