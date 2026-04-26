import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

/**
 * Tests de aislamiento cross-tenant (ANTIGR-SEC-01, sprint-hardening).
 *
 * Verifica que un usuario autenticado NO puede leer ni mutar datos cuyo `hotel_id`
 * no pertenece a su membership activo. La defensa primaria es RLS en Supabase
 * (políticas `using (exists (select 1 from v3_memberships ...))`). Estos tests son la
 * red de seguridad en CI ante regresiones de policy.
 *
 * Escenarios:
 * 1. Select con hotel_id desconocido → array vacío (RLS filtra por SELECT).
 * 2. Insert con hotel_id desconocido → error RLS / WITH CHECK violation.
 * 3. Lo mismo aplica a clients, recipes, menus, invites y procurement.
 */

const FAKE_HOTEL_ID = '00000000-0000-0000-0000-deadbeef0000'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function skipIfProcurementMigrationMissing(error: { code?: string } | null) {
  if (error?.code === 'PGRST205') {
    test.skip(true, 'Requires migration 00063_v3_procurement_pr_po applied to Supabase')
  }
}

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
        .from('v3_events')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      // RLS es transparente: filtra silenciosamente, no devuelve error.
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('clients de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_clients')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('recipes de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_recipes')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('menus de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_menus')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('invites de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_invites')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('purchase requests de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_purchase_requests')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      skipIfProcurementMigrationMissing(error)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('purchase orders de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_purchase_orders')
        .select('*')
        .eq('hotel_id', FAKE_HOTEL_ID)

      skipIfProcurementMigrationMissing(error)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
  })

  test.describe('INSERT cross-hotel falla por RLS', () => {
    test('insertar client con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { error } = await client.from('v3_clients').insert({
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
      const { error } = await client.from('v3_events').insert({
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

    test('insertar purchase request con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { data: user } = await client.auth.getUser()
      const { error } = await client.from('v3_purchase_requests').insert({
        hotel_id: FAKE_HOTEL_ID,
        origin: 'manual',
        status: 'draft',
        needed_date: '2099-01-01',
        requested_by: user.user?.id ?? '00000000-0000-0000-0000-000000000000',
      })

      skipIfProcurementMigrationMissing(error)
      expect(error).not.toBeNull()
    })
  })
})
