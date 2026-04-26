export type SupportedOcrMimeType = 'application/pdf' | 'image/jpeg' | 'image/png'

export interface AnthropicOcrHeader {
  supplier_name?: string | null
  invoice_number?: string | null
  invoice_date?: string | null
  total_amount?: number | null
  currency?: string | null
}

export interface AnthropicOcrLine {
  description: string
  quantity: number
  unit?: string | null
  unit_price: number
  line_total?: number | null
  confidence?: number | null
}

export interface AnthropicOcrPayload {
  header: AnthropicOcrHeader
  lines: AnthropicOcrLine[]
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  return btoa(binary)
}

export function getAnthropicDocumentBlockType(
  mimeType: SupportedOcrMimeType
): 'document' | 'image' {
  return mimeType === 'application/pdf' ? 'document' : 'image'
}

export function parseAnthropicOcrPayload(text: string): AnthropicOcrPayload {
  const raw = extractJsonText(text)
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error('OCR_PAYLOAD_INVALID: JSON_PARSE_FAILED', { cause: error })
  }

  return assertAnthropicOcrPayload(parsed)
}

function extractJsonText(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced?.[1]) return fenced[1].trim()

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

function assertAnthropicOcrPayload(value: unknown): AnthropicOcrPayload {
  if (!isRecord(value)) {
    throw new Error('OCR_PAYLOAD_INVALID: ROOT_NOT_OBJECT')
  }

  const header = value.header
  const lines = value.lines

  if (!isRecord(header)) {
    throw new Error('OCR_PAYLOAD_INVALID: HEADER_NOT_OBJECT')
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('OCR_PAYLOAD_INVALID: LINES_REQUIRED')
  }

  return {
    header: normalizeHeader(header),
    lines: lines.map(normalizeLine),
  }
}

function normalizeHeader(header: Record<string, unknown>): AnthropicOcrHeader {
  return {
    supplier_name: optionalString(header.supplier_name),
    invoice_number: optionalString(header.invoice_number),
    invoice_date: optionalString(header.invoice_date),
    total_amount: optionalNonNegativeNumber(header.total_amount),
    currency: optionalString(header.currency),
  }
}

function normalizeLine(value: unknown): AnthropicOcrLine {
  if (!isRecord(value)) {
    throw new Error('OCR_PAYLOAD_INVALID: LINE_NOT_OBJECT')
  }

  const description = requiredString(value.description, 'description')
  const quantity = requiredNonNegativeNumber(value.quantity, 'quantity')
  const unitPrice = requiredNonNegativeNumber(value.unit_price, 'unit_price')

  return {
    description,
    quantity,
    unit: optionalString(value.unit),
    unit_price: unitPrice,
    line_total: optionalNonNegativeNumber(value.line_total),
    confidence: optionalConfidence(value.confidence),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`OCR_PAYLOAD_INVALID: ${field.toUpperCase()}_REQUIRED`)
  }
  return value.trim()
}

function optionalNonNegativeNumber(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return value
}

function requiredNonNegativeNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`OCR_PAYLOAD_INVALID: ${field.toUpperCase()}_INVALID`)
  }
  return value
}

function optionalConfidence(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    return null
  }
  return value
}
