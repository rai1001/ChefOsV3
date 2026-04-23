import { describe, expect, it } from 'vitest'
import { toSlug } from './slug-utils'

describe('toSlug', () => {
  it('normalizes case, accents and spaces', () => {
    expect(toSlug(' Hotel Plaza MÁyor ')).toBe('hotel-plaza-mayor')
  })

  it('removes unsupported characters and trims dashes', () => {
    expect(toSlug('***Hotel__Sol!!!')).toBe('hotel-sol')
  })

  it('limits slug length to 48 characters', () => {
    expect(toSlug('a'.repeat(80))).toHaveLength(48)
  })
})
