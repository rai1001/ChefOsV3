import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
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

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

function skipIfProcurementMigrationMissing(error: { code?: string } | null) {
  if (error?.code === 'PGRST205') {
    test.skip(true, 'Requires migration 00063_v3_procurement_pr_po applied to Supabase')
  }
}

function adminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function seedForeignHotelWithRows(admin: SupabaseClient) {
  const suffix = crypto.randomUUID().slice(0, 8)
  const hotel = await admin
    .from('v3_hotels')
    .insert({
      tenant_id: null,
      name: `E2E Foreign Hotel ${suffix}`,
      slug: `e2e-foreign-hotel-${suffix}`,
      timezone: 'Europe/Madrid',
      currency: 'EUR',
    })
    .select('id')
    .single()
  if (hotel.error) throw hotel.error

  const foreignHotelId = hotel.data.id
  await Promise.all([
    admin.from('v3_events').insert({ hotel_id: foreignHotelId, name: `Event ${suffix}`, event_date: '2099-01-01' }),
    admin.from('v3_clients').insert({ hotel_id: foreignHotelId, name: `Client ${suffix}` }),
    admin.from('v3_recipes').insert({ hotel_id: foreignHotelId, name: `Recipe ${suffix}` }),
    admin.from('v3_menus').insert({ hotel_id: foreignHotelId, name: `Menu ${suffix}` }),
    admin.from('v3_invites').insert({ hotel_id: foreignHotelId, email: `invite+${suffix}@example.com`, role: 'staff' }),
  ]).then((results) => {
    for (const result of results) {
      if (result.error) throw result.error
    }
  })

  return foreignHotelId
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

  test.describe.configure({ mode: 'serial' })

  let foreignHotelId = ''
  test.beforeAll(async () => {
    foreignHotelId = await seedForeignHotelWithRows(adminClient())
  })

  test.describe('SELECT cross-hotel devuelve vacío', () => {
    test('events de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_events')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      // RLS es transparente: filtra silenciosamente, no devuelve error.
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('clients de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_clients')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('recipes de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_recipes')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('menus de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_menus')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('invites de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_invites')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('purchase requests de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_purchase_requests')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      skipIfProcurementMigrationMissing(error)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    test('purchase orders de otro hotel → array vacío', async () => {
      const client = await authenticatedSupabaseClient()
      const { data, error } = await client
        .from('v3_purchase_orders')
        .select('*')
        .eq('hotel_id', foreignHotelId)

      skipIfProcurementMigrationMissing(error)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
  })

  test.describe('INSERT cross-hotel falla por RLS', () => {
    test('insertar client con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { error } = await client.from('v3_clients').insert({
        hotel_id: foreignHotelId,
        name: 'Cross-tenant attempt',
        is_active: true,
        vip_level: 'standard',
      })

      // RLS WITH CHECK violation. Código exacto puede ser 42501 (insufficient_privilege)
      // o un PGRST con `new row violates row-level security policy`.
      expect(error).not.toBeNull()
      expect(error?.code).toBe('42501')
    })

    test('insertar evento con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { error } = await client.from('v3_events').insert({
        hotel_id: foreignHotelId,
        name: 'Cross-tenant event',
        event_date: '2099-01-01',
        guest_count: 1,
        event_type: 'banquet',
        service_type: 'seated',
        status: 'draft',
      })

      expect(error).not.toBeNull()
      expect(error?.code).toBe('42501')
    })

    test('insertar purchase request con hotel_id ajeno → rechazado', async () => {
      const client = await authenticatedSupabaseClient()
      const { data: user } = await client.auth.getUser()
      const { error } = await client.from('v3_purchase_requests').insert({
        hotel_id: foreignHotelId,
        origin: 'manual',
        status: 'draft',
        needed_date: '2099-01-01',
        requested_by: user.user?.id ?? '00000000-0000-0000-0000-000000000000',
      })

      skipIfProcurementMigrationMissing(error)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('42501')
    })
  })
})
