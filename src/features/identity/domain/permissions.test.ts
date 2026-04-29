import { describe, it, expect } from 'vitest'
import { hasPermission, PERMISSIONS, type Permission } from './permissions'

describe('hasPermission', () => {
  it('admin puede hotel.manage', () => {
    expect(hasPermission('admin', 'hotel.manage')).toBe(true)
  })

  it('cook NO puede hotel.manage', () => {
    expect(hasPermission('cook', 'hotel.manage')).toBe(false)
  })

  it('head_chef puede recipe.approve', () => {
    expect(hasPermission('head_chef', 'recipe.approve')).toBe(true)
  })

  it('sous_chef NO puede recipe.approve', () => {
    expect(hasPermission('sous_chef', 'recipe.approve')).toBe(false)
  })

  it('warehouse puede inventory.adjust', () => {
    expect(hasPermission('warehouse', 'inventory.adjust')).toBe(true)
  })

  it('commercial NO puede procurement.create', () => {
    expect(hasPermission('commercial', 'procurement.create')).toBe(false)
  })

  it('sous_chef NO puede menu.manage', () => {
    expect(hasPermission('sous_chef', 'menu.manage')).toBe(false)
  })
})

describe('PERMISSIONS matrix integrity', () => {
  it('todos los permisos tienen al menos un rol asignado', () => {
    ;(Object.keys(PERMISSIONS) as Permission[]).forEach((permission) => {
      expect(PERMISSIONS[permission].length).toBeGreaterThan(0)
    })
  })

  it('superadmin tiene acceso a los permisos críticos admin-level', () => {
    const adminLevel: Permission[] = [
      'hotel.manage',
      'team.manage',
      'event.cancel',
      'procurement.approve',
      'dashboard.view',
    ]
    adminLevel.forEach((p) => {
      expect(hasPermission('superadmin', p)).toBe(true)
    })
  })
})
