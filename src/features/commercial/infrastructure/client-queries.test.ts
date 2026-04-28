import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { updateClient, type UpdateClientInput } from './client-queries'
import type { Client } from '../domain/types'

describe('updateClient', () => {
  it('solo envia campos mutables esperados a Supabase', async () => {
    let updatePayload: unknown
    const client: Client = {
      id: 'client-1',
      hotel_id: 'hotel-1',
      name: 'Cliente actualizado',
      company: null,
      contact_person: null,
      email: null,
      phone: null,
      tax_id: null,
      vip_level: 'standard',
      lifetime_value: 0,
      notes: null,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    const query = {
      eq: vi.fn(() => query),
      select: vi.fn(() => query),
      single: vi.fn().mockResolvedValue({ data: client, error: null }),
    }
    const update = vi.fn((payload: unknown) => {
      updatePayload = payload
      return query
    })
    const supabase = {
      from: vi.fn(() => ({ update })),
    }

    await updateClient(
      supabase as unknown as SupabaseClient,
      'hotel-1',
      'client-1',
      {
        name: 'Cliente actualizado',
        hotel_id: 'hotel-atacante',
        lifetime_value: 999_999,
      } as unknown as UpdateClientInput
    )

    expect(supabase.from).toHaveBeenCalledWith('v3_clients')
    expect(updatePayload).toEqual({ name: 'Cliente actualizado' })
    expect(query.eq).toHaveBeenCalledWith('id', 'client-1')
    expect(query.eq).toHaveBeenCalledWith('hotel_id', 'hotel-1')
  })
})
