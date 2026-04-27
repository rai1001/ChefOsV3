import type { QueryClient } from '@tanstack/react-query'

export function invalidateInventoryProduct(
  queryClient: QueryClient,
  input: { hotel_id: string; product_id: string }
) {
  queryClient.invalidateQueries({ queryKey: ['inventory', 'snapshot'] })
  queryClient.invalidateQueries({
    queryKey: ['inventory', 'lots', input.hotel_id, input.product_id],
  })
  queryClient.invalidateQueries({
    queryKey: ['inventory', 'movements', input.hotel_id, input.product_id],
  })
  queryClient.invalidateQueries({ queryKey: ['escandallos'] })
}
