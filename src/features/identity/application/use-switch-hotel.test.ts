import { describe, it, expect } from 'vitest'
import { shouldInvalidateHotelDependentQuery } from './use-switch-hotel'

describe('shouldInvalidateHotelDependentQuery', () => {
  const PREV_HOTEL_ID = '123e4567-e89b-12d3-a456-426614174000'
  const NEW_HOTEL_ID = '987fcdeb-51a2-43d7-9012-345678901234'
  const OTHER_HOTEL_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

  it('returns false for non-array keys', () => {
    expect(shouldInvalidateHotelDependentQuery('string-key', PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
    expect(shouldInvalidateHotelDependentQuery(null, PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
    expect(shouldInvalidateHotelDependentQuery({}, PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
  })

  it('returns false for empty array keys', () => {
    expect(shouldInvalidateHotelDependentQuery([], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
  })

  it('returns true for identity hotel-dependent keys', () => {
    expect(shouldInvalidateHotelDependentQuery(['active-hotel'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['user-hotels'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
  })

  it('returns true when the second segment matches prevHotelId or newHotelId', () => {
    expect(shouldInvalidateHotelDependentQuery(['some-module', PREV_HOTEL_ID], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['some-module', NEW_HOTEL_ID], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['some-module', PREV_HOTEL_ID, 'extra'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
  })

  it('returns false when the second segment is a UUID but does not match prev or new hotel ID', () => {
    expect(shouldInvalidateHotelDependentQuery(['some-module', OTHER_HOTEL_ID], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
  })

  it('returns false for global non-hotel-dependent queries', () => {
    expect(shouldInvalidateHotelDependentQuery(['session'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
    expect(shouldInvalidateHotelDependentQuery(['app-config'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
    expect(shouldInvalidateHotelDependentQuery(['current-user'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(false)
  })

  it('returns true for legacy hotel-scoped queries regardless of hotel ID', () => {
    expect(shouldInvalidateHotelDependentQuery(['recipes'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['menus', 'some-other-id'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['commercial'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
    expect(shouldInvalidateHotelDependentQuery(['tenant-admin'], PREV_HOTEL_ID, NEW_HOTEL_ID)).toBe(true)
  })
})
