import { describe, expect, it } from 'vitest'
import {
  consolidatePurchaseRequestsInputSchema,
  createPurchaseRequestInputSchema,
  receiveGoodsSchema,
  transitionPurchaseOrderInputSchema,
  transitionPurchaseRequestInputSchema,
} from './schemas'

const hotelId = '22222222-2222-2222-2222-222222222222'
const eventId = '33333333-3333-3333-3333-333333333333'
const productId = '44444444-4444-4444-4444-444444444444'
const unitId = '55555555-5555-5555-5555-555555555555'
const requestId = '66666666-6666-6666-6666-666666666666'
const orderId = '77777777-7777-7777-7777-777777777777'
const orderLineId = '88888888-8888-8888-8888-888888888888'

describe('createPurchaseRequestInputSchema', () => {
  it('acepta una PR manual con una línea válida', () => {
    const parsed = createPurchaseRequestInputSchema.parse({
      hotel_id: hotelId,
      origin: 'manual',
      needed_date: '2026-05-01',
      lines: [
        {
          product_id: productId,
          quantity: 12.5,
          unit_id: unitId,
          department: 'economato',
        },
      ],
    })

    expect(parsed.lines).toHaveLength(1)
    expect(parsed.lines[0]?.quantity).toBe(12.5)
  })

  it('exige event_id cuando origin es event', () => {
    const result = createPurchaseRequestInputSchema.safeParse({
      hotel_id: hotelId,
      origin: 'event',
      needed_date: '2026-05-01',
      lines: [{ product_id: productId, quantity: 1 }],
    })

    expect(result.success).toBe(false)
  })

  it('rechaza PR sin líneas', () => {
    const result = createPurchaseRequestInputSchema.safeParse({
      hotel_id: hotelId,
      origin: 'manual',
      needed_date: '2026-05-01',
      lines: [],
    })

    expect(result.success).toBe(false)
  })
})

describe('transition schemas', () => {
  it('acepta transición PR con motivo opcional', () => {
    const parsed = transitionPurchaseRequestInputSchema.parse({
      hotel_id: hotelId,
      request_id: requestId,
      status: 'approved',
    })

    expect(parsed.status).toBe('approved')
  })

  it('acepta transición PO con motivo de cancelación', () => {
    const parsed = transitionPurchaseOrderInputSchema.parse({
      hotel_id: hotelId,
      order_id: orderId,
      status: 'cancelled',
      reason: 'Proveedor sin stock',
    })

    expect(parsed.reason).toBe('Proveedor sin stock')
  })
})

describe('consolidatePurchaseRequestsInputSchema', () => {
  it('exige al menos una PR', () => {
    const result = consolidatePurchaseRequestsInputSchema.safeParse({
      hotel_id: hotelId,
      request_ids: [],
    })

    expect(result.success).toBe(false)
  })

  it('acepta lista de PRs', () => {
    const parsed = consolidatePurchaseRequestsInputSchema.parse({
      hotel_id: hotelId,
      request_ids: [requestId, eventId],
    })

    expect(parsed.request_ids).toHaveLength(2)
  })
})

describe('receiveGoodsSchema', () => {
  it('acepta una recepción manual con línea accepted', () => {
    const parsed = receiveGoodsSchema.parse({
      hotel_id: hotelId,
      purchase_order_id: orderId,
      lines: [
        {
          purchase_order_line_id: orderLineId,
          quantity_received: 1.5,
          unit_price: 12.25,
          quality_status: 'accepted',
        },
      ],
    })

    expect(parsed.lines).toHaveLength(1)
    expect(parsed.lines[0]?.quality_status).toBe('accepted')
  })

  it('exige al menos una línea', () => {
    const result = receiveGoodsSchema.safeParse({
      hotel_id: hotelId,
      purchase_order_id: orderId,
      lines: [],
    })

    expect(result.success).toBe(false)
  })

  it('exige rejection_reason cuando quality_status es rejected', () => {
    const result = receiveGoodsSchema.safeParse({
      hotel_id: hotelId,
      purchase_order_id: orderId,
      lines: [
        {
          purchase_order_line_id: orderLineId,
          quantity_received: 0,
          unit_price: 12.25,
          quality_status: 'rejected',
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
