import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loginAs, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

const skipIfNoLiveProduction = process.env.PRODUCTION_E2E_LIVE !== '1'

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface ProductionFixture {
  hotelId: string
  unitId: string
  recipeId: string
  recipeName: string
  productAId: string
  productBId: string
  lotA1Id: string
  lotA2Id: string
  lotB1Id: string
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

async function ensureProductionMigration(admin: SupabaseClient) {
  const { error } = await admin.from('v3_production_orders').select('id').limit(1)
  if (error?.code === 'PGRST205') {
    test.skip(true, 'Requires migrations 00076-00077 applied to Supabase')
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
    p_tenant_name: `E2E Production ${suffix}`,
    p_hotel_name: `E2E Production ${suffix}`,
    p_hotel_slug: `e2e-production-${suffix}`,
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

async function seedProductionFixture(
  admin: SupabaseClient,
  hotelId: string
): Promise<ProductionFixture> {
  const suffix = crypto.randomUUID().slice(0, 8)

  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Unidad produccion E2E ${suffix}`,
      abbreviation: `pe${suffix.slice(0, 6)}`,
      unit_type: 'count',
      conversion_factor: 1,
      is_default: true,
    })
    .select('id')
    .single()
  if (unit.error) throw unit.error

  const products = await admin
    .from('v3_products')
    .insert([
      {
        hotel_id: hotelId,
        name: `Producto A produccion E2E ${suffix}`,
        sku: `PROD-A-E2E-${suffix}`,
        default_unit_id: unit.data.id,
        allergens: [],
        storage_type: 'ambient',
        is_active: true,
      },
      {
        hotel_id: hotelId,
        name: `Producto B produccion E2E ${suffix}`,
        sku: `PROD-B-E2E-${suffix}`,
        default_unit_id: unit.data.id,
        allergens: [],
        storage_type: 'ambient',
        is_active: true,
      },
    ])
    .select('id')
  if (products.error) throw products.error
  if (!products.data || products.data.length !== 2) throw new Error('Expected two products')

  const productAId = stringValue(products.data[0]?.id, 'productA.id')
  const productBId = stringValue(products.data[1]?.id, 'productB.id')

  const recipeName = `Receta produccion E2E ${suffix}`
  const recipe = await admin
    .from('v3_recipes')
    .insert({
      hotel_id: hotelId,
      name: recipeName,
      category: 'sides',
      difficulty: 'medium',
      status: 'approved',
      servings: 10,
      allergens: [],
      dietary_tags: [],
      total_cost: 0,
      cost_per_serving: 0,
      food_cost_pct: 0,
    })
    .select('id')
    .single()
  if (recipe.error) throw recipe.error

  const recipeId = stringValue(recipe.data.id, 'recipe.id')

  const ingredients = await admin.from('v3_recipe_ingredients').insert([
    {
      hotel_id: hotelId,
      recipe_id: recipeId,
      ingredient_name: `Producto A produccion E2E ${suffix}`,
      product_id: productAId,
      quantity_gross: 2,
      quantity_net: 2,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 1,
    },
    {
      hotel_id: hotelId,
      recipe_id: recipeId,
      ingredient_name: `Producto B produccion E2E ${suffix}`,
      product_id: productBId,
      quantity_gross: 3,
      quantity_net: 3,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 2,
    },
  ])
  if (ingredients.error) throw ingredients.error

  const lots = await admin
    .from('v3_inventory_lots')
    .insert([
      {
        hotel_id: hotelId,
        product_id: productAId,
        quantity_received: 3,
        quantity_remaining: 3,
        unit_id: unit.data.id,
        unit_cost: 10,
        received_at: '2026-01-01T00:00:00.000Z',
        notes: `e2e production ${suffix} lot A1`,
      },
      {
        hotel_id: hotelId,
        product_id: productAId,
        quantity_received: 3,
        quantity_remaining: 3,
        unit_id: unit.data.id,
        unit_cost: 12,
        received_at: '2026-01-02T00:00:00.000Z',
        notes: `e2e production ${suffix} lot A2`,
      },
      {
        hotel_id: hotelId,
        product_id: productBId,
        quantity_received: 10,
        quantity_remaining: 10,
        unit_id: unit.data.id,
        unit_cost: 2,
        received_at: '2026-01-03T00:00:00.000Z',
        notes: `e2e production ${suffix} lot B1`,
      },
    ])
    .select('id')
  if (lots.error) throw lots.error
  if (!lots.data || lots.data.length !== 3) throw new Error('Expected three lots')

  return {
    hotelId,
    unitId: stringValue(unit.data.id, 'unit.id'),
    recipeId,
    recipeName,
    productAId,
    productBId,
    lotA1Id: stringValue(lots.data[0]?.id, 'lotA1.id'),
    lotA2Id: stringValue(lots.data[1]?.id, 'lotA2.id'),
    lotB1Id: stringValue(lots.data[2]?.id, 'lotB1.id'),
  }
}

async function cleanupProductionFixture(
  admin: SupabaseClient,
  fixture: ProductionFixture
) {
  await admin
    .from('v3_inventory_movements')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('product_id', [fixture.productAId, fixture.productBId])
  await admin
    .from('v3_production_orders')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('recipe_id', fixture.recipeId)
  await admin
    .from('v3_inventory_lots')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('product_id', [fixture.productAId, fixture.productBId])
  await admin
    .from('v3_recipe_ingredients')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('recipe_id', fixture.recipeId)
  await admin
    .from('v3_recipes')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.recipeId)
  await admin
    .from('v3_products')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('id', [fixture.productAId, fixture.productBId])
  await admin
    .from('v3_units_of_measure')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.unitId)
}

async function lotSnapshot(admin: SupabaseClient, fixture: ProductionFixture) {
  const { data, error } = await admin
    .from('v3_inventory_lots')
    .select('id, quantity_remaining')
    .eq('hotel_id', fixture.hotelId)
    .in('id', [fixture.lotA1Id, fixture.lotA2Id, fixture.lotB1Id])
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []).map((lot) => ({
    id: stringValue(lot.id, 'lot.id'),
    quantity_remaining: numberValue(lot.quantity_remaining, 'lot.quantity_remaining'),
  }))
}

test.describe('production routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('production list route is reachable for authenticated users', async ({ page }) => {
    await loginAs(page)
    await page.goto('/production')
    await expect(page).toHaveURL(/\/(production|onboarding)/)
    if (page.url().includes('/onboarding')) return

    await expect(page.getByRole('heading', { name: /producci[oó]n/i })).toBeVisible()
  })
})

test.describe('production FIFO flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')
  test.skip(skipIfNoLiveProduction, 'Set PRODUCTION_E2E_LIVE=1 after migrations 00076-00077')

  test('creates an order, consumes FIFO atomically, fails intact on deficits, completes and cancels', async ({
    page,
  }) => {
    const admin = adminClient()
    await ensureProductionMigration(admin)
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    let fixture: ProductionFixture | null = null

    try {
      fixture = await seedProductionFixture(admin, activeHotel.hotel_id)

      await loginAs(page)
      await page.goto('/production/new')
      if (page.url().includes('/onboarding')) test.skip(true, 'Requires active hotel')

      await expect(
        page
          .locator('datalist#production-recipes option')
          .filter({ hasText: fixture.recipeName })
      ).toHaveCount(1)

      await page.getByPlaceholder('Buscar receta').fill(fixture.recipeName)
      await page.getByLabel('Raciones').fill('20')
      await expect(page.getByText(fixture.productAId.slice(0, 8))).toBeVisible()
      await expect(page.getByText(fixture.productBId.slice(0, 8))).toBeVisible()

      await page.getByRole('button', { name: /crear/i }).click()
      await expect(page).toHaveURL(/\/production\/[0-9a-f-]{36}$/i)
      const orderId = page.url().split('/').at(-1)
      if (!orderId) throw new Error('Expected order id in URL')

      const feasibility = await client.rpc('v3_check_production_feasibility', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderId,
      })
      if (feasibility.error) throw feasibility.error
      expect(record(feasibility.data).feasible).toBe(true)

      const started = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderId,
      })
      if (started.error) throw started.error

      const startedData = record(started.data)
      const startedOrder = record(startedData.order)
      expect(startedOrder.status).toBe('in_progress')
      expect(numberValue(startedOrder.actual_total_cost, 'actual_total_cost')).toBe(54)

      const startedLines = objectArray(startedData.lines, 'lines')
      expect(startedLines).toHaveLength(2)
      const lineA = startedLines.find((line) => line.product_id === fixture?.productAId)
      const lineB = startedLines.find((line) => line.product_id === fixture?.productBId)
      expect(numberValue(lineA?.actual_consumed_quantity, 'lineA.qty')).toBe(4)
      expect(numberValue(lineA?.actual_total_cost, 'lineA.cost')).toBe(42)
      expect(numberValue(lineB?.actual_consumed_quantity, 'lineB.qty')).toBe(6)
      expect(numberValue(lineB?.actual_total_cost, 'lineB.cost')).toBe(12)

      const startedMovements = objectArray(startedData.movements, 'movements')
      expect(startedMovements).toHaveLength(3)
      expect(
        startedMovements.every(
          (movement) =>
            record(movement.origin).source === 'production' &&
            record(movement.origin).production_order_id === orderId
        )
      ).toBe(true)
      const movementByLot = new Map(
        startedMovements.map((movement) => [
          stringValue(movement.lot_id, 'movement.lot_id'),
          numberValue(movement.quantity, 'movement.quantity'),
        ])
      )
      expect(movementByLot.get(fixture.lotA1Id)).toBe(3)
      expect(movementByLot.get(fixture.lotA2Id)).toBe(1)
      expect(movementByLot.get(fixture.lotB1Id)).toBe(6)

      const afterStart = await lotSnapshot(admin, fixture)
      expect(afterStart).toEqual([
        { id: fixture.lotA1Id, quantity_remaining: 0 },
        { id: fixture.lotA2Id, quantity_remaining: 2 },
        { id: fixture.lotB1Id, quantity_remaining: 4 },
      ].sort((a, b) => a.id.localeCompare(b.id)))

      const tooLargeOrder = await client.rpc('v3_create_production_order', {
        p_hotel_id: fixture.hotelId,
        p_recipe_id: fixture.recipeId,
        p_servings: 1000,
        p_scheduled_at: null,
        p_notes: 'E2E stock insuficiente',
      })
      if (tooLargeOrder.error) throw tooLargeOrder.error
      const tooLargeOrderId = stringValue(
        record(tooLargeOrder.data).order_id,
        'tooLarge.order_id'
      )
      const beforeFailure = await lotSnapshot(admin, fixture)

      const failedStart = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: tooLargeOrderId,
      })
      expect(failedStart.error?.code).toBe('P0002')
      const deficits = objectArray(JSON.parse(failedStart.error?.details ?? '[]'), 'deficits')
      expect(deficits.length).toBeGreaterThan(0)
      expect(await lotSnapshot(admin, fixture)).toEqual(beforeFailure)

      const completed = await client.rpc('v3_complete_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderId,
        p_notes: 'E2E completada',
      })
      if (completed.error) throw completed.error
      expect(record(record(completed.data).order).status).toBe('completed')

      const draftOrder = await client.rpc('v3_create_production_order', {
        p_hotel_id: fixture.hotelId,
        p_recipe_id: fixture.recipeId,
        p_servings: 10,
        p_scheduled_at: null,
        p_notes: 'E2E cancel draft',
      })
      if (draftOrder.error) throw draftOrder.error
      const draftOrderId = stringValue(record(draftOrder.data).order_id, 'draft.order_id')

      const cancelled = await client.rpc('v3_cancel_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: draftOrderId,
        p_reason: 'E2E cancelacion draft',
      })
      if (cancelled.error) throw cancelled.error
      expect(record(record(cancelled.data).order).status).toBe('cancelled')
    } finally {
      if (fixture) await cleanupProductionFixture(admin, fixture)
    }
  })
})
