import type { QueryClient } from '@tanstack/react-query'

export function invalidateProductionOrder(
  queryClient: QueryClient,
  input: { hotel_id: string; production_order_id: string },
  options?: { inventoryChanged?: boolean }
) {
  queryClient.invalidateQueries({
    queryKey: ['production', 'orders', input.hotel_id],
  })
  queryClient.invalidateQueries({
    queryKey: ['production', 'order', input.hotel_id, input.production_order_id],
  })

  if (options?.inventoryChanged) {
    queryClient.invalidateQueries({ queryKey: ['inventory', 'snapshot'] })
  }
}
