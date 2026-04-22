import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('combina clases sin duplicar', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('filtra falsy values', () => {
    expect(cn('p-2', false && 'hidden', null, undefined, 'text-sm')).toBe('p-2 text-sm')
  })

  it('fusiona clases Tailwind conflictivas con twMerge', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
