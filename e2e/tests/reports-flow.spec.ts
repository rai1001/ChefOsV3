import { readFile } from 'node:fs/promises'
import { expect, test, type Download } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loginAs, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

const skipIfNoLiveReporting = process.env.PRODUCTION_E2E_LIVE !== '1'

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface ReportsFixture {
  hotelId: string
  unitId: string
  categoryId: string
  productId: string
  productName: string
  recipeId: string
  recipeName: string
  productionOrderId: string
  lotId: string
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

function adminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function downloadText(downloadPromise: Promise<Download>) {
  const download = await downloadPromise
  const path = await download.path()
  if (!path) throw new Error('Expected downloaded file path')
  return readFile(path, 'utf8')
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

async function ensureReportingMigration(client: SupabaseClient, hotelId: string) {
  const { error } = await client.rpc('v3_report_stock_health', {
    p_hotel_id: hotelId,
  })
  if (error?.code === 'PGRST202') {
    test.skip(true, 'Requires Sprint-09 reporting migrations applied to Supabase')
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
    p_tenant_name: `E2E Reports ${suffix}`,
    p_hotel_name: `E2E Reports ${suffix}`,
    p_hotel_slug: `e2e-reports-${suffix}`,
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

async function seedReportsFixture(
  admin: SupabaseClient,
  hotelId: string
): Promise<ReportsFixture> {
  const suffix = crypto.randomUUID().slice(0, 8)
  const productName = `Producto reporting E2E ${suffix}`
  const recipeName = `Receta reporting E2E ${suffix}`

  const category = await admin
    .from('v3_product_categories')
    .insert({ hotel_id: hotelId, name: `Categoria reporting E2E ${suffix}` })
    .select('id')
    .single()
  if (category.error) throw category.error

  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Unidad reporting E2E ${suffix}`,
      abbreviation: `rp${suffix.slice(0, 6)}`,
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
      name: productName,
      sku: `REP-E2E-${suffix}`,
      default_unit_id: unit.data.id,
      category_id: category.data.id,
      allergens: [],
      storage_type: 'ambient',
      is_active: true,
    })
    .select('id')
    .single()
  if (product.error) throw product.error

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

  const order = await admin
    .from('v3_production_orders')
    .insert({
      hotel_id: hotelId,
      recipe_id: recipe.data.id,
      servings: 20,
      status: 'completed',
      scheduled_at: '2026-04-14T08:00:00.000Z',
      started_at: '2026-04-15T08:00:00.000Z',
      completed_at: '2026-04-15T10:00:00.000Z',
      estimated_total_cost: 20,
      actual_total_cost: 30,
      notes: `E2E reporting ${suffix}`,
    })
    .select('id')
    .single()
  if (order.error) throw order.error

  const orderLine = await admin.from('v3_production_order_lines').insert({
    hotel_id: hotelId,
    production_order_id: order.data.id,
    product_id: product.data.id,
    quantity_required: 3,
    unit_id: unit.data.id,
    estimated_unit_cost: 4,
    actual_consumed_quantity: 3,
    actual_total_cost: 30,
    weighted_unit_cost: 10,
  })
  if (orderLine.error) throw orderLine.error

  const lot = await admin
    .from('v3_inventory_lots')
    .insert({
      hotel_id: hotelId,
      product_id: product.data.id,
      quantity_received: 10,
      quantity_remaining: 7,
      unit_id: unit.data.id,
      unit_cost: 2,
      received_at: '2026-04-01T00:00:00.000Z',
      expires_at: '2026-05-01T00:00:00.000Z',
      notes: `E2E reporting lot ${suffix}`,
    })
    .select('id')
    .single()
  if (lot.error) throw lot.error

  const movements = await admin.from('v3_inventory_movements').insert([
    {
      hotel_id: hotelId,
      product_id: product.data.id,
      lot_id: lot.data.id,
      kind: 'consume',
      quantity: 3,
      unit_id: unit.data.id,
      unit_cost: 10,
      origin: { source: 'e2e_reports', production_order_id: order.data.id },
      recipe_id: recipe.data.id,
      notes: `E2E reporting consume ${suffix}`,
      created_at: '2026-04-15T08:30:00.000Z',
    },
    {
      hotel_id: hotelId,
      product_id: product.data.id,
      lot_id: lot.data.id,
      kind: 'waste',
      quantity: 1,
      unit_id: unit.data.id,
      unit_cost: 2,
      origin: { source: 'e2e_reports' },
      notes: `E2E reporting waste ${suffix}`,
      created_at: '2026-04-16T08:30:00.000Z',
    },
  ])
  if (movements.error) throw movements.error

  const priceChange = await admin.from('v3_price_change_log').insert({
    hotel_id: hotelId,
    product_id: product.data.id,
    old_price: 2,
    new_price: 3,
    source: 'e2e_reports',
    delta_pct: 50,
    detected_at: '2026-04-17T08:30:00.000Z',
    created_at: '2026-04-17T08:30:00.000Z',
  })
  if (priceChange.error) throw priceChange.error

  return {
    hotelId,
    unitId: stringValue(unit.data.id, 'unit.id'),
    categoryId: stringValue(category.data.id, 'category.id'),
    productId: stringValue(product.data.id, 'product.id'),
    productName,
    recipeId: stringValue(recipe.data.id, 'recipe.id'),
    recipeName,
    productionOrderId: stringValue(order.data.id, 'order.id'),
    lotId: stringValue(lot.data.id, 'lot.id'),
  }
}

async function cleanupReportsFixture(admin: SupabaseClient, fixture: ReportsFixture) {
  await admin
    .from('v3_inventory_movements')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('product_id', fixture.productId)
  await admin
    .from('v3_price_change_log')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('product_id', fixture.productId)
  await admin
    .from('v3_inventory_lots')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.lotId)
  await admin
    .from('v3_production_orders')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.productionOrderId)
  await admin
    .from('v3_recipes')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.recipeId)
  await admin
    .from('v3_products')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.productId)
  await admin
    .from('v3_product_categories')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.categoryId)
  await admin
    .from('v3_units_of_measure')
    .delete()
    .eq('hotel_id', fixture.hotelId)
    .eq('id', fixture.unitId)
}

test.describe('reports flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')
  test.skip(skipIfNoLiveReporting, 'Set PRODUCTION_E2E_LIVE=1 after Sprint-09 migrations')

  test('renders all reporting pages and exports CSV for table reports', async ({ page }) => {
    const admin = adminClient()
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    await ensureReportingMigration(client, activeHotel.hotel_id)
    let fixture: ReportsFixture | null = null

    try {
      fixture = await seedReportsFixture(admin, activeHotel.hotel_id)
      const query = 'from=2026-04-01&to=2026-04-30'

      await loginAs(page)
      await page.goto(`/reports?${query}`)
      if (page.url().includes('/onboarding')) test.skip(true, 'Requires active hotel')

      await expect(page.getByRole('heading', { name: /informes/i })).toBeVisible()
      await expect(page.getByText('Food cost por receta')).toBeVisible()
      await expect(page.getByText('Stock health')).toBeVisible()

      await page.goto(`/reports/food-cost?${query}`)
      await expect(page.getByRole('heading', { name: /food cost por receta/i })).toBeVisible()
      await expect(page.getByText(fixture.recipeName)).toBeVisible()
      const foodCostDownload = page.waitForEvent('download')
      await page.getByRole('link', { name: /exportar csv/i }).click()
      const foodCostCsv = await downloadText(foodCostDownload)
      expect(foodCostCsv).toContain('recipe_name')
      expect(foodCostCsv).toContain(fixture.recipeName)

      await page.goto(`/reports/waste?${query}`)
      await expect(page.getByRole('heading', { name: /mermas/i })).toBeVisible()
      await expect(page.getByText(fixture.productName)).toBeVisible()
      const wasteDownload = page.waitForEvent('download')
      await page.getByRole('link', { name: /exportar csv/i }).click()
      const wasteCsv = await downloadText(wasteDownload)
      expect(wasteCsv).toContain('product_name')
      expect(wasteCsv).toContain(fixture.productName)

      await page.goto(`/reports/top-products?${query}&dimension=consumed_value`)
      await expect(page.getByRole('heading', { name: /top productos/i })).toBeVisible()
      await expect(page.getByText(fixture.productName)).toBeVisible()

      await page.goto(`/reports/price-changes?${query}`)
      await expect(page.getByRole('heading', { name: /variaci[oó]n de precio/i })).toBeVisible()
      await expect(page.getByText(fixture.productName)).toBeVisible()
      const priceDownload = page.waitForEvent('download')
      await page.getByRole('link', { name: /exportar csv/i }).click()
      const priceCsv = await downloadText(priceDownload)
      expect(priceCsv).toContain('product_name')
      expect(priceCsv).toContain(fixture.productName)

      await page.goto('/reports/stock-health')
      await expect(page.getByRole('heading', { name: /stock health/i })).toBeVisible()
      await expect(page.getByText(fixture.productName)).toBeVisible()
    } finally {
      if (fixture) await cleanupReportsFixture(admin, fixture)
    }
  })
})
