import { describe, expect, it } from 'vitest'
import {
  offerInputSchema,
  supplierConfigInputSchema,
  supplierInputSchema,
  suppliersFilterSchema,
} from './schemas'
import {
  filterSuppliersClient,
  formatCatalogPrice,
  groupOffersBySupplier,
  isOfferDateRangeValid,
  isOfferValidNow,
} from './invariants'
import type { CatalogPrice, Supplier, SupplierOffer } from './types'

const UUID = '00000000-0000-0000-0000-000000000000'
const UUID2 = '11111111-1111-1111-1111-111111111111'

// ─── Schemas ──────────────────────────────────────────────────────────────────

describe('supplierInputSchema', () => {
  it('acepta payload mínimo', () => {
    const res = supplierInputSchema.safeParse({
      hotel_id: UUID,
      name: 'Proveedor X',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.rating).toBe(0) // default
      expect(res.data.is_active).toBe(true)
      expect(res.data.delivery_days).toEqual([])
    }
  })

  it('rechaza nombre vacío', () => {
    const res = supplierInputSchema.safeParse({ hotel_id: UUID, name: '  ' })
    expect(res.success).toBe(false)
  })

  it('rechaza rating > 5', () => {
    const res = supplierInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      rating: 6,
    })
    expect(res.success).toBe(false)
  })

  it('rechaza email inválido', () => {
    const res = supplierInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      email: 'notanemail',
    })
    expect(res.success).toBe(false)
  })

  it('acepta email vacío string', () => {
    const res = supplierInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      email: '',
    })
    expect(res.success).toBe(true)
  })
})

describe('supplierConfigInputSchema', () => {
  it('acepta payload vacío de opciones', () => {
    const res = supplierConfigInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.delivery_days).toEqual([])
      expect(res.data.allows_urgent_delivery).toBe(false)
    }
  })

  it('rechaza cutoff_time inválido', () => {
    const res = supplierConfigInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      cutoff_time: '25:99',
    })
    expect(res.success).toBe(false)
  })

  it('acepta cutoff_time válido HH:MM', () => {
    const res = supplierConfigInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      cutoff_time: '14:30',
    })
    expect(res.success).toBe(true)
  })
})

describe('offerInputSchema', () => {
  it('acepta oferta válida', () => {
    const res = offerInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      product_id: UUID,
      unit_price: 12.5,
    })
    expect(res.success).toBe(true)
  })

  it('rechaza unit_price <= 0', () => {
    const res = offerInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      product_id: UUID,
      unit_price: 0,
    })
    expect(res.success).toBe(false)
  })

  it('rechaza valid_from con formato incorrecto', () => {
    const res = offerInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      product_id: UUID,
      unit_price: 10,
      valid_from: '01/01/2026',
    })
    expect(res.success).toBe(false)
  })

  it('acepta valid_from ISO', () => {
    const res = offerInputSchema.safeParse({
      hotel_id: UUID,
      supplier_id: UUID2,
      product_id: UUID,
      unit_price: 10,
      valid_from: '2026-04-23',
    })
    expect(res.success).toBe(true)
  })
})

describe('suppliersFilterSchema', () => {
  it('activeOnly default true', () => {
    const res = suppliersFilterSchema.safeParse({ hotelId: UUID })
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.activeOnly).toBe(true)
  })
})

// ─── Invariants ───────────────────────────────────────────────────────────────

describe('filterSuppliersClient', () => {
  const suppliers: Supplier[] = [
    {
      id: '1', hotel_id: 'h', name: 'Proveedor Alfa', contact_name: 'Juan',
      email: 'juan@alfa.com', phone: null, address: null, tax_id: 'A123',
      payment_terms: null, delivery_days: [], min_order_amount: null,
      rating: 4.5, notes: null, is_active: true,
      created_at: '', updated_at: '',
    },
    {
      id: '2', hotel_id: 'h', name: 'Beta Foods', contact_name: null,
      email: null, phone: null, address: null, tax_id: null,
      payment_terms: null, delivery_days: [], min_order_amount: null,
      rating: 3, notes: null, is_active: true,
      created_at: '', updated_at: '',
    },
  ]

  it('search vacío devuelve todos', () => {
    expect(filterSuppliersClient(suppliers, '')).toHaveLength(2)
  })

  it('match por nombre', () => {
    expect(filterSuppliersClient(suppliers, 'beta')).toHaveLength(1)
  })

  it('match por contacto', () => {
    expect(filterSuppliersClient(suppliers, 'juan')).toHaveLength(1)
  })

  it('match por tax_id', () => {
    expect(filterSuppliersClient(suppliers, 'a123')).toHaveLength(1)
  })
})

describe('isOfferValidNow', () => {
  const today = new Date('2026-04-23T10:00:00Z')

  it('oferta sin fechas siempre válida', () => {
    expect(isOfferValidNow({ valid_from: null, valid_to: null }, today)).toBe(true)
  })

  it('oferta dentro de rango válida', () => {
    expect(
      isOfferValidNow({ valid_from: '2026-04-01', valid_to: '2026-05-01' }, today)
    ).toBe(true)
  })

  it('oferta con valid_from futuro → inválida', () => {
    expect(
      isOfferValidNow({ valid_from: '2026-05-01', valid_to: null }, today)
    ).toBe(false)
  })

  it('oferta con valid_to pasado → inválida', () => {
    expect(
      isOfferValidNow({ valid_from: null, valid_to: '2026-04-01' }, today)
    ).toBe(false)
  })
})

describe('isOfferDateRangeValid', () => {
  it('ambas null válido', () => {
    expect(isOfferDateRangeValid(null, null)).toBe(true)
  })
  it('solo from válido', () => {
    expect(isOfferDateRangeValid('2026-04-01', null)).toBe(true)
  })
  it('from <= to válido', () => {
    expect(isOfferDateRangeValid('2026-04-01', '2026-05-01')).toBe(true)
  })
  it('from > to inválido', () => {
    expect(isOfferDateRangeValid('2026-05-01', '2026-04-01')).toBe(false)
  })
})

describe('formatCatalogPrice', () => {
  it('null price', () => {
    const cp: CatalogPrice = {
      product_id: 'p1', price: null, unit_id: null, supplier_id: null,
      offer_id: null, source: null, is_preferred: null, currency: 'EUR',
    }
    expect(formatCatalogPrice(cp)).toBe('Sin precio')
  })

  it('preferred', () => {
    const cp: CatalogPrice = {
      product_id: 'p1', price: 12.5, unit_id: 'u', supplier_id: 's',
      offer_id: 'o', source: 'offer_preferred', is_preferred: true, currency: 'EUR',
    }
    expect(formatCatalogPrice(cp)).toContain('preferida')
  })

  it('cheapest', () => {
    const cp: CatalogPrice = {
      product_id: 'p1', price: 10, unit_id: 'u', supplier_id: 's',
      offer_id: 'o', source: 'offer_cheapest', is_preferred: false, currency: 'EUR',
    }
    expect(formatCatalogPrice(cp)).toContain('más barata')
  })
})

describe('groupOffersBySupplier', () => {
  it('agrupa por supplier_id', () => {
    const offers = [
      { supplier_id: 's1' }, { supplier_id: 's1' }, { supplier_id: 's2' },
    ] as unknown as SupplierOffer[]
    const grouped = groupOffersBySupplier(offers)
    expect(grouped['s1']).toHaveLength(2)
    expect(grouped['s2']).toHaveLength(1)
  })

  it('vacío devuelve {}', () => {
    expect(groupOffersBySupplier([])).toEqual({})
  })
})
