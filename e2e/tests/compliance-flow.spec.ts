import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loginAs, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

const skipIfNoLiveCompliance = process.env.COMPLIANCE_E2E_LIVE !== '1'

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface ComplianceFixture {
  hotelId: string
  unitId: string
  productId: string
  supplierId: string
  purchaseOrderId: string
  purchaseOrderLineId: string
  goodsReceiptId: string
  goodsReceiptLineId: string
  lotId: string
  equipmentId: string
  cleaningAreaId: string
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
    p_tenant_name: `E2E Compliance ${suffix}`,
    p_hotel_name: `E2E Compliance ${suffix}`,
    p_hotel_slug: `e2e-compliance-${suffix}`,
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

async function ensureComplianceMigration(client: SupabaseClient, hotelId: string) {
  const overview = await client.rpc('v3_get_compliance_overview', { p_hotel_id: hotelId })
  if (overview.error?.code === 'PGRST202') {
    test.skip(true, 'Requires migration 00082_v3_compliance_appcc applied to Supabase')
  }
  if (overview.error) throw overview.error
}

async function seedSentPurchaseOrder(
  client: SupabaseClient,
  admin: SupabaseClient,
  hotelId: string
) {
  const suffix = crypto.randomUUID().slice(0, 8)
  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Unidad compliance E2E ${suffix}`,
      abbreviation: `cc${suffix.slice(0, 6)}`,
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
      name: `Producto compliance E2E ${suffix}`,
      sku: `CMP-E2E-${suffix}`,
      default_unit_id: unit.data.id,
      allergens: [],
      storage_type: 'refrigerated',
      is_active: true,
    })
    .select('id')
    .single()
  if (product.error) throw product.error

  const supplier = await admin
    .from('v3_suppliers')
    .insert({
      hotel_id: hotelId,
      name: `Proveedor compliance E2E ${suffix}`,
      rating: 5,
      delivery_days: [],
      is_active: true,
    })
    .select('id')
    .single()
  if (supplier.error) throw supplier.error

  const offer = await admin.from('v3_supplier_offers').insert({
    hotel_id: hotelId,
    supplier_id: supplier.data.id,
    product_id: product.data.id,
    unit_id: unit.data.id,
    unit_price: 4,
    is_preferred: true,
  })
  if (offer.error) throw offer.error

  const request = await client.rpc('v3_create_purchase_request', {
    p_hotel_id: hotelId,
    p_origin: 'manual',
    p_needed_date: '2099-01-01',
    p_event_id: null,
    p_notes: null,
    p_lines: [
      {
        product_id: product.data.id,
        quantity: 2,
        unit_id: unit.data.id,
        department: 'economato',
      },
    ],
  })
  if (request.error) throw request.error
  const requestId = stringValue(request.data, 'purchase_request_id')

  const approved = await client.rpc('v3_transition_purchase_request', {
    p_hotel_id: hotelId,
    p_request_id: requestId,
    p_new_status: 'approved',
    p_reason: null,
  })
  if (approved.error) throw approved.error

  const generated = await client.rpc('v3_generate_purchase_order', {
    p_hotel_id: hotelId,
    p_pr_ids: [requestId],
  })
  if (generated.error) throw generated.error
  const purchaseOrderIds = record(generated.data).purchase_order_ids
  if (!Array.isArray(purchaseOrderIds)) throw new Error('Expected purchase_order_ids')
  const purchaseOrderId = stringValue(purchaseOrderIds[0], 'purchase_order_ids[0]')

  const sent = await client.rpc('v3_transition_purchase_order', {
    p_hotel_id: hotelId,
    p_order_id: purchaseOrderId,
    p_new_status: 'sent',
    p_reason: null,
  })
  if (sent.error) throw sent.error

  const line = await admin
    .from('v3_purchase_order_lines')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('purchase_order_id', purchaseOrderId)
    .single()
  if (line.error) throw line.error

  return {
    unitId: stringValue(unit.data.id, 'unit.id'),
    productId: stringValue(product.data.id, 'product.id'),
    supplierId: stringValue(supplier.data.id, 'supplier.id'),
    purchaseOrderId,
    purchaseOrderLineId: stringValue(line.data.id, 'purchase_order_line.id'),
  }
}

async function seedComplianceFixture(
  client: SupabaseClient,
  admin: SupabaseClient,
  hotelId: string
): Promise<ComplianceFixture> {
  const po = await seedSentPurchaseOrder(client, admin, hotelId)
  const received = await client.rpc('v3_receive_goods', {
    p_hotel_id: hotelId,
    p_purchase_order_id: po.purchaseOrderId,
    p_lines: [
      {
        purchase_order_line_id: po.purchaseOrderLineId,
        quantity_received: 2,
        unit_price: 4,
        quality_status: 'accepted',
        lot_number: `APPCC-${crypto.randomUUID().slice(0, 8)}`,
        expiry_date: '2099-02-01',
      },
    ],
  })
  if (received.error) throw received.error
  const goodsReceiptId = stringValue(record(received.data).goods_receipt_id, 'goods_receipt_id')

  const grLine = await admin
    .from('v3_goods_receipt_lines')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('goods_receipt_id', goodsReceiptId)
    .single()
  if (grLine.error) throw grLine.error

  const existingLot = await admin
    .from('v3_inventory_lots')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('goods_receipt_line_id', grLine.data.id)
    .single()
  if (existingLot.error) throw existingLot.error

  const equipment = await admin
    .from('v3_compliance_equipment')
    .insert({
      hotel_id: hotelId,
      name: `Cámara compliance E2E ${crypto.randomUUID().slice(0, 8)}`,
      equipment_type: 'fridge',
      min_temperature_c: 0,
      max_temperature_c: 5,
      is_active: true,
    })
    .select('id')
    .single()
  if (equipment.error) throw equipment.error

  const cleaningArea = await admin
    .from('v3_compliance_cleaning_areas')
    .insert({
      hotel_id: hotelId,
      name: `Limpieza compliance E2E ${crypto.randomUUID().slice(0, 8)}`,
      frequency: 'daily',
      is_active: true,
    })
    .select('id')
    .single()
  if (cleaningArea.error) throw cleaningArea.error

  return {
    hotelId,
    ...po,
    goodsReceiptId,
    goodsReceiptLineId: stringValue(grLine.data.id, 'goods_receipt_line.id'),
    lotId: stringValue(existingLot.data.id, 'lot.id'),
    equipmentId: stringValue(equipment.data.id, 'equipment.id'),
    cleaningAreaId: stringValue(cleaningArea.data.id, 'cleaning_area.id'),
  }
}

async function cleanupFixture(admin: SupabaseClient, fixture: ComplianceFixture) {
  await admin.from('v3_compliance_cleaning_checks').delete().eq('hotel_id', fixture.hotelId).eq('area_id', fixture.cleaningAreaId)
  await admin.from('v3_compliance_cleaning_areas').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.cleaningAreaId)
  await admin.from('v3_compliance_temperature_logs').delete().eq('hotel_id', fixture.hotelId).eq('equipment_id', fixture.equipmentId)
  await admin.from('v3_compliance_equipment').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.equipmentId)
  await admin.from('v3_compliance_quality_checks').delete().eq('hotel_id', fixture.hotelId).eq('goods_receipt_id', fixture.goodsReceiptId)
  await admin.from('v3_inventory_lots').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.lotId)
  await admin.from('v3_goods_receipts').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.goodsReceiptId)
  await admin.from('v3_purchase_orders').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.purchaseOrderId)
  await admin.from('v3_suppliers').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.supplierId)
  await admin.from('v3_products').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.productId)
  await admin.from('v3_units_of_measure').delete().eq('hotel_id', fixture.hotelId).eq('id', fixture.unitId)
}

test.describe('compliance APPCC flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')
  test.skip(skipIfNoLiveCompliance, 'Set COMPLIANCE_E2E_LIVE=1 after Sprint-10 migration 00082')

  test('cubre quality, temperature, cleaning y traceability live', async ({ page }) => {
    const admin = adminClient()
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)
    await ensureComplianceMigration(client, activeHotel.hotel_id)
    let fixture: ComplianceFixture | null = null

    try {
      fixture = await seedComplianceFixture(client, admin, activeHotel.hotel_id)

      const quality = await client.rpc('v3_record_goods_receipt_quality_check', {
        p_hotel_id: fixture.hotelId,
        p_goods_receipt_id: fixture.goodsReceiptId,
        p_temperature_c: 3,
        p_temperature_ok: true,
        p_packaging_ok: true,
        p_expiry_ok: true,
        p_notes: 'E2E quality ok',
      })
      if (quality.error) throw quality.error

      const temperature = await client.rpc('v3_log_equipment_temperature', {
        p_hotel_id: fixture.hotelId,
        p_equipment_id: fixture.equipmentId,
        p_temperature_c: 9,
        p_notes: 'E2E out of range',
      })
      if (temperature.error) throw temperature.error

      const cleaning = await client.rpc('v3_complete_cleaning_check', {
        p_hotel_id: fixture.hotelId,
        p_area_id: fixture.cleaningAreaId,
        p_due_date: new Date().toISOString().slice(0, 10),
        p_notes: 'E2E cleaning ok',
      })
      if (cleaning.error) throw cleaning.error

      const overview = await client.rpc('v3_get_compliance_overview', {
        p_hotel_id: fixture.hotelId,
      })
      if (overview.error) throw overview.error
      expect(record(record(overview.data).temperature).out_of_range_24h).toBeGreaterThanOrEqual(1)
      expect(record(record(overview.data).cleaning).completed_due).toBeGreaterThanOrEqual(1)

      const trace = await client.rpc('v3_trace_lot', {
        p_hotel_id: fixture.hotelId,
        p_lot_id: fixture.lotId,
      })
      if (trace.error) throw trace.error
      expect(stringValue(record(record(trace.data).lot).id, 'trace.lot.id')).toBe(fixture.lotId)

      await loginAs(page)
      await page.goto('/compliance')
      if (page.url().includes('/onboarding')) test.skip(true, 'Requires active hotel')
      await expect(page.getByRole('heading', { name: /appcc/i })).toBeVisible()
      await page.goto('/compliance/traceability')
      await page.getByPlaceholder('UUID de lote').fill(fixture.lotId)
      await page.getByRole('button', { name: /trazar/i }).click()
      await expect(page.getByText(fixture.lotId.slice(0, 8))).toBeVisible()
    } finally {
      if (fixture) await cleanupFixture(admin, fixture)
    }
  })
})
