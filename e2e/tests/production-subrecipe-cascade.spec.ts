import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

const skipIfNoLiveProduction = process.env.PRODUCTION_E2E_LIVE !== '1'

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface SubrecipeFixture {
  hotelId: string
  unitId: string
  terminalProductId: string
  outputProductId: string
  prepRecipeId: string
  parentRecipeId: string
}

interface DepthFixture {
  hotelId: string
  unitId: string
  productIds: string[]
  recipeIds: string[]
  rootRecipeId: string
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

async function ensureSubrecipeMigration(admin: SupabaseClient) {
  const { error } = await admin.from('v3_recipes').select('is_preparation').limit(1)
  if (error?.code === 'PGRST204' || error?.code === '42703') {
    test.skip(true, 'Requires Sprint-08 subrecipe migrations applied to Supabase')
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
    p_tenant_name: `E2E Subrecipe ${suffix}`,
    p_hotel_name: `E2E Subrecipe ${suffix}`,
    p_hotel_slug: `e2e-subrecipe-${suffix}`,
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

async function seedSubrecipeFixture(
  admin: SupabaseClient,
  hotelId: string,
  terminalStock = 0.4
): Promise<SubrecipeFixture> {
  const suffix = crypto.randomUUID().slice(0, 8)

  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Kilogramo subrecipe E2E ${suffix}`,
      abbreviation: `kg${suffix.slice(0, 5)}`,
      unit_type: 'weight',
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
        name: `Almendra terminal E2E ${suffix}`,
        sku: `SUB-TERM-${suffix}`,
        default_unit_id: unit.data.id,
        allergens: [],
        storage_type: 'ambient',
        is_active: true,
      },
      {
        hotel_id: hotelId,
        name: `Cebolla preparada E2E ${suffix}`,
        sku: `SUB-OUT-${suffix}`,
        default_unit_id: unit.data.id,
        allergens: [],
        storage_type: 'ambient',
        is_active: true,
      },
    ])
    .select('id')
  if (products.error) throw products.error
  if (!products.data || products.data.length !== 2) throw new Error('Expected products')

  const terminalProductId = stringValue(products.data[0]?.id, 'terminal_product.id')
  const outputProductId = stringValue(products.data[1]?.id, 'output_product.id')

  const recipes = await admin
    .from('v3_recipes')
    .insert([
      {
        hotel_id: hotelId,
        name: `Fondo E2E ${suffix}`,
        category: 'sauces_stocks',
        difficulty: 'medium',
        status: 'approved',
        servings: 8,
        allergens: [],
        dietary_tags: [],
        total_cost: 0,
        cost_per_serving: 0,
        food_cost_pct: 0,
        is_preparation: true,
        output_product_id: outputProductId,
        output_quantity_per_batch: 1,
      },
      {
        hotel_id: hotelId,
        name: `Lubina E2E ${suffix}`,
        category: 'fish',
        difficulty: 'medium',
        status: 'approved',
        servings: 8,
        allergens: [],
        dietary_tags: [],
        total_cost: 0,
        cost_per_serving: 0,
        food_cost_pct: 0,
      },
    ])
    .select('id')
  if (recipes.error) throw recipes.error
  if (!recipes.data || recipes.data.length !== 2) throw new Error('Expected recipes')

  const prepRecipeId = stringValue(recipes.data[0]?.id, 'prep_recipe.id')
  const parentRecipeId = stringValue(recipes.data[1]?.id, 'parent_recipe.id')

  const ingredients = await admin.from('v3_recipe_ingredients').insert([
    {
      hotel_id: hotelId,
      recipe_id: prepRecipeId,
      ingredient_name: `Almendra terminal E2E ${suffix}`,
      product_id: terminalProductId,
      quantity_gross: 0.4,
      quantity_net: 0.4,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 1,
    },
    {
      hotel_id: hotelId,
      recipe_id: parentRecipeId,
      ingredient_name: `Fondo E2E ${suffix}`,
      product_id: outputProductId,
      source_recipe_id: prepRecipeId,
      quantity_gross: 0.6,
      quantity_net: 0.6,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 1,
    },
  ])
  if (ingredients.error) throw ingredients.error

  if (terminalStock > 0) {
    const lot = await admin.from('v3_inventory_lots').insert({
      hotel_id: hotelId,
      product_id: terminalProductId,
      quantity_received: terminalStock,
      quantity_remaining: terminalStock,
      unit_id: unit.data.id,
      unit_cost: 5,
      received_at: '2026-01-01T00:00:00.000Z',
      notes: `e2e subrecipe terminal ${suffix}`,
    })
    if (lot.error) throw lot.error
  }

  return {
    hotelId,
    unitId: stringValue(unit.data.id, 'unit.id'),
    terminalProductId,
    outputProductId,
    prepRecipeId,
    parentRecipeId,
  }
}

async function cleanupSubrecipeFixture(admin: SupabaseClient, fixture: SubrecipeFixture) {
  await admin
    .from('v3_inventory_movements')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('product_id', [fixture.terminalProductId, fixture.outputProductId])
  await admin
    .from('v3_inventory_lots')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('product_id', [fixture.terminalProductId, fixture.outputProductId])
  await admin
    .from('v3_production_orders')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('recipe_id', [fixture.prepRecipeId, fixture.parentRecipeId])
  await admin
    .from('v3_recipe_ingredients')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('recipe_id', [fixture.prepRecipeId, fixture.parentRecipeId])
  await admin
    .from('v3_recipes')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('id', [fixture.prepRecipeId, fixture.parentRecipeId])
  await admin
    .from('v3_products')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('id', [fixture.terminalProductId, fixture.outputProductId])
  await admin
    .from('v3_units_of_measure')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.unitId)
}

async function seedDepthFixture(
  admin: SupabaseClient,
  hotelId: string
): Promise<DepthFixture> {
  const suffix = crypto.randomUUID().slice(0, 8)
  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Unidad depth E2E ${suffix}`,
      abbreviation: `dp${suffix.slice(0, 5)}`,
      unit_type: 'count',
      conversion_factor: 1,
      is_default: true,
    })
    .select('id')
    .single()
  if (unit.error) throw unit.error

  const productPayload = Array.from({ length: 6 }, (_, index) => ({
    hotel_id: hotelId,
    name: `Producto depth ${index + 1} E2E ${suffix}`,
    sku: `DEPTH-P${index + 1}-${suffix}`,
    default_unit_id: unit.data.id,
    allergens: [],
    storage_type: 'ambient',
    is_active: true,
  }))
  const products = await admin.from('v3_products').insert(productPayload).select('id')
  if (products.error) throw products.error
  const productIds = (products.data ?? []).map((product, index) =>
    stringValue(product.id, `depth.product.${index}`)
  )

  const prepPayload = productIds.map((productId, index) => ({
    hotel_id: hotelId,
    name: `Prep depth ${index + 1} E2E ${suffix}`,
    category: 'mise_en_place',
    difficulty: 'medium',
    status: 'approved',
    servings: 1,
    allergens: [],
    dietary_tags: [],
    total_cost: 0,
    cost_per_serving: 0,
    food_cost_pct: 0,
    is_preparation: true,
    output_product_id: productId,
    output_quantity_per_batch: 1,
  }))
  const rootPayload = {
    hotel_id: hotelId,
    name: `Root depth E2E ${suffix}`,
    category: 'mise_en_place',
    difficulty: 'medium',
    status: 'approved',
    servings: 1,
    allergens: [],
    dietary_tags: [],
    total_cost: 0,
    cost_per_serving: 0,
    food_cost_pct: 0,
  }
  const recipes = await admin
    .from('v3_recipes')
    .insert([...prepPayload, rootPayload])
    .select('id')
  if (recipes.error) throw recipes.error
  const recipeIds = (recipes.data ?? [])
    .slice(0, 6)
    .map((recipe, index) => stringValue(recipe.id, `depth.recipe.${index}`))
  const rootRecipeId = stringValue(recipes.data?.[6]?.id, 'depth.root_recipe.id')

  const ingredientPayload = [
    {
      hotel_id: hotelId,
      recipe_id: rootRecipeId,
      ingredient_name: 'Depth 1',
      product_id: productIds[0],
      source_recipe_id: recipeIds[0],
      quantity_gross: 1,
      quantity_net: 1,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 1,
    },
    ...recipeIds.slice(0, 5).map((recipeId, index) => ({
      hotel_id: hotelId,
      recipe_id: recipeId,
      ingredient_name: `Depth ${index + 2}`,
      product_id: productIds[index + 1],
      source_recipe_id: recipeIds[index + 1],
      quantity_gross: 1,
      quantity_net: 1,
      unit_id: unit.data.id,
      unit_cost: 0,
      waste_pct: 0,
      sort_order: 1,
    })),
  ]
  const ingredients = await admin.from('v3_recipe_ingredients').insert(ingredientPayload)
  if (ingredients.error) throw ingredients.error

  return {
    hotelId,
    unitId: stringValue(unit.data.id, 'depth.unit.id'),
    productIds,
    recipeIds,
    rootRecipeId,
  }
}

async function cleanupDepthFixture(admin: SupabaseClient, fixture: DepthFixture) {
  await admin
    .from('v3_recipe_ingredients')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('recipe_id', [...fixture.recipeIds, fixture.rootRecipeId])
  await admin
    .from('v3_recipes')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('id', [...fixture.recipeIds, fixture.rootRecipeId])
  await admin
    .from('v3_products')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .in('id', fixture.productIds)
  await admin
    .from('v3_units_of_measure')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.unitId)
}

async function createParentOrder(
  client: SupabaseClient,
  fixture: SubrecipeFixture
): Promise<string> {
  const created = await client.rpc('v3_create_production_order', {
    p_hotel_id: fixture.hotelId,
    p_recipe_id: fixture.parentRecipeId,
    p_servings: 8,
    p_scheduled_at: null,
    p_notes: 'E2E subrecipe cascade',
  })
  if (created.error) throw created.error
  return stringValue(record(created.data).order_id, 'created.order_id')
}

async function outputLotSnapshot(admin: SupabaseClient, fixture: SubrecipeFixture) {
  const { data, error } = await admin
    .from('v3_inventory_lots')
    .select('id, quantity_remaining, is_preparation, production_order_id')
    .eq('hotel_id', fixture.hotelId)
    .eq('product_id', fixture.outputProductId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((lot) => ({
    id: stringValue(lot.id, 'output_lot.id'),
    quantity_remaining: numberValue(lot.quantity_remaining, 'output_lot.quantity_remaining'),
    is_preparation: lot.is_preparation === true,
    production_order_id: lot.production_order_id,
  }))
}

test.describe('production subrecipe cascade', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')
  test.skip(skipIfNoLiveProduction, 'Set PRODUCTION_E2E_LIVE=1 after Sprint-08 migrations')

  test('produces missing subrecipe stock, consumes parent, preserves atomicity and does not consolidate orders', async () => {
    const admin = adminClient()
    await ensureSubrecipeMigration(admin)
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    let fixture: SubrecipeFixture | null = null

    try {
      fixture = await seedSubrecipeFixture(admin, activeHotel.hotel_id, 0.4)
      const orderId = await createParentOrder(client, fixture)

      const feasibility = await client.rpc('v3_check_production_feasibility', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderId,
      })
      if (feasibility.error) throw feasibility.error
      expect(record(feasibility.data).feasible).toBe(true)
      const chain = objectArray(record(feasibility.data).subrecipe_chain, 'subrecipe_chain')
      expect(chain).toHaveLength(1)
      expect(chain[0]?.will_produce).toBe(true)

      const started = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderId,
      })
      if (started.error) throw started.error
      const startedData = record(started.data)
      const order = record(startedData.order)
      expect(order.status).toBe('in_progress')
      expect(numberValue(order.actual_total_cost, 'actual_total_cost')).toBe(1.2)

      const produced = objectArray(startedData.subrecipe_productions, 'subrecipe_productions')
      expect(produced).toHaveLength(1)
      expect(numberValue(produced[0]?.quantity_produced, 'quantity_produced')).toBe(1)
      expect(numberValue(produced[0]?.unit_cost, 'unit_cost')).toBe(2)

      const outputLots = await outputLotSnapshot(admin, fixture)
      expect(outputLots).toHaveLength(1)
      expect(outputLots[0]?.is_preparation).toBe(true)
      expect(outputLots[0]?.quantity_remaining).toBe(0.4)

      const beforeFailureLots = await outputLotSnapshot(admin, fixture)
      const beforeFailureMovements = await admin
        .from('v3_inventory_movements')
        .select('id')
        .eq('hotel_id', fixture.hotelId)
        .eq('product_id', fixture.outputProductId)
      if (beforeFailureMovements.error) throw beforeFailureMovements.error

      const failedOrderId = await createParentOrder(client, fixture)
      const failedStart = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: failedOrderId,
      })
      expect(failedStart.error?.code).toBe('P0002')
      const detail = record(JSON.parse(failedStart.error?.details ?? '{}'))
      expect(objectArray(detail.deficits, 'deficits')).toHaveLength(1)
      expect(await outputLotSnapshot(admin, fixture)).toEqual(beforeFailureLots)
      const afterFailureMovements = await admin
        .from('v3_inventory_movements')
        .select('id')
        .eq('hotel_id', fixture.hotelId)
        .eq('product_id', fixture.outputProductId)
      if (afterFailureMovements.error) throw afterFailureMovements.error
      expect(afterFailureMovements.data?.length).toBe(beforeFailureMovements.data?.length)

      const replenishment = await admin.from('v3_inventory_lots').insert({
        hotel_id: fixture.hotelId,
        product_id: fixture.terminalProductId,
        quantity_received: 0.8,
        quantity_remaining: 0.8,
        unit_id: fixture.unitId,
        unit_cost: 5,
        received_at: '2026-01-02T00:00:00.000Z',
        notes: 'e2e subrecipe two order stock',
      })
      if (replenishment.error) throw replenishment.error

      const orderA = await createParentOrder(client, fixture)
      const orderB = await createParentOrder(client, fixture)
      const startA = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderA,
      })
      if (startA.error) throw startA.error
      const startB = await client.rpc('v3_start_production', {
        p_hotel_id: fixture.hotelId,
        p_production_order_id: orderB,
      })
      if (startB.error) throw startB.error

      expect(objectArray(record(startA.data).subrecipe_productions, 'startA.productions')).toHaveLength(1)
      expect(objectArray(record(startB.data).subrecipe_productions, 'startB.productions')).toHaveLength(1)
      expect(
        stringValue(
          objectArray(record(startA.data).subrecipe_productions, 'startA.productions')[0]
            ?.production_order_id,
          'startA.sub_order'
        )
      ).not.toBe(
        stringValue(
          objectArray(record(startB.data).subrecipe_productions, 'startB.productions')[0]
            ?.production_order_id,
          'startB.sub_order'
        )
      )
    } finally {
      if (fixture) await cleanupSubrecipeFixture(admin, fixture)
    }
  })

  test('fails with P0017 when subrecipe cascade exceeds depth five', async () => {
    const admin = adminClient()
    await ensureSubrecipeMigration(admin)
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    let fixture: DepthFixture | null = null

    try {
      fixture = await seedDepthFixture(admin, activeHotel.hotel_id)
      const chain = await client.rpc('v3_compute_subrecipe_chain', {
        p_hotel_id: fixture.hotelId,
        p_recipe_id: fixture.rootRecipeId,
        p_target_servings: 1,
        p_depth: 0,
      })

      expect(chain.error?.code).toBe('P0017')
    } finally {
      if (fixture) await cleanupDepthFixture(admin, fixture)
    }
  })
})
