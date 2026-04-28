import { z } from 'zod'
export { uuidString } from '@/lib/zod/uuid-string'

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')

export function toUtcStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayDateOnly(now = new Date()): string {
  return formatDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())))
}

export function emptyStringToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed : null
}

