import { describe, expect, it } from 'vitest'
import {
  arrayBufferToBase64,
  getAnthropicDocumentBlockType,
  parseAnthropicOcrPayload,
} from '../../../../supabase/functions/v3-procurement-ocr-extract/ocr-helpers'

describe('Edge OCR helpers', () => {
  it('parsea JSON estricto aunque venga dentro de code fence', () => {
    const parsed = parseAnthropicOcrPayload(`\`\`\`json
{
  "header": { "supplier_name": "Proveedor", "total_amount": 12.5 },
  "lines": [
    { "description": "Patata", "quantity": 5, "unit": "kg", "unit_price": 2, "line_total": 10 }
  ]
}
\`\`\``)

    expect(parsed.lines[0]?.description).toBe('Patata')
  })

  it('rechaza payloads sin líneas extraídas', () => {
    expect(() =>
      parseAnthropicOcrPayload('{"header":{"supplier_name":"Proveedor"},"lines":[]}')
    ).toThrow('OCR_PAYLOAD_INVALID')
  })

  it('convierte ArrayBuffer a base64 sin APIs de Node', () => {
    const bytes = new Uint8Array([67, 104, 101, 102])

    expect(arrayBufferToBase64(bytes.buffer)).toBe('Q2hlZg==')
  })

  it('elige image para jpg/png y document para pdf', () => {
    expect(getAnthropicDocumentBlockType('application/pdf')).toBe('document')
    expect(getAnthropicDocumentBlockType('image/jpeg')).toBe('image')
    expect(getAnthropicDocumentBlockType('image/png')).toBe('image')
  })
})
