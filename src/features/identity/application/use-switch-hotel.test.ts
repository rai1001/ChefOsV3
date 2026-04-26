import { describe, it, expect } from 'vitest'
import { shouldInvalidateHotelQuery } from './use-switch-hotel'

describe('shouldInvalidateHotelQuery', () => {
  const prevHotelId = '11111111-1111-1111-1111-111111111111'
  const newHotelId = '22222222-2222-2222-2222-222222222222'
  const otherHotelId = '33333333-3333-3333-3333-333333333333'

  it('should return false for empty keys', () => {
    expect(shouldInvalidateHotelQuery([], prevHotelId, newHotelId)).toBe(false)
  })

  it('should return true for IDENTITY_HOTEL_DEPENDENT_KEYS', () => {
    expect(shouldInvalidateHotelQuery(['active-hotel'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['user-hotels'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['active-hotel', 'extra'], prevHotelId, newHotelId)).toBe(true)
  })

  it('should return true when second element is a UUID matching prevHotelId', () => {
    expect(shouldInvalidateHotelQuery(['any-module', prevHotelId], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['any-module', prevHotelId, 'details'], prevHotelId, newHotelId)).toBe(true)
  })

  it('should return true when second element is a UUID matching newHotelId', () => {
    expect(shouldInvalidateHotelQuery(['any-module', newHotelId], prevHotelId, newHotelId)).toBe(true)
  })

  it('should return false when second element is a UUID but does not match prev or new hotelId', () => {
    expect(shouldInvalidateHotelQuery(['any-module', otherHotelId], prevHotelId, newHotelId)).toBe(false)
  })

  it('should return true for LEGACY_HOTEL_SCOPED_MODULES', () => {
    expect(shouldInvalidateHotelQuery(['recipes'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['menus'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['commercial'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['tenant-admin'], prevHotelId, newHotelId)).toBe(true)
    expect(shouldInvalidateHotelQuery(['recipes', 'list'], prevHotelId, newHotelId)).toBe(true)
  })

  it('should return false for other modules and non-matching conditions', () => {
    expect(shouldInvalidateHotelQuery(['other-module'], prevHotelId, newHotelId)).toBe(false)
    expect(shouldInvalidateHotelQuery(['app-config'], prevHotelId, newHotelId)).toBe(false)
    expect(shouldInvalidateHotelQuery(['session'], prevHotelId, newHotelId)).toBe(false)
  })
})
