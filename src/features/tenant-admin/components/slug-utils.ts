/**
 * Convierte un nombre legible en un slug URL-safe.
 * Ej: "Hotel Plaza Mayor" → "hotel-plaza-mayor"
 */
export function toSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
