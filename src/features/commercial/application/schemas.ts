import { z } from 'zod'
import { EVENT_STATUSES, EVENT_TYPES, SERVICE_TYPES, VIP_LEVELS } from '../domain/types'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato fecha inválido (YYYY-MM-DD)')
const timeHHMM = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato hora inválido (HH:MM)')

// ─── Events ───────────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(200, 'Nombre demasiado largo'),
  event_type: z.enum(EVENT_TYPES),
  service_type: z.enum(SERVICE_TYPES),
  event_date: isoDate,
  guest_count: z.coerce.number().int().min(1, 'Mínimo 1 invitado').max(10_000, 'Máximo 10 000'),
  client_id: z.string().uuid().optional().nullable(),
  start_time: timeHHMM.optional().nullable(),
  end_time: timeHHMM.optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  notes: z.string().max(2_000).optional().nullable(),
})

export const updateEventSchema = createEventSchema.partial()

export const transitionEventSchema = z.object({
  event_id: z.string().uuid(),
  new_status: z.enum(EVENT_STATUSES),
  reason: z.string().max(500).optional().nullable(),
})

// ─── Clients ──────────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(200),
  company: z.string().max(200).optional().nullable(),
  contact_person: z.string().max(200).optional().nullable(),
  email: z.string().email('Email no válido').optional().or(z.literal('')).nullable(),
  phone: z.string().max(50).optional().nullable(),
  tax_id: z.string().max(50).optional().nullable(),
  vip_level: z.enum(VIP_LEVELS).default('standard'),
  notes: z.string().max(2_000).optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  is_active: z.boolean().optional(),
})

// ─── Types inferidos ──────────────────────────────────────────────────────────

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type TransitionEventInput = z.infer<typeof transitionEventSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
