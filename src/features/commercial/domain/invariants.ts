import type { EventStatus, EventType, ServiceType, VipLevel } from './types'

// ─── Labels UI ────────────────────────────────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  banquet: 'Banquete',
  buffet: 'Buffet',
  coffee_break: 'Coffee Break',
  cocktail: 'Cocktail',
  room_service: 'Room Service',
  catering: 'Catering',
  restaurant: 'Restaurante',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  buffet: 'Buffet',
  seated: 'Emplatado',
  cocktail: 'Cocktail',
  mixed: 'Mixto',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Borrador',
  pending_confirmation: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  in_operation: 'En operación',
  completed: 'Completado',
  cancelled: 'Cancelado',
  archived: 'Archivado',
}

export type StatusVariant = 'neutral' | 'warning' | 'success' | 'info' | 'urgent'

export const EVENT_STATUS_VARIANT: Record<EventStatus, StatusVariant> = {
  draft: 'neutral',
  pending_confirmation: 'warning',
  confirmed: 'success',
  in_preparation: 'info',
  in_operation: 'warning',
  completed: 'success',
  cancelled: 'urgent',
  archived: 'neutral',
}

export const VIP_LEVEL_LABELS: Record<VipLevel, string> = {
  standard: 'Estándar',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

// ─── State machine ────────────────────────────────────────────────────────────

/**
 * Transiciones permitidas del flujo de un evento.
 * La DB (validate_event_transition trigger) es la fuente de verdad final;
 * este mapa se usa en UI para mostrar solo los botones válidos.
 */
export const VALID_TRANSITIONS: Record<EventStatus, readonly EventStatus[]> = {
  draft: ['pending_confirmation', 'cancelled'],
  pending_confirmation: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['in_preparation', 'cancelled'],
  in_preparation: ['in_operation', 'cancelled'],
  in_operation: ['completed', 'cancelled'],
  completed: ['archived'],
  cancelled: ['archived'],
  archived: [],
}

export const TERMINAL_STATUSES: readonly EventStatus[] = ['completed', 'archived', 'cancelled']

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function getValidNextStatuses(from: EventStatus): readonly EventStatus[] {
  return VALID_TRANSITIONS[from]
}

export function isTerminalStatus(status: EventStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/**
 * Un evento bloqueado no acepta más cambios salvo la propia transición al siguiente estado.
 * `completed` y `archived` bloquean edición; `cancelled` admite solo transición a archived.
 */
export function isEventLocked(status: EventStatus): boolean {
  return isTerminalStatus(status)
}

/**
 * Invariante: un evento solo puede confirmarse si tiene al menos un menú asociado.
 * La DB también lo valida; lo exponemos aquí para UX preventiva.
 */
export function canConfirmEvent(menuCount: number): boolean {
  return menuCount >= 1
}

/**
 * Invariante: un evento solo puede cancelarse con motivo explícito.
 */
export function requiresCancelReason(reason: string | null | undefined): reason is string {
  return typeof reason === 'string' && reason.trim().length > 0
}
