import { describe, expect, it } from 'vitest'
import {
  buildPaginatedResult,
  clampOffset,
  clampPageSize,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  pageRange,
  parseCursor,
} from './index'

describe('clampPageSize', () => {
  it('uses default when undefined', () => {
    expect(clampPageSize(undefined)).toBe(DEFAULT_PAGE_SIZE)
  })

  it('uses default when zero or negative', () => {
    expect(clampPageSize(0)).toBe(DEFAULT_PAGE_SIZE)
    expect(clampPageSize(-10)).toBe(DEFAULT_PAGE_SIZE)
  })

  it('uses default when NaN or Infinity', () => {
    expect(clampPageSize(NaN)).toBe(DEFAULT_PAGE_SIZE)
    expect(clampPageSize(Infinity)).toBe(DEFAULT_PAGE_SIZE)
  })

  it('caps at MAX_PAGE_SIZE', () => {
    expect(clampPageSize(MAX_PAGE_SIZE + 1)).toBe(MAX_PAGE_SIZE)
    expect(clampPageSize(10000)).toBe(MAX_PAGE_SIZE)
  })

  it('passes through valid sizes', () => {
    expect(clampPageSize(25)).toBe(25)
    expect(clampPageSize(MAX_PAGE_SIZE)).toBe(MAX_PAGE_SIZE)
  })

  it('floors fractional sizes', () => {
    expect(clampPageSize(25.7)).toBe(25)
  })
})

describe('clampOffset', () => {
  it('defaults to 0', () => {
    expect(clampOffset(undefined)).toBe(0)
    expect(clampOffset(0)).toBe(0)
  })

  it('rejects negatives', () => {
    expect(clampOffset(-5)).toBe(0)
  })

  it('passes through valid offsets', () => {
    expect(clampOffset(50)).toBe(50)
  })

  it('floors fractionals', () => {
    expect(clampOffset(50.7)).toBe(50)
  })
})

describe('pageRange', () => {
  it('returns 0..49 for default page', () => {
    expect(pageRange()).toEqual({ from: 0, to: 49, pageSize: 50 })
  })

  it('respects custom pageSize', () => {
    expect(pageRange({ pageSize: 10 })).toEqual({ from: 0, to: 9, pageSize: 10 })
  })

  it('respects offset', () => {
    expect(pageRange({ pageSize: 25, offset: 50 })).toEqual({ from: 50, to: 74, pageSize: 25 })
  })

  it('clamps oversized pageSize', () => {
    expect(pageRange({ pageSize: 999 })).toEqual({ from: 0, to: MAX_PAGE_SIZE - 1, pageSize: MAX_PAGE_SIZE })
  })
})

describe('buildPaginatedResult', () => {
  it('exposes rows and pageSize', () => {
    const rows = [1, 2, 3]
    const result = buildPaginatedResult(rows, 10, 0)
    expect(result.rows).toBe(rows)
    expect(result.pageSize).toBe(10)
  })

  it('returns nextCursor when rows fill the page', () => {
    const rows = Array(10).fill(0)
    expect(buildPaginatedResult(rows, 10, 0).nextCursor).toBe('10')
    expect(buildPaginatedResult(rows, 10, 50).nextCursor).toBe('60')
  })

  it('returns null cursor when rows partial-fill the page', () => {
    const rows = Array(7).fill(0)
    expect(buildPaginatedResult(rows, 10, 0).nextCursor).toBeNull()
  })

  it('returns null cursor when no rows', () => {
    expect(buildPaginatedResult([], 10, 0).nextCursor).toBeNull()
  })
})

describe('parseCursor', () => {
  it('returns 0 for null/undefined/empty', () => {
    expect(parseCursor(null)).toBe(0)
    expect(parseCursor(undefined)).toBe(0)
    expect(parseCursor('')).toBe(0)
  })

  it('parses valid integer strings', () => {
    expect(parseCursor('50')).toBe(50)
    expect(parseCursor('1000')).toBe(1000)
  })

  it('rejects non-numeric strings', () => {
    expect(parseCursor('abc')).toBe(0)
  })

  it('rejects negatives', () => {
    expect(parseCursor('-5')).toBe(0)
  })
})
