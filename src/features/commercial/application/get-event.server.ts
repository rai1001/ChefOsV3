import 'server-only'

import { createClient } from '@/lib/supabase/server'
import {
  fetchEvent,
  fetchEventMenus,
  fetchEventSpaces,
} from '../infrastructure/event-queries'
import { fetchClient } from '../infrastructure/client-queries'
import type { Client, Event, EventMenu, EventSpace } from '../domain/types'

export async function getEventServer(hotelId: string, eventId: string): Promise<Event> {
  const supabase = await createClient()
  return fetchEvent(supabase, hotelId, eventId)
}

export async function getEventSpacesServer(
  hotelId: string,
  eventId: string
): Promise<EventSpace[]> {
  const supabase = await createClient()
  return fetchEventSpaces(supabase, hotelId, eventId)
}

export async function getEventMenusServer(
  hotelId: string,
  eventId: string
): Promise<EventMenu[]> {
  const supabase = await createClient()
  return fetchEventMenus(supabase, hotelId, eventId)
}

// Helper combinado para vista detalle (3 queries paralelas).
export async function getEventDetailServer(
  hotelId: string,
  eventId: string
): Promise<{ event: Event; spaces: EventSpace[]; menus: EventMenu[] }> {
  const supabase = await createClient()
  const [event, spaces, menus] = await Promise.all([
    fetchEvent(supabase, hotelId, eventId),
    fetchEventSpaces(supabase, hotelId, eventId),
    fetchEventMenus(supabase, hotelId, eventId),
  ])
  return { event, spaces, menus }
}

export async function getClientServer(hotelId: string, clientId: string): Promise<Client> {
  const supabase = await createClient()
  return fetchClient(supabase, hotelId, clientId)
}
