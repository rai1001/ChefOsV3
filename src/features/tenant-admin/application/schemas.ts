import { z } from 'zod'
import { ROLES } from '@/features/identity'
import { COMMON_CURRENCIES, COMMON_TIMEZONES } from '../domain/types'

const slugRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export const createTenantWithHotelSchema = z.object({
  tenant_name: z.string().min(2, 'Nombre del grupo requerido').max(200),
  hotel_name: z.string().min(2, 'Nombre del hotel requerido').max(200),
  hotel_slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50)
    .regex(slugRegex, 'Solo letras minúsculas, números y guiones (sin inicial/final guion)'),
  timezone: z.string().min(3).default('Europe/Madrid'),
  currency: z.string().length(3).default('EUR'),
})

export const createHotelSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(2).max(200),
  slug: z.string().min(3).max(50).regex(slugRegex, 'Slug inválido'),
  timezone: z.string().min(3).default('Europe/Madrid'),
  currency: z.string().length(3).default('EUR'),
})

export const createInviteSchema = z.object({
  hotel_id: z.string().uuid(),
  email: z
    .string()
    .email('Email no válido')
    .transform((v) => v.trim().toLowerCase()),
  role: z.enum(ROLES),
})

export const acceptInviteTokenSchema = z
  .string()
  .min(20, 'Token demasiado corto')
  .max(120, 'Token demasiado largo')

export type CreateTenantWithHotelFormInput = z.input<typeof createTenantWithHotelSchema>
export type CreateHotelFormInput = z.input<typeof createHotelSchema>
export type CreateInviteFormInput = z.input<typeof createInviteSchema>

export { COMMON_TIMEZONES, COMMON_CURRENCIES }
