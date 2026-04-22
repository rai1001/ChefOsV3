import { describe, it, expect } from 'vitest'
import { ROLE_TO_PROFILE, uxProfileFromRole, hasRole, isActiveMembership } from './invariants'
import { ROLES, type Role } from './types'

describe('uxProfileFromRole', () => {
  it('head_chef → cocina', () => {
    expect(uxProfileFromRole('head_chef')).toBe('cocina')
  })

  it('admin → oficina', () => {
    expect(uxProfileFromRole('admin')).toBe('oficina')
  })

  it('procurement → compras', () => {
    expect(uxProfileFromRole('procurement')).toBe('compras')
  })

  it('commercial → comercial', () => {
    expect(uxProfileFromRole('commercial')).toBe('comercial')
  })

  it('todos los roles tienen perfil asignado', () => {
    ROLES.forEach((role) => {
      expect(ROLE_TO_PROFILE[role]).toBeDefined()
    })
  })
})

describe('hasRole', () => {
  it('devuelve true si el rol está en la lista permitida', () => {
    expect(hasRole('admin', ['superadmin', 'direction', 'admin'])).toBe(true)
  })

  it('devuelve false si el rol NO está en la lista permitida', () => {
    expect(hasRole('cook', ['superadmin', 'direction', 'admin'])).toBe(false)
  })

  it('acepta lista vacía → siempre false', () => {
    const empty: readonly Role[] = []
    expect(hasRole('superadmin', empty)).toBe(false)
  })
})

describe('isActiveMembership', () => {
  it('membership con is_active=true → true', () => {
    expect(isActiveMembership({ is_active: true })).toBe(true)
  })

  it('membership con is_active=false → false', () => {
    expect(isActiveMembership({ is_active: false })).toBe(false)
  })
})
