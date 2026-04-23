// Schemas Zod del módulo catalog — sprint-04a.
// Validación de inputs antes de tocar Supabase.

import { z } from 'zod'
import {
  ALIAS_SOURCE_TYPES,
  PRODUCT_STORAGE_TYPES,
  UNIT_TYPES,
} from './types'

// Zod 4 `.uuid()` aplica RFC 4122 estricto (version + variant bits).
// Rechaza UUIDs demo/test (ej. 22222222-2222-2222-2222-222222222222) que
// Postgres acepta sin problema. Usamos regex laxo que valida formato canónico
// 8-4-4-4-12 hex sin imponer version/variant — consistente con Postgres uuid.
const UUID_LOOSE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

// ─── Unidades de medida (v2 per-hotel) ────────────────────────────────────────

export const unitOfMeasureSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  name: z.string().min(1).max(64),
  abbreviation: z.string().min(1).max(16),
  unit_type: z.enum(UNIT_TYPES),
  conversion_factor: z.number().positive(),
  base_unit_id: uuidString().nullable(),
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
  id: uuidString(),
  hotel_id: uuidString(),
  category_id: uuidString().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  sku: z.string().max(64).nullable(),
  default_unit_id: uuidString().nullable(),
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
  hotel_id: uuidString(),
  category_id: uuidString().nullable().optional(),
  name: z.string().trim().min(1, 'Nombre requerido').max(200),
  description: z.string().max(2000).nullable().optional(),
  sku: z.string().max(64).nullable().optional(),
  default_unit_id: uuidString().nullable().optional(),
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
  id: uuidString(),
  hotel_id: uuidString(),
  product_id: uuidString(),
  alias_name: z.string().min(1).max(200),
  source_type: z.enum(ALIAS_SOURCE_TYPES),
  confidence_score: z.number().min(0).max(1),
  created_at: z.string(),
})

export const aliasInputSchema = z.object({
  hotel_id: uuidString(),
  product_id: uuidString(),
  alias_name: z.string().trim().min(1, 'Alias requerido').max(200),
  source_type: z.enum(ALIAS_SOURCE_TYPES).default('manual'),
  confidence_score: z.number().min(0).max(1).default(1.0),
})

export type AliasInput = z.infer<typeof aliasInputSchema>

// ─── Mapping bulk ─────────────────────────────────────────────────────────────

export const mappingEntrySchema = z.object({
  recipe_id: uuidString(),
  ingredient_name: z.string().trim().min(1),
  product_id: uuidString().nullable(),
  unit_id: uuidString().nullable(),
})

export const mappingPayloadSchema = z.object({
  mappings: z.array(mappingEntrySchema).min(1).max(500),
})

export type MappingPayload = z.infer<typeof mappingPayloadSchema>

// ─── Filtros listado productos ────────────────────────────────────────────────

export const productsFilterSchema = z.object({
  hotelId: uuidString(),
  search: z.string().trim().max(200).optional(),
  categoryId: uuidString().nullable().optional(),
  activeOnly: z.boolean().default(true),
})

// ─── Sprint-04b: Suppliers + Offers ───────────────────────────────────────────

export const supplierInputSchema = z.object({
  hotel_id: uuidString(),
  name: z.string().trim().min(1, 'Nombre requerido').max(200),
  contact_name: z.string().max(200).nullable().optional(),
  email: z.string().email('Email inválido').max(255).nullable().optional().or(z.literal('')),
  phone: z.string().max(64).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  tax_id: z.string().max(64).nullable().optional(),
  payment_terms: z.string().max(200).nullable().optional(),
  delivery_days: z.array(z.string()).default([]),
  min_order_amount: z.number().nonnegative().nullable().optional(),
  rating: z.number().min(0).max(5).default(0),
  notes: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().default(true),
})

export type SupplierInput = z.infer<typeof supplierInputSchema>

export const supplierConfigInputSchema = z.object({
  hotel_id: uuidString(),
  supplier_id: uuidString(),
  delivery_days: z.array(z.string()).default([]),
  cutoff_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'HH:MM').nullable().optional(),
  lead_time_hours: z.number().int().positive().nullable().optional(),
  min_order_amount: z.number().nonnegative().nullable().optional(),
  min_order_units: z.number().nonnegative().nullable().optional(),
  reception_window_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'HH:MM').nullable().optional(),
  reception_window_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'HH:MM').nullable().optional(),
  allows_urgent_delivery: z.boolean().default(false),
})

export type SupplierConfigInput = z.infer<typeof supplierConfigInputSchema>

export const offerInputSchema = z.object({
  hotel_id: uuidString(),
  supplier_id: uuidString(),
  product_id: uuidString(),
  unit_id: uuidString().nullable().optional(),
  unit_price: z.number().positive('Precio debe ser > 0'),
  min_quantity: z.number().positive().nullable().optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').nullable().optional(),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').nullable().optional(),
  is_preferred: z.boolean().default(false),
  sku_supplier: z.string().max(64).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

export type OfferInput = z.infer<typeof offerInputSchema>

export const suppliersFilterSchema = z.object({
  hotelId: uuidString(),
  search: z.string().trim().max(200).optional(),
  activeOnly: z.boolean().default(true),
})
