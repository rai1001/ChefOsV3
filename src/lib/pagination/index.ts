// Helpers de paginación para queries de lista.
// Cubre PERF-001 (Codex): todas las queries de lista deben tener `limit/range`
// para evitar traer cientos de miles de filas en una sola petición.
//
// Diseño: offset-based. Suficiente para datasets de hasta ~10k filas por hotel.
// Para datasets mayores, migrar a cursor real (timestamp+id) en sprint futuro.

export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 200

export interface PaginationParams {
  pageSize?: number
  offset?: number
}

export interface PaginatedResult<T> {
  rows: T[]
  nextCursor: string | null
  pageSize: number
}

// Asegura que pageSize esté en [1, MAX_PAGE_SIZE]. Default a DEFAULT_PAGE_SIZE.
export function clampPageSize(size: number | undefined): number {
  if (!size || size <= 0 || !Number.isFinite(size)) return DEFAULT_PAGE_SIZE
  return Math.min(Math.floor(size), MAX_PAGE_SIZE)
}

// Asegura que offset sea >= 0.
export function clampOffset(offset: number | undefined): number {
  if (!offset || offset < 0 || !Number.isFinite(offset)) return 0
  return Math.floor(offset)
}

// Calcula el rango [from, to] inclusivo para `supabase.range(from, to)`.
export function pageRange(params?: PaginationParams): {
  from: number
  to: number
  pageSize: number
} {
  const pageSize = clampPageSize(params?.pageSize)
  const offset = clampOffset(params?.offset)
  return { from: offset, to: offset + pageSize - 1, pageSize }
}

// Construye el resultado paginado a partir de las filas devueltas y el rango usado.
export function buildPaginatedResult<T>(
  rows: T[],
  pageSize: number,
  offset: number
): PaginatedResult<T> {
  return {
    rows,
    pageSize,
    nextCursor: rows.length === pageSize ? String(offset + pageSize) : null,
  }
}

// Parsea un cursor previamente devuelto. Devuelve 0 si es null/inválido.
export function parseCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0
  const parsed = Number.parseInt(cursor, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}
