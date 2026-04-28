import { z } from 'zod'
import type { Database } from '@/types/database'
import { dateOnlySchema, emptyStringToNull, uuidString } from './shared'

export type ComplianceEquipmentType = Database['public']['Enums']['v3_compliance_equipment_type']
export type ComplianceFrequency = Database['public']['Enums']['v3_compliance_frequency']

export type ComplianceQualityCheck =
  Database['public']['Tables']['v3_compliance_quality_checks']['Row']
export type ComplianceEquipment =
  Database['public']['Tables']['v3_compliance_equipment']['Row']
export type ComplianceTemperatureLog =
  Database['public']['Tables']['v3_compliance_temperature_logs']['Row']
export type ComplianceCleaningArea =
  Database['public']['Tables']['v3_compliance_cleaning_areas']['Row']
export type ComplianceCleaningCheck =
  Database['public']['Tables']['v3_compliance_cleaning_checks']['Row']

export const COMPLIANCE_EQUIPMENT_TYPES = [
  'fridge',
  'freezer',
  'blast_chiller',
  'hot_holding',
] as const

export const COMPLIANCE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const

export const EQUIPMENT_TYPE_LABELS: Record<ComplianceEquipmentType, string> = {
  fridge: 'Cámara',
  freezer: 'Congelador',
  blast_chiller: 'Abatidor',
  hot_holding: 'Mantenimiento caliente',
}

export const FREQUENCY_LABELS: Record<ComplianceFrequency, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
}

const timestampSchema = z.string().min(1)

export const equipmentTypeSchema = z.enum(COMPLIANCE_EQUIPMENT_TYPES)
export const complianceFrequencySchema = z.enum(COMPLIANCE_FREQUENCIES)

export const qualityCheckSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  goods_receipt_id: uuidString(),
  temperature_c: z.number().nullable(),
  temperature_ok: z.boolean(),
  packaging_ok: z.boolean(),
  expiry_ok: z.boolean(),
  all_ok: z.boolean().nullable(),
  notes: z.string().nullable(),
  checked_by: uuidString(),
  checked_at: timestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
}) satisfies z.ZodType<ComplianceQualityCheck>

export const equipmentSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  warehouse_id: uuidString().nullable(),
  name: z.string().min(1),
  equipment_type: equipmentTypeSchema,
  location: z.string().nullable(),
  min_temperature_c: z.number(),
  max_temperature_c: z.number(),
  is_active: z.boolean(),
  created_by: uuidString().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
}) satisfies z.ZodType<ComplianceEquipment>

export const temperatureLogSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  equipment_id: uuidString(),
  measured_at: timestampSchema,
  measured_by: uuidString(),
  temperature_c: z.number(),
  min_temperature_c: z.number(),
  max_temperature_c: z.number(),
  in_range: z.boolean().nullable(),
  notes: z.string().nullable(),
  created_at: timestampSchema,
}) satisfies z.ZodType<ComplianceTemperatureLog>

export const cleaningAreaSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  name: z.string().min(1),
  frequency: complianceFrequencySchema,
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_by: uuidString().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
}) satisfies z.ZodType<ComplianceCleaningArea>

export const cleaningCheckSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  area_id: uuidString(),
  due_date: dateOnlySchema,
  completed_at: timestampSchema,
  completed_by: uuidString(),
  notes: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
}) satisfies z.ZodType<ComplianceCleaningCheck>

export const equipmentInputSchema = z.object({
  hotel_id: uuidString(),
  warehouse_id: uuidString().nullable().optional(),
  name: z.string().trim().min(1, 'Nombre obligatorio'),
  equipment_type: equipmentTypeSchema,
  location: z.string().optional().nullable().transform(emptyStringToNull),
  min_temperature_c: z.number(),
  max_temperature_c: z.number(),
  is_active: z.boolean().default(true),
}).refine((value) => value.min_temperature_c <= value.max_temperature_c, {
  path: ['max_temperature_c'],
  message: 'La temperatura máxima debe ser mayor o igual que la mínima',
})

export const cleaningAreaInputSchema = z.object({
  hotel_id: uuidString(),
  name: z.string().trim().min(1, 'Nombre obligatorio'),
  frequency: complianceFrequencySchema.default('daily'),
  description: z.string().optional().nullable().transform(emptyStringToNull),
  is_active: z.boolean().default(true),
})

export const qualityCheckInputSchema = z.object({
  hotel_id: uuidString(),
  goods_receipt_id: uuidString(),
  temperature_c: z.number().nullable().optional(),
  temperature_ok: z.boolean().default(true),
  packaging_ok: z.boolean().default(true),
  expiry_ok: z.boolean().default(true),
  notes: z.string().optional().nullable().transform(emptyStringToNull),
})

export const temperatureLogInputSchema = z.object({
  hotel_id: uuidString(),
  equipment_id: uuidString(),
  temperature_c: z.number(),
  measured_at: z.string().optional(),
  notes: z.string().optional().nullable().transform(emptyStringToNull),
})

export const cleaningCheckInputSchema = z.object({
  hotel_id: uuidString(),
  area_id: uuidString(),
  due_date: dateOnlySchema.optional(),
  notes: z.string().optional().nullable().transform(emptyStringToNull),
})

export const lotTraceInputSchema = z.object({
  hotel_id: uuidString(),
  lot_id: uuidString(),
})

export const qualityCheckRpcResultSchema = z.object({
  row: qualityCheckSchema,
})

export const temperatureLogRpcRowSchema = temperatureLogSchema.extend({
  equipment_name: z.string(),
  equipment_type: equipmentTypeSchema,
})

export const temperatureLogRpcResultSchema = z.object({
  row: temperatureLogRpcRowSchema,
})

export const cleaningCheckRpcResultSchema = z.object({
  row: cleaningCheckSchema,
  area_name: z.string(),
  frequency: complianceFrequencySchema,
})

export const overviewQualityFailedSchema = z.object({
  id: uuidString(),
  goods_receipt_id: uuidString(),
  checked_at: timestampSchema,
  temperature_ok: z.boolean(),
  packaging_ok: z.boolean(),
  expiry_ok: z.boolean(),
})

export const overviewTemperatureOutOfRangeSchema = z.object({
  id: uuidString(),
  equipment_id: uuidString(),
  equipment_name: z.string(),
  equipment_type: equipmentTypeSchema,
  temperature_c: z.number(),
  min_temperature_c: z.number(),
  max_temperature_c: z.number(),
  measured_at: timestampSchema,
})

export const overviewCleaningPendingSchema = z.object({
  area_id: uuidString(),
  area_name: z.string(),
  frequency: complianceFrequencySchema,
  due_date: dateOnlySchema,
})

export const complianceOverviewSchema = z.object({
  quality: z.object({
    pending_goods_receipts: z.number(),
    failed_checks_30d: z.number(),
    latest_failed: z.array(overviewQualityFailedSchema),
  }),
  temperature: z.object({
    equipment_active: z.number(),
    out_of_range_24h: z.number(),
    latest_out_of_range: z.array(overviewTemperatureOutOfRangeSchema),
  }),
  cleaning: z.object({
    areas_active: z.number(),
    completed_due: z.number(),
    pending_due: z.number(),
    pending: z.array(overviewCleaningPendingSchema),
  }),
})

export const traceLotSchema = z.object({
  lot: z.object({
    id: uuidString(),
    hotel_id: uuidString(),
    product_id: uuidString(),
    product_name: z.string(),
    category_id: uuidString().nullable(),
    quantity_received: z.number(),
    quantity_remaining: z.number(),
    unit_id: uuidString(),
    unit_name: z.string().nullable(),
    unit_abbreviation: z.string().nullable(),
    unit_cost: z.number(),
    received_at: timestampSchema,
    expires_at: timestampSchema.nullable(),
    is_preparation: z.boolean(),
    production_order_id: uuidString().nullable(),
    goods_receipt_line_id: uuidString().nullable(),
  }),
  goods_receipt: z.unknown().nullable(),
  purchase_order: z.unknown().nullable(),
  supplier: z.unknown().nullable(),
  production: z.unknown().nullable(),
  movements: z.array(z.object({
    id: uuidString(),
    kind: z.string(),
    quantity: z.number(),
    unit_cost: z.number().nullable(),
    total_cost: z.number().nullable(),
    origin: z.unknown().nullable(),
    notes: z.string().nullable(),
    created_at: timestampSchema,
  })),
  consumed_in_recipes: z.array(z.object({
    recipe_id: uuidString(),
    recipe_name: z.string(),
    production_order_id: uuidString().nullable(),
    movement_id: uuidString(),
    quantity: z.number(),
    total_cost: z.number().nullable(),
    consumed_at: timestampSchema,
  })),
})

export type EquipmentInput = z.input<typeof equipmentInputSchema>
export type CleaningAreaInput = z.input<typeof cleaningAreaInputSchema>
export type QualityCheckInput = z.input<typeof qualityCheckInputSchema>
export type TemperatureLogInput = z.input<typeof temperatureLogInputSchema>
export type CleaningCheckInput = z.input<typeof cleaningCheckInputSchema>
export type LotTraceInput = z.input<typeof lotTraceInputSchema>
export type QualityCheckRpcResult = z.infer<typeof qualityCheckRpcResultSchema>
export type TemperatureLogRpcResult = z.infer<typeof temperatureLogRpcResultSchema>
export type CleaningCheckRpcResult = z.infer<typeof cleaningCheckRpcResultSchema>
export type ComplianceOverview = z.infer<typeof complianceOverviewSchema>
export type TraceLotResult = z.infer<typeof traceLotSchema>
