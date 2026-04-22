import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

/**
 * Tests de aislamiento cross-tenant (ANTIGR-SEC-01, sprint-hardening).
 *
 * Verifica que un usuario autenticado NO puede leer ni mutar datos cuyo `hotel_id`
 * no pertenece a su membership activo. La defensa primaria es RLS en Supabase
 * (políticas `using (exists (select 1 from memberships ...))`). Estos tests son la
 * red de seguridad en CI ante regresiones de policy.
 *
 * Escenarios:
 * 1. Select con hotel_id desconocido → array vacío (RLS filtra por SELECT).
 * 2. Insert con hotel_id desconocido → error RLS / WITH CHECK violation.
 * 3. Lo mismo aplica a clients, recipes, menus, invites.
 */

const FAKE_HOTEL_ID = '00000000-0000-0000-0000-deadbeef0000'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('tenant-isolation', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  // Cliente Supabase autenticado con el usuario seed. Cada test obtiene el suyo.
  async function authenticatedSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error } = await client.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    })
    if (error) throw new Error(`No se pudo loguear el usuario seed: ${error.message}`)
    return client
  }

  test.describe('SELECT cross-hotel devuelve vacío', () => {
    test('events de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('events')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      // RLS es transparente: filtra silenciosamente, no devuelve error.
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('clients de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('recipes de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('recipes')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('menus de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('menus')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('invites de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('invites')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })
  })

  test.describe('INSERT cross-hotel falla por RLS', () => {
    test('insertar client con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { error } = await client.from('clients').insert({
        hotel_id: FAKE_HOTEL_ID,
        name: 'Cross-tenant attempt',
        is_active: true,
        vip_level: 'standard',
      })

      // RLS WITH CHECK violation. Código exacto puede ser 42501 (insufficient_privilege)
      // o un PGRST con `new row violates row-level security policy`.
      expect(error).not.toBeNull()
    })

    test('insertar evento con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { error } = await client.from('events').insert({
        hotel_id: FAKE_HOTEL_ID,
        name: 'Cross-tenant event',
        event_date: '2099-01-01',
        guest_count: 1,
        event_type: 'banquet',
        service_type: 'seated',
        status: 'draft',
      })

      expect(error).not.toBeNull()
    })
  })
})
