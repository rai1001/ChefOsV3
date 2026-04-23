// Dominio commercial — tipos puros sin lógica.
// Basado en schema real de v2 (ADR-0008). No modificar sin ADR nuevo.

export const EVENT_STATUSES = [
  'draft',
  'pending_confirmation',
  'confirmed',
  'in_preparation',
  'in_operation',
  'completed',
  'cancelled',
  'archived',
] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]

export const EVENT_TYPES = [
  'banquet',
  'buffet',
  'coffee_break',
  'cocktail',
  'room_service',
  'catering',
  'restaurant',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const SERVICE_TYPES = ['buffet', 'seated', 'cocktail', 'mixed'] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const VIP_LEVELS = ['standard', 'silver', 'gold', 'platinum'] as const
export type VipLevel = (typeof VIP_LEVELS)[number]

// ─── Entidades base ───────────────────────────────────────────────────────────

export interface Client {
  id: string
  hotel_id: string
  name: string
  company: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
  vip_level: VipLevel
  lifetime_value: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  hotel_id: string
  client_id: string | null
  name: string
  event_type: EventType
  service_type: ServiceType
  event_date: string
  start_time: string | null
  end_time: string | null
  guest_count: number
  venue: string | null
  setup_time: string | null
  teardown_time: string | null
  status: EventStatus
  notes: string | null
  beo_number: string | null
  cancel_reason: string | null
  theoretical_cost: number | null
  actual_cost: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventSpace {
  id: string
  event_id: string
  hotel_id: string
  space_name: string
  setup_type: string | null
  setup_style: string | null
  capacity: number | null
  notes: string | null
  created_at: string
}

export interface EventMenu {
  id: string
  event_id: string
  hotel_id: string
  menu_id: string | null
  menu_name: string
  sort_order: number
  servings_override: number | null
  created_at: string
}

export interface EventOperationalImpact {
  id: string
  hotel_id: string
  event_id: string
  product_id: string | null
  product_name: string
  quantity_needed: number
  unit: string | null
  department: 'cocina_caliente' | 'cocina_fria' | 'pasteleria' | 'panaderia' | 'bebidas' | 'general'
  generated_at: string
}

// ─── Vistas derivadas ─────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string
  name: string
  event_type: EventType
  service_type: ServiceType
  event_date: string
  start_time: string | null
  end_time: string | null
  guest_count: number
  venue: string | null
  status: EventStatus
  beo_number: string | null
  client_name: string | null
}

// ─── BEO (Banquet Event Order) ────────────────────────────────────────────────

export interface BeoRecipe {
  id: string
  name: string
  servings_override: number | null
  unit_cost: number | null
  yield_pct: number | null
}

export interface BeoSection {
  id: string
  name: string
  course_type: string | null
  recipes: BeoRecipe[]
}

export interface BeoMenu {
  id: string
  menu_name: string
  sort_order: number
  servings_override: number | null
  sections: BeoSection[]
}

export interface BeoImpactItem {
  product_id: string | null
  product_name: string
  quantity_needed: number
  unit: string | null
}

export interface BeoImpactByDept {
  department: string
  items: BeoImpactItem[]
}

export interface BeoSpace {
  space_name: string
  capacity: number | null
  setup_style: string | null
}

export interface BeoClient {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
}

export interface BeoData {
  id: string
  beo_number: string | null
  name: string
  event_type: EventType
  service_type: ServiceType
  event_date: string
  start_time: string | null
  end_time: string | null
  guest_count: number
  venue: string | null
  setup_time: string | null
  teardown_time: string | null
  status: EventStatus
  notes: string | null
  theoretical_cost: number | null
  actual_cost: number | null
  client: BeoClient | null
  hotel: { id: string; name: string }
  menus: BeoMenu[]
  operational_impact: BeoImpactByDept[]
  spaces: BeoSpace[]
}

// ─── Filtros de consulta ──────────────────────────────────────────────────────

export interface EventsFilter {
  status?: EventStatus | EventStatus[]
  event_type?: EventType
  client_id?: string
  from_date?: string
  to_date?: string
  search?: string
}
