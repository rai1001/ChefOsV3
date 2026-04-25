import { describe, it, expect } from 'vitest'
import {
  aggregateAllergens,
  formatMenuPrice,
  MENU_TYPE_LABELS,
  nextSectionSortOrder,
  sortSections,
} from './invariants'
import { MENU_TYPES } from './types'

describe('sortSections', () => {
  it('ordena ascendente por sort_order', () => {
    const arr = [{ sort_order: 2 }, { sort_order: 0 }, { sort_order: 1 }]
    expect(sortSections(arr).map((s) => s.sort_order)).toEqual([0, 1, 2])
  })

  it('lista vacía → []', () => {
    expect(sortSections([])).toEqual([])
  })

  it('un solo elemento → mismo array', () => {
    const arr = [{ sort_order: 1 }]
    expect(sortSections(arr)).toEqual([{ sort_order: 1 }])
  })

  it('estabilidad (mantiene orden relativo con igual sort_order)', () => {
    const arr = [
      { id: 'a', sort_order: 1 },
      { id: 'b', sort_order: 0 },
      { id: 'c', sort_order: 1 },
    ]
    const result = sortSections(arr)
    expect(result).toEqual([
      { id: 'b', sort_order: 0 },
      { id: 'a', sort_order: 1 },
      { id: 'c', sort_order: 1 },
    ])
  })

  it('maneja sort_order negativos y decimales', () => {
    const arr = [{ sort_order: 1.5 }, { sort_order: -1 }, { sort_order: 0 }]
    expect(sortSections(arr).map((s) => s.sort_order)).toEqual([-1, 0, 1.5])
  })

  it('inmutable (no muta input)', () => {
    const arr = [{ sort_order: 2 }, { sort_order: 0 }]
    const out = sortSections(arr)
    expect(arr[0]?.sort_order).toBe(2)
    expect(out[0]?.sort_order).toBe(0)
  })
})

describe('formatMenuPrice', () => {
  it('null → "—"', () => {
    expect(formatMenuPrice(null)).toBe('—')
    expect(formatMenuPrice(undefined)).toBe('—')
  })
  it('formato EUR por defecto', () => {
    expect(formatMenuPrice(42)).toMatch(/42/)
    expect(formatMenuPrice(42)).toMatch(/€/)
  })
})

describe('nextSectionSortOrder', () => {
  it('lista vacía → 0', () => {
    expect(nextSectionSortOrder([])).toBe(0)
  })
  it('lista con valores → max+1', () => {
    expect(nextSectionSortOrder([{ sort_order: 0 }, { sort_order: 3 }, { sort_order: 1 }])).toBe(4)
  })
})

describe('aggregateAllergens', () => {
  it('dedup + sort', () => {
    const rs = [
      { allergens: ['gluten', 'dairy'] },
      { allergens: ['dairy', 'nuts'] },
    ]
    expect(aggregateAllergens(rs)).toEqual(['dairy', 'gluten', 'nuts'])
  })
  it('vacío → []', () => {
    expect(aggregateAllergens([])).toEqual([])
  })
})

describe('MENU_TYPE_LABELS', () => {
  it('cubre todos los tipos', () => {
    MENU_TYPES.forEach((t) => {
      expect(MENU_TYPE_LABELS[t]).toBeDefined()
    })
  })
})
