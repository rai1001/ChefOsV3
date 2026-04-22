import type { Role } from './types'

/**
 * Matriz de permisos oficiales.
 *
 * Fuente de verdad: `.ai/specs/permissions-matrix.md`.
 * UI guard usa `hasPermission`; el backend aplica la misma matriz vía RLS + RPCs.
 *
 * Cambiar una entrada requiere ADR en `.ai/specs/decisions-log.md`.
 */
export const PERMISSIONS = {
  // Identity & admin
  'hotel.manage': ['superadmin', 'direction', 'admin'],
  'team.manage': ['superadmin', 'direction', 'admin'],

  // Commercial
  'event.create': ['commercial', 'direction', 'admin', 'superadmin'],
  'event.confirm': ['commercial', 'direction', 'admin', 'superadmin'],
  'event.cancel': ['direction', 'admin', 'superadmin'],

  // Recipes
  'recipe.create': ['head_chef', 'sous_chef', 'cook', 'direction', 'admin', 'superadmin'],
  'recipe.approve': ['head_chef', 'direction', 'admin', 'superadmin'],

  // Catalog
  'catalog.manage': ['procurement', 'head_chef', 'direction', 'admin', 'superadmin'],

  // Procurement
  'procurement.create': ['procurement', 'head_chef', 'direction', 'admin', 'superadmin'],
  'procurement.approve': ['direction', 'admin', 'superadmin'],

  // Inventory
  'inventory.manage': [
    'procurement',
    'warehouse',
    'head_chef',
    'direction',
    'admin',
    'superadmin',
  ],
  'inventory.adjust': ['warehouse', 'direction', 'admin', 'superadmin'],

  // Production
  'production.manage': ['head_chef', 'sous_chef', 'direction', 'admin', 'superadmin'],
  'production.execute': ['head_chef', 'sous_chef', 'cook'],

  // Compliance
  'compliance.manage': ['head_chef', 'direction', 'admin', 'superadmin'],

  // Task management
  'task.manage': [
    'head_chef',
    'sous_chef',
    'room',
    'reception',
    'direction',
    'admin',
    'superadmin',
  ],

  // Dashboards & reports
  'dashboard.view': ['direction', 'admin', 'superadmin'],
  'reports.view': ['direction', 'admin', 'head_chef', 'superadmin'],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role)
}
