// Schemas Zod del módulo catalog — sprint-04a.
// Validación de inputs antes de tocar Supabase.

import { z } from 'zod'
import {
  ALIAS_SOURCE_TYPES,
  PRODUCT_STORAGE_TYPES,
  UNIT_TYPES,
} from './types'

// ─── Unidades de medida (v2 per-hotel) ────────────────────────────────────────

export const unitOfMeasureSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  name: z.string().min(1).max(64),
  abbreviation: z.string().min(1).max(16),
  unit_type: z.enum(UNIT_TYPES),
  conversion_factor: z.number().positive(),
  base_unit_id: z.string().uuid().nullable(),
  is_default: z.boolean(),
  created_at: z.string(),
})

// ─── Productos ────────────────────────────────────────────────────────────────

// allergens en v2 es jsonb. Aceptamos array de strings para uso normal,
// pero tolerante a JSON libre (algunas filas v2 pueden venir como objeto).
export const allergensSchema = z
  .union([z.array(z.string()), z.record(z.string(), z.unknown())])
  .default([])

export const productSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  sku: z.string().max(64).nullable(),
  default_unit_id: z.string().uuid().nullable(),
  min_stock: z.number().nullable(),
  max_stock: z.number().nullable(),
  reorder_point: z.number().nullable(),
  allergens: allergensSchema,
  storage_type: z.enum(PRODUCT_STORAGE_TYPES),
  shelf_life_days: z.number().int().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Input para crear/editar producto desde UI.
export const productInputSchema = z.object({
  hotel_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1, 'Nombre requerido').max(200),
  description: z.string().max(2000).nullable().optional(),
  sku: z.string().max(64).nullable().optional(),
  default_unit_id: z.string().uuid().nullable().optional(),
  min_stock: z.number().nonnegative().nullable().optional(),
  max_stock: z.number().nonnegative().nullable().optional(),
  reorder_point: z.number().nonnegative().nullable().optional(),
  allergens: z.array(z.string()).default([]),
  storage_type: z.enum(PRODUCT_STORAGE_TYPES).default('ambient'),
  shelf_life_days: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productInputSchema>

// ─── Aliases ──────────────────────────────────────────────────────────────────

export const aliasSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  product_id: z.string().uuid(),
  alias_name: z.string().min(1).max(200),
  source_type: z.enum(ALIAS_SOURCE_TYPES),
  confidence_score: z.number().min(0).max(1),
  created_at: z.string(),
})

export const aliasInputSchema = z.object({
  hotel_id: z.string().uuid(),
  product_id: z.string().uuid(),
  alias_name: z.string().trim().min(1, 'Alias requerido').max(200),
  source_type: z.enum(ALIAS_SOURCE_TYPES).default('manual'),
  confidence_score: z.number().min(0).max(1).default(1.0),
})

export type AliasInput = z.infer<typeof aliasInputSchema>

// ─── Mapping bulk ─────────────────────────────────────────────────────────────

export const mappingEntrySchema = z.object({
  recipe_id: z.string().uuid(),
  ingredient_name: z.string().trim().min(1),
  product_id: z.string().uuid().nullable(),
  unit_id: z.string().uuid().nullable(),
})

export const mappingPayloadSchema = z.object({
  mappings: z.array(mappingEntrySchema).min(1).max(500),
})

export type MappingPayload = z.infer<typeof mappingPayloadSchema>

// ─── Filtros listado productos ────────────────────────────────────────────────

export const productsFilterSchema = z.object({
  hotelId: z.string().uuid(),
  search: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  activeOnly: z.boolean().default(true),
})
