import { z } from 'zod'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const nullableNumberSchema = z.number().nullable()
export const nullableStringSchema = z.string().nullable()

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')

export function toUtcStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}
