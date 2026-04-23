import { describe, expect, it } from 'vitest'
import {
  cellToNumber,
  cellToString,
  findOrphanIngredientRecipes,
  normalizeRecipeName,
  parseCsvField,
} from './invariants'

describe('normalizeRecipeName', () => {
  it('trims, lowercases and collapses whitespace', () => {
    expect(normalizeRecipeName('  Pollo  Asado   ')).toBe('pollo asado')
  })

  it('returns empty string for null/undefined', () => {
    expect(normalizeRecipeName(null)).toBe('')
    expect(normalizeRecipeName(undefined)).toBe('')
  })

  it('idempotent', () => {
    const once = normalizeRecipeName('Bacalao  Skrei')
    expect(normalizeRecipeName(once)).toBe(once)
  })
})

describe('parseCsvField', () => {
  it('splits by comma and trims', () => {
    expect(parseCsvField('gluten, lactosa, frutos_secos')).toEqual([
      'gluten',
      'lactosa',
      'frutos_secos',
    ])
  })

  it('accepts semicolon separator', () => {
    expect(parseCsvField('vegano;sin_gluten')).toEqual(['vegano', 'sin_gluten'])
  })

  it('lowercases', () => {
    expect(parseCsvField('Gluten, LACTOSA')).toEqual(['gluten', 'lactosa'])
  })

  it('removes duplicates', () => {
    expect(parseCsvField('gluten, gluten, lactosa')).toEqual(['gluten', 'lactosa'])
  })

  it('filters empty entries', () => {
    expect(parseCsvField('gluten,, ,lactosa')).toEqual(['gluten', 'lactosa'])
  })

  it('returns [] for null/undefined/empty', () => {
    expect(parseCsvField(null)).toEqual([])
    expect(parseCsvField(undefined)).toEqual([])
    expect(parseCsvField('')).toEqual([])
  })
})

describe('cellToNumber', () => {
  it('returns native numbers as-is', () => {
    expect(cellToNumber(42)).toBe(42)
    expect(cellToNumber(3.14)).toBe(3.14)
  })

  it('parses string numbers', () => {
    expect(cellToNumber('42')).toBe(42)
    expect(cellToNumber('3.14')).toBe(3.14)
  })

  it('handles European comma decimal', () => {
    expect(cellToNumber('12,5')).toBe(12.5)
  })

  it('returns null for invalid', () => {
    expect(cellToNumber(null)).toBeNull()
    expect(cellToNumber(undefined)).toBeNull()
    expect(cellToNumber('')).toBeNull()
    expect(cellToNumber('abc')).toBeNull()
    expect(cellToNumber(NaN)).toBeNull()
    expect(cellToNumber(Infinity)).toBeNull()
  })
})

describe('cellToString', () => {
  it('returns trimmed strings', () => {
    expect(cellToString('  hello  ')).toBe('hello')
  })

  it('returns null for empty/null', () => {
    expect(cellToString(null)).toBeNull()
    expect(cellToString(undefined)).toBeNull()
    expect(cellToString('')).toBeNull()
    expect(cellToString('   ')).toBeNull()
  })

  it('coerces numbers to string', () => {
    expect(cellToString(42)).toBe('42')
  })
})

describe('findOrphanIngredientRecipes', () => {
  it('returns empty when all match', () => {
    const orphans = findOrphanIngredientRecipes(['Pollo', 'Bacalao'], ['Pollo', 'Bacalao', 'Pollo'])
    expect(orphans.size).toBe(0)
  })

  it('finds orphans (case-insensitive)', () => {
    const orphans = findOrphanIngredientRecipes(
      ['Pollo Asado'],
      ['pollo asado', 'Tortilla', 'POLLO  ASADO']
    )
    expect(orphans).toEqual(new Set(['tortilla']))
  })

  it('skips empty ingredient names', () => {
    const orphans = findOrphanIngredientRecipes(['Pollo'], ['', '   ', null as unknown as string])
    expect(orphans.size).toBe(0)
  })
})
