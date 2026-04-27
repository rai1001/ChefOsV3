import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  inventoryLotSchema,
  sortLotsFifo,
  type InventoryLot,
  type InventoryLotDetail,
} from '../domain/lot'
import {
  inventoryMovementSchema,
  type InventoryMovement,
  type InventoryMovementDetail,
} from '../domain/movement'
import {
  filterInventorySnapshot,
  inventorySnapshotItemSchema,
  type InventorySnapshotFilter,
  type InventorySnapshotItem,
} from '../domain/snapshot'

type LotRow = InventoryLot & {
  product?: { name: string | null; sku: string | null } | null
  unit?: { name: string | null; abbreviation: string | null } | null
  goods_receipt_line?: {
    goods_receipt_id: string | null
    lot_number: string | null
  } | null
}

type UnitRow = {
  id: string
  name: string | null
  abbreviation: string | null
}

export async function fetchInventorySnapshot(
  supabase: SupabaseClient,
  filter: InventorySnapshotFilter
): Promise<InventorySnapshotItem[]> {
  const { data, error } = await supabase.rpc('v3_get_inventory_snapshot', {
    p_hotel_id: filter.hotelId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'inventory_snapshot' })

  let rows = ((data ?? []) as Array<Record<string, unknown>>).map((row) =>
    inventorySnapshotItemSchema.parse({
      ...row,
      category_id: row.category_id ?? null,
      last_received_at: row.last_received_at ?? null,
      last_unit_cost: row.last_unit_cost ?? null,
    })
  )

  if (filter.supplierId) {
    const { data: refs, error: refsError } = await supabase
      .from('v3_product_supplier_refs')
      .select('product_id')
      .eq('hotel_id', filter.hotelId)
      .eq('supplier_id', filter.supplierId)

    if (refsError) {
      throw mapSupabaseError(refsError, { resource: 'product_supplier_ref' })
    }

    const productIds = new Set((refs ?? []).map((ref) => ref.product_id))
    rows = rows.filter((row) => productIds.has(row.product_id))
  }

  return filterInventorySnapshot(rows, {
    categoryId: filter.categoryId,
    onlyWithStock: filter.onlyWithStock,
  })
}

export async function fetchProductLots(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<InventoryLotDetail[]> {
  const { data, error } = await supabase
    .from('v3_inventory_lots')
    .select(
      `
        *,
        product:v3_products!v3_inventory_lots_product_id_fkey(name, sku),
        unit:v3_units_of_measure!v3_inventory_lots_unit_id_fkey(name, abbreviation),
        goods_receipt_line:v3_goods_receipt_lines!v3_inventory_lots_goods_receipt_line_id_fkey(
          goods_receipt_id,
          lot_number
        )
      `
    )
    .eq('hotel_id', hotelId)
    .eq('product_id', productId)
    .gt('quantity_remaining', 0)
    .order('received_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw mapSupabaseError(error, { resource: 'inventory_lot' })

  return sortLotsFifo(((data as LotRow[]) ?? []).map(toLotDetail))
}

export async function fetchProductMovements(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string,
  pagination?: { limit?: number; offset?: number }
): Promise<InventoryMovementDetail[]> {
  const { data, error } = await supabase.rpc('v3_get_inventory_movements', {
    p_hotel_id: hotelId,
    p_product_id: productId,
    p_limit: pagination?.limit ?? 50,
    p_offset: pagination?.offset ?? 0,
  })

  if (error) throw mapSupabaseError(error, { resource: 'inventory_movement' })

  const movements = ((data ?? []) as InventoryMovement[]).map((row) =>
    inventoryMovementSchema.parse(row)
  )
  const unitIds = [...new Set(movements.map((movement) => movement.unit_id))]
  const unitsById = new Map<string, UnitRow>()

  if (unitIds.length > 0) {
    const { data: units, error: unitsError } = await supabase
      .from('v3_units_of_measure')
      .select('id, name, abbreviation')
      .eq('hotel_id', hotelId)
      .in('id', unitIds)

    if (unitsError) throw mapSupabaseError(unitsError, { resource: 'unit' })
    for (const unit of (units ?? []) as UnitRow[]) {
      unitsById.set(unit.id, unit)
    }
  }

  return movements.map((movement) => {
    const unit = unitsById.get(movement.unit_id)
    return {
      ...movement,
      unit_name: unit?.name ?? null,
      unit_abbreviation: unit?.abbreviation ?? null,
    }
  })
}

function toLotDetail(row: LotRow): InventoryLotDetail {
  const { product, unit, goods_receipt_line, ...lot } = row
  const parsedLot = inventoryLotSchema.parse(lot)

  return {
    ...parsedLot,
    product_name: product?.name ?? null,
    product_sku: product?.sku ?? null,
    unit_name: unit?.name ?? null,
    unit_abbreviation: unit?.abbreviation ?? null,
    goods_receipt_id: goods_receipt_line?.goods_receipt_id ?? null,
    lot_number: goods_receipt_line?.lot_number ?? null,
  }
}
