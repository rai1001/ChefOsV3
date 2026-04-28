import { createClient } from '@/lib/supabase/server'
import { fetchWarehouse, fetchWarehouses } from '../infrastructure/warehouse-queries'

export async function getWarehousesServer(hotelId: string) {
  const supabase = await createClient()
  return fetchWarehouses(supabase, { hotelId, activeOnly: true })
}

export async function getWarehouseServer(hotelId: string, warehouseId: string) {
  const supabase = await createClient()
  return fetchWarehouse(supabase, hotelId, warehouseId)
}
