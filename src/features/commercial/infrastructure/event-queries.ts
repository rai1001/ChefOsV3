import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CalendarEvent,
  Event,
  EventMenu,
  EventSpace,
  EventStatus,
  EventType,
  EventsFilter,
  ServiceType,
} from '../domain/types'
import { EventNotFoundError } from '../domain/errors'

// ─── Lista y lectura ──────────────────────────────────────────────────────────

export async function fetchEvents(
  supabase: SupabaseClient,
  hotelId: string,
  filter?: EventsFilter
): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('event_date', { ascending: true })

  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
    query = query.in('status', statuses)
  } else {
    query = query.neq('status', 'archived')
  }

  if (filter?.event_type) query = query.eq('event_type', filter.event_type)
  if (filter?.client_id) query = query.eq('client_id', filter.client_id)
  if (filter?.from_date) query = query.gte('event_date', filter.from_date)
  if (filter?.to_date) query = query.lte('event_date', filter.to_date)
  if (filter?.search) query = query.ilike('name', `%${filter.search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data as Event[]) ?? []
}

export async function fetchEvent(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('hotel_id', hotelId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new EventNotFoundError(eventId)
  return data as Event
}

export async function fetchEventSpaces(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<EventSpace[]> {
  const { data, error } = await supabase
    .from('event_spaces')
    .select('*')
    .eq('event_id', eventId)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as EventSpace[]) ?? []
}

export async function fetchEventMenus(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<EventMenu[]> {
  const { data, error } = await supabase
    .from('event_menus')
    .select('*')
    .eq('event_id', eventId)
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as EventMenu[]) ?? []
}

// ─── Vista calendario (RPC) ───────────────────────────────────────────────────

export async function fetchEventsCalendar(
  supabase: SupabaseClient,
  hotelId: string,
  fromDate: string,
  toDate: string
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase.rpc('get_events_calendar', {
    p_hotel_id: hotelId,
    p_from: fromDate,
    p_to: toDate,
  })
  if (error) throw error
  return (data as CalendarEvent[]) ?? []
}

// ─── Mutaciones (RPC) ─────────────────────────────────────────────────────────

export interface CreateEventInput {
  name: string
  event_type: EventType
  service_type: ServiceType
  event_date: string
  guest_count: number
  client_id?: string | null
  start_time?: string | null
  end_time?: string | null
  venue?: string | null
  notes?: string | null
}

export async function createEvent(
  supabase: SupabaseClient,
  hotelId: string,
  input: CreateEventInput
): Promise<string> {
  const { data, error } = await supabase.rpc('create_event', {
    p_hotel_id: hotelId,
    p_name: input.name,
    p_event_type: input.event_type,
    p_service_type: input.service_type,
    p_event_date: input.event_date,
    p_guest_count: input.guest_count,
    p_client_id: input.client_id ?? null,
    p_start_time: input.start_time ?? null,
    p_end_time: input.end_time ?? null,
    p_venue: input.venue ?? null,
    p_notes: input.notes ?? null,
  })
  if (error) throw error
  return data as string
}

export interface UpdateEventInput {
  name?: string
  event_type?: EventType
  service_type?: ServiceType
  event_date?: string
  guest_count?: number
  client_id?: string | null
  start_time?: string | null
  end_time?: string | null
  venue?: string | null
  notes?: string | null
}

export async function updateEvent(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string,
  input: UpdateEventInput,
  changeReason?: string
): Promise<void> {
  const { error } = await supabase.rpc('update_event', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
    p_data: input,
    p_change_reason: changeReason ?? null,
  })
  if (error) throw error
}

export async function transitionEvent(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string,
  newStatus: EventStatus,
  reason?: string
): Promise<void> {
  const { error } = await supabase.rpc('transition_event', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
    p_new_status: newStatus,
    p_reason: reason ?? null,
  })
  if (error) throw error
}
