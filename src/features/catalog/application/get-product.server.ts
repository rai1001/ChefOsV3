import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchProduct } from '../infrastructure/product-queries'
import type { Product } from '../domain/types'

export async function getProductServer(
  hotelId: string,
  productId: string
): Promise<Product> {
  const supabase = await createClient()
  return fetchProduct(supabase, hotelId, productId)
}
