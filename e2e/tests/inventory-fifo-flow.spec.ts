import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loginAs, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

const skipIfNoLiveInventory = process.env.INVENTORY_E2E_LIVE !== '1'

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface InventoryFixture {
  hotelId: string
  productId: string
  unitId: string
  lotAId: string
  lotBId: string
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Expected string field: ${field}`)
  }
  return value
}

function numberValue(value: unknown, field: string): number {
  if (typeof value !== 'number') {
    throw new Error(`Expected number field: ${field}`)
  }
  return value
}

function objectArray(value: unknown, field: string): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error(`Expected array field: ${field}`)
  return value.map((item) => record(item))
}

function adminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function authenticatedClient(): Promise<SupabaseClient> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await client.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  })
  if (error) throw new Error(`No se pudo loguear el usuario seed: ${error.message}`)
  return client
}

async function ensureInventoryMigration(admin: SupabaseClient) {
  const { error } = await admin.from('v3_inventory_lots').select('id').limit(1)
  if (error?.code === 'PGRST205') {
    test.skip(true, 'Requires migration 00072_v3_inventory_lots applied to Supabase')
  }
  if (error) throw error
}

async function ensureActiveHotel(client: SupabaseClient): Promise<ActiveHotel> {
  const active = await client.rpc('v3_get_active_hotel')
  if (!active.error) {
    const data = record(active.data)
    return {
      hotel_id: stringValue(data.hotel_id, 'hotel_id'),
      tenant_id: stringValue(data.tenant_id, 'tenant_id'),
    }
  }

  if (active.error.code !== 'P0003') throw active.error

  const suffix = crypto.randomUUID().slice(0, 8)
  const created = await client.rpc('v3_create_tenant_with_hotel', {
    p_tenant_name: `E2E Inventory ${suffix}`,
    p_hotel_name: `E2E Inventory ${suffix}`,
    p_hotel_slug: `e2e-inventory-${suffix}`,
    p_timezone: 'Europe/Madrid',
    p_currency: 'EUR',
  })
  if (created.error) throw created.error

  const data = record(created.data)
  return {
    hotel_id: stringValue(data.hotel_id, 'hotel_id'),
    tenant_id: stringValue(data.tenant_id, 'tenant_id'),
  }
}

async function seedInventoryFixture(
  admin: SupabaseClient,
  hotelId: string
): Promise<InventoryFixture> {
  const suffix = crypto.randomUUID().slice(0, 8)

  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Unidad FIFO E2E ${suffix}`,
      abbreviation: `if${suffix.slice(0, 6)}`,
      unit_type: 'count',
      conversion_factor: 1,
      is_default: true,
    })
    .select('id')
    .single()
  if (unit.error) throw unit.error

  const product = await admin
    .from('v3_products')
    .insert({
      hotel_id: hotelId,
      name: `Producto FIFO E2E ${suffix}`,
      sku: `FIFO-E2E-${suffix}`,
      default_unit_id: unit.data.id,
      allergens: [],
      storage_type: 'ambient',
      is_active: true,
    })
    .select('id')
    .single()
  if (product.error) throw product.error

  const lots = await admin
    .from('v3_inventory_lots')
    .insert([
      {
        hotel_id: hotelId,
        product_id: product.data.id,
        quantity_received: 5,
        quantity_remaining: 5,
        unit_id: unit.data.id,
        unit_cost: 10,
        received_at: '2026-01-01T00:00:00.000Z',
        notes: `e2e ${suffix} lot A`,
      },
      {
        hotel_id: hotelId,
        product_id: product.data.id,
        quantity_received: 5,
        quantity_remaining: 5,
        unit_id: unit.data.id,
        unit_cost: 12,
        received_at: '2026-01-02T00:00:00.000Z',
        notes: `e2e ${suffix} lot B`,
      },
    ])
    .select('id')
  if (lots.error) throw lots.error
  if (!lots.data || lots.data.length !== 2) throw new Error('Expected two lots')

  return {
    hotelId,
    productId: stringValue(product.data.id, 'product.id'),
    unitId: stringValue(unit.data.id, 'unit.id'),
    lotAId: stringValue(lots.data[0]?.id, 'lotA.id'),
    lotBId: stringValue(lots.data[1]?.id, 'lotB.id'),
  }
}

async function cleanupInventoryFixture(admin: SupabaseClient, fixture: InventoryFixture) {
  await admin
    .from('v3_inventory_movements')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('product_id', fixture.productId)
  await admin
    .from('v3_inventory_lots')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('product_id', fixture.productId)
  await admin
    .from('v3_products')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.productId)
  await admin
    .from('v3_units_of_measure')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.unitId)
}

test.describe('inventory routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('inventory snapshot route is reachable for authenticated users', async ({ page }) => {
    await loginAs(page)
    await page.goto('/inventory')
    await expect(page).toHaveURL(/\/(inventory|onboarding)/)
    if (page.url().includes('/onboarding')) return

    await expect(page.getByRole('heading', { name: /inventario/i })).toBeVisible()
  })
})

test.describe('inventory FIFO flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')
  test.skip(skipIfNoLiveInventory, 'Set INVENTORY_E2E_LIVE=1 after migrations 00072-00075')

  test('consume, waste and adjustment follow FIFO and preserve cost snapshot', async () => {
    const admin = adminClient()
    await ensureInventoryMigration(admin)
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    let fixture: InventoryFixture | null = null

    try {
      fixture = await seedInventoryFixture(admin, activeHotel.hotel_id)

      const consumed = await client.rpc('v3_consume_inventory', {
        p_hotel_id: fixture.hotelId,
        p_product_id: fixture.productId,
        p_quantity: 7,
        p_origin: { source: 'e2e_inventory_fifo' },
      })
      if (consumed.error) throw consumed.error

      const consumedData = record(consumed.data)
      const consumedLots = objectArray(consumedData.consumed_lots, 'consumed_lots')
      expect(consumedLots).toHaveLength(2)
      expect(stringValue(consumedLots[0]?.lot_id, 'consumed_lots[0].lot_id')).toBe(
        fixture.lotAId
      )
      expect(stringValue(consumedLots[1]?.lot_id, 'consumed_lots[1].lot_id')).toBe(
        fixture.lotBId
      )
      expect(numberValue(consumedData.total_cost, 'total_cost')).toBe(74)
      expect(numberValue(consumedData.weighted_unit_cost, 'weighted_unit_cost')).toBe(
        10.5714
      )

      const afterConsume = await admin
        .from('v3_inventory_lots')
        .select('id, quantity_remaining')
        .eq('hotel_id', fixture.hotelId)
        .eq('product_id', fixture.productId)
        .order('received_at', { ascending: true })
      if (afterConsume.error) throw afterConsume.error
      expect(afterConsume.data?.map((lot) => Number(lot.quantity_remaining))).toEqual([
        0, 3,
      ])

      const overConsume = await client.rpc('v3_consume_inventory', {
        p_hotel_id: fixture.hotelId,
        p_product_id: fixture.productId,
        p_quantity: 100,
        p_origin: { source: 'e2e_inventory_fifo' },
      })
      expect(overConsume.error?.code).toBe('P0002')

      const waste = await client.rpc('v3_register_waste', {
        p_hotel_id: fixture.hotelId,
        p_product_id: fixture.productId,
        p_quantity: 1,
        p_reason: 'E2E merma FIFO',
      })
      if (waste.error) throw waste.error

      const afterWaste = await admin
        .from('v3_inventory_lots')
        .select('id, quantity_remaining')
        .eq('hotel_id', fixture.hotelId)
        .eq('product_id', fixture.productId)
        .eq('id', fixture.lotBId)
        .single()
      if (afterWaste.error) throw afterWaste.error
      expect(Number(afterWaste.data.quantity_remaining)).toBe(2)

      const adjustment = await client.rpc('v3_register_adjustment', {
        p_hotel_id: fixture.hotelId,
        p_product_id: fixture.productId,
        p_quantity_delta: 2,
        p_reason: 'E2E ajuste positivo',
      })
      if (adjustment.error) throw adjustment.error
      const adjustmentData = record(adjustment.data)
      expect(adjustmentData.movement_kind).toBe('adjust_in')
      expect(numberValue(adjustmentData.weighted_unit_cost, 'weighted_unit_cost')).toBe(12)

      const movements = await admin
        .from('v3_inventory_movements')
        .select('kind')
        .eq('hotel_id', fixture.hotelId)
        .eq('product_id', fixture.productId)
        .order('created_at', { ascending: true })
      if (movements.error) throw movements.error
      expect(movements.data?.map((movement) => movement.kind)).toEqual([
        'consume',
        'consume',
        'waste',
        'adjust_in',
      ])
    } finally {
      if (fixture) await cleanupInventoryFixture(admin, fixture)
    }
  })
})
