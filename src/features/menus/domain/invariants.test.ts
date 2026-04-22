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
