import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchSupplier } from '../infrastructure/supplier-queries'
import type { Supplier } from '../domain/types'

export async function getSupplierServer(
  hotelId: string,
  supplierId: string
): Promise<Supplier> {
  const supabase = await createClient()
  return fetchSupplier(supabase, hotelId, supplierId)
}
