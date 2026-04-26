import { describe, expect, it } from 'vitest'
import {
  buildOcrStoragePath,
  mapReviewedPayloadToReceiveGoodsLines,
  ocrExtractedPayloadSchema,
  ocrReviewedPayloadSchema,
} from './ocr'

const hotelId = '22222222-2222-2222-2222-222222222222'
const orderLineId = '88888888-8888-8888-8888-888888888888'
const sha256 = 'a'.repeat(64)

describe('ocrExtractedPayloadSchema', () => {
  it('acepta una extracción OCR con cabecera y líneas de factura', () => {
    const parsed = ocrExtractedPayloadSchema.parse({
      header: {
        supplier_name: 'Carniceria Eurostars',
        invoice_number: 'FAC-2026-001',
        invoice_date: '2026-04-26',
        total_amount: 42.75,
      },
      lines: [
        {
          description: 'Solomillo',
          quantity: 1.5,
          unit: 'kg',
          unit_price: 18.5,
          line_total: 27.75,
        },
      ],
    })

    expect(parsed.lines[0]?.description).toBe('Solomillo')
  })

  it('rechaza extracción sin líneas', () => {
    const result = ocrExtractedPayloadSchema.safeParse({
      header: { supplier_name: 'Proveedor' },
      lines: [],
    })

    expect(result.success).toBe(false)
  })
})

describe('ocrReviewedPayloadSchema', () => {
  it('exige purchase_order_line_id en cada línea revisada', () => {
    const result = ocrReviewedPayloadSchema.safeParse({
      header: { supplier_name: 'Proveedor' },
      lines: [
        {
          description: 'Solomillo',
          quantity_received: 1,
          unit_price: 18.5,
          quality_status: 'accepted',
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  it('exige rejection_reason cuando una línea revisada queda rechazada', () => {
    const result = ocrReviewedPayloadSchema.safeParse({
      header: { supplier_name: 'Proveedor' },
      lines: [
        {
          purchase_order_line_id: orderLineId,
          description: 'Solomillo',
          quantity_received: 0,
          unit_price: 18.5,
          quality_status: 'rejected',
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})

describe('OCR mappers', () => {
  it('construye storage_path estable desde hotel, sha256 y mime', () => {
    expect(
      buildOcrStoragePath({
        hotelId,
        sha256,
        mimeType: 'application/pdf',
      })
    ).toBe(`${hotelId}/${sha256}.pdf`)
  })

  it('mapea reviewed_payload a líneas compatibles con v3_receive_goods', () => {
    const payload = ocrReviewedPayloadSchema.parse({
      header: { supplier_name: 'Proveedor' },
      lines: [
        {
          purchase_order_line_id: orderLineId,
          description: 'Solomillo',
          quantity_received: 1.5,
          unit_price: 19,
          quality_status: 'accepted',
          lot_number: 'L-01',
        },
      ],
    })

    expect(mapReviewedPayloadToReceiveGoodsLines(payload)).toEqual([
      {
        purchase_order_line_id: orderLineId,
        quantity_received: 1.5,
        unit_price: 19,
        quality_status: 'accepted',
        rejection_reason: null,
        lot_number: 'L-01',
        expiry_date: null,
        notes: null,
      },
    ])
  })
})
