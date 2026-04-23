import { describe, expect, it } from 'vitest'
import { parseCommaSeparatedList } from './recipe-form-utils'

describe('parseCommaSeparatedList', () => {
  it('returns an empty array for null', () => {
    expect(parseCommaSeparatedList(null)).toEqual([])
  })

  it('returns an empty array for non-string values', () => {
    expect(parseCommaSeparatedList(new File(['x'], 'x.txt'))).toEqual([])
  })

  it('splits, trims and removes empty values', () => {
    expect(parseCommaSeparatedList(' gluten, dairy , , nuts  ')).toEqual([
      'gluten',
      'dairy',
      'nuts',
    ])
  })
})
