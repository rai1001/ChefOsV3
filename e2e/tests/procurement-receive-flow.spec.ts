import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY

interface ActiveHotel {
  hotel_id: string
  tenant_id: string
}

interface PurchaseOrderFixture {
  hotelId: string
  productId: string
  unitId: string
  supplierId: string
  purchaseOrderId: string
  purchaseOrderLineId: string
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

function purchaseOrderIds(value: unknown): string[] {
  const ids = record(value).purchase_order_ids
  if (!Array.isArray(ids)) throw new Error('Expected purchase_order_ids array')
  return ids.map((id) => stringValue(id, 'purchase_order_ids[]'))
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

async function ensureGoodsReceiptsMigration(admin: SupabaseClient) {
  const { error } = await admin.from('v3_goods_receipts').select('id').limit(1)
  if (error?.code === 'PGRST205') {
    test.skip(true, 'Requires migration 00064_v3_procurement_gr applied to Supabase')
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
    p_tenant_name: `E2E Procurement ${suffix}`,
    p_hotel_name: `E2E Procurement ${suffix}`,
    p_hotel_slug: `e2e-procurement-${suffix}`,
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

async function seedCatalog(admin: SupabaseClient, hotelId: string, unitPrice: number) {
  const suffix = crypto.randomUUID().slice(0, 8)
  const unit = await admin
    .from('v3_units_of_measure')
    .insert({
      hotel_id: hotelId,
      name: `Kilogramo E2E ${suffix}`,
      abbreviation: 'kg',
      unit_type: 'weight',
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
      name: `Solomillo E2E ${suffix}`,
      sku: `SOL-E2E-${suffix}`,
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
      name: `Carniceria E2E ${suffix}`,
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
    unit_price: unitPrice,
    is_preferred: true,
  })
  if (offer.error) throw offer.error

  return {
    unitId: stringValue(unit.data.id, 'unit.id'),
    productId: stringValue(product.data.id, 'product.id'),
    supplierId: stringValue(supplier.data.id, 'supplier.id'),
  }
}

async function seedSentPurchaseOrder(
  client: SupabaseClient,
  admin: SupabaseClient,
  hotelId: string,
  quantity: number,
  unitPrice: number
): Promise<PurchaseOrderFixture> {
  const catalog = await seedCatalog(admin, hotelId, unitPrice)

  const created = await client.rpc('v3_create_purchase_request', {
    p_hotel_id: hotelId,
    p_origin: 'manual',
    p_needed_date: '2099-01-01',
    p_event_id: null,
    p_notes: null,
    p_lines: [
      {
        product_id: catalog.productId,
        quantity,
        unit_id: catalog.unitId,
        department: 'economato',
      },
    ],
  })
  if (created.error) throw created.error
  const requestId = stringValue(created.data, 'purchase_request_id')

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
  const [purchaseOrderId] = purchaseOrderIds(generated.data)
  if (!purchaseOrderId) throw new Error('Expected generated purchase order')

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
    hotelId,
    ...catalog,
    purchaseOrderId,
    purchaseOrderLineId: stringValue(line.data.id, 'purchase_order_line.id'),
  }
}

async function seedForeignHotel(admin: SupabaseClient): Promise<string> {
  const suffix = crypto.randomUUID().slice(0, 8)
  const tenant = await admin
    .from('v3_tenants')
    .insert({ name: `E2E Foreign ${suffix}` })
    .select('id')
    .single()
  if (tenant.error) throw tenant.error

  const hotel = await admin
    .from('v3_hotels')
    .insert({
      tenant_id: tenant.data.id,
      name: `E2E Foreign Hotel ${suffix}`,
      slug: `e2e-foreign-${suffix}`,
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      is_active: true,
    })
    .select('id')
    .single()
  if (hotel.error) throw hotel.error
  return stringValue(hotel.data.id, 'foreign_hotel.id')
}

test.describe('procurement receive flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars and service_role')

  test('recibe parcial, completa, rechaza y protege cross-tenant', async () => {
    const admin = adminClient()
    await ensureGoodsReceiptsMigration(admin)
    const client = await authenticatedClient()
    const activeHotel = await ensureActiveHotel(client)

    const fixture = await seedSentPurchaseOrder(client, admin, activeHotel.hotel_id, 3, 12)

    const partial = await client.rpc('v3_receive_goods', {
      p_hotel_id: fixture.hotelId,
      p_purchase_order_id: fixture.purchaseOrderId,
      p_lines: [
        {
          purchase_order_line_id: fixture.purchaseOrderLineId,
          quantity_received: 1.5,
          unit_price: 12,
          quality_status: 'accepted',
        },
      ],
    })
    if (partial.error) throw partial.error
    expect(record(partial.data).new_po_status).toBe('received_partial')

    const overReceive = await client.rpc('v3_receive_goods', {
      p_hotel_id: fixture.hotelId,
      p_purchase_order_id: fixture.purchaseOrderId,
      p_lines: [
        {
          purchase_order_line_id: fixture.purchaseOrderLineId,
          quantity_received: 2,
          unit_price: 12,
          quality_status: 'accepted',
        },
      ],
    })
    expect(overReceive.error?.message).toContain('exceeds pending quantity')

    const complete = await client.rpc('v3_receive_goods', {
      p_hotel_id: fixture.hotelId,
      p_purchase_order_id: fixture.purchaseOrderId,
      p_lines: [
        {
          purchase_order_line_id: fixture.purchaseOrderLineId,
          quantity_received: 1.5,
          unit_price: 12.5,
          quality_status: 'accepted',
        },
      ],
    })
    if (complete.error) throw complete.error
    expect(record(complete.data).new_po_status).toBe('received_complete')
    expect(numberValue(record(complete.data).price_changes_logged, 'price_changes_logged')).toBe(1)

    const priceLog = await admin
      .from('v3_price_change_log')
      .select('id', { count: 'exact', head: true })
      .eq('hotel_id', fixture.hotelId)
      .eq('product_id', fixture.productId)
      .eq('source', 'goods_receipt')
    if (priceLog.error) throw priceLog.error
    expect(priceLog.count).toBeGreaterThanOrEqual(1)

    const rejectedFixture = await seedSentPurchaseOrder(client, admin, activeHotel.hotel_id, 1, 8)
    const rejected = await client.rpc('v3_receive_goods', {
      p_hotel_id: rejectedFixture.hotelId,
      p_purchase_order_id: rejectedFixture.purchaseOrderId,
      p_lines: [
        {
          purchase_order_line_id: rejectedFixture.purchaseOrderLineId,
          quantity_received: 1,
          unit_price: 8,
          quality_status: 'rejected',
          rejection_reason: 'Temperatura fuera de rango',
        },
      ],
    })
    if (rejected.error) throw rejected.error
    expect(record(rejected.data).new_po_status).toBe('received_partial')

    const rejectedLine = await admin
      .from('v3_goods_receipt_lines')
      .select('quality_status,rejection_reason')
      .eq('hotel_id', rejectedFixture.hotelId)
      .eq('purchase_order_line_id', rejectedFixture.purchaseOrderLineId)
      .single()
    if (rejectedLine.error) throw rejectedLine.error
    expect(rejectedLine.data.quality_status).toBe('rejected')
    expect(rejectedLine.data.rejection_reason).toBe('Temperatura fuera de rango')

    const foreignHotelId = await seedForeignHotel(admin)
    const crossTenant = await client.rpc('v3_receive_goods', {
      p_hotel_id: foreignHotelId,
      p_purchase_order_id: rejectedFixture.purchaseOrderId,
      p_lines: [
        {
          purchase_order_line_id: rejectedFixture.purchaseOrderLineId,
          quantity_received: 1,
          unit_price: 8,
          quality_status: 'accepted',
        },
      ],
    })
    expect(crossTenant.error).not.toBeNull()

    const hiddenRows = await client
      .from('v3_goods_receipts')
      .select('id')
      .eq('hotel_id', foreignHotelId)
    if (hiddenRows.error) throw hiddenRows.error
    expect(hiddenRows.data).toEqual([])
  })
})
