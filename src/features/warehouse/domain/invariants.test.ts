import { describe, expect, it } from 'vitest'
import { canArchiveWarehouse } from './invariants'
import type { Warehouse } from './types'

const warehouse: Warehouse = {
  id: '22222222-2222-4222-8222-222222222222',
  hotel_id: '11111111-1111-4111-8111-111111111111',
  name: 'Economato seco',
  warehouse_type: 'dry',
  is_default: false,
  is_active: true,
  notes: null,
  created_at: '2026-04-28T10:00:00.000Z',
  updated_at: '2026-04-28T10:00:00.000Z',
}

describe('canArchiveWarehouse', () => {
  it('bloquea archivado del almacén default', () => {
    expect(canArchiveWarehouse({ ...warehouse, is_default: true }, 0)).toBe(false)
  })

  it('bloquea archivado si queda stock activo', () => {
    expect(canArchiveWarehouse(warehouse, 0.001)).toBe(false)
  })

  it('permite archivado de almacén no default sin stock', () => {
    expect(canArchiveWarehouse(warehouse, 0)).toBe(true)
  })
})
