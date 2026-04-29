'use client'

import { useActiveHotel } from '@/features/identity'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

export function NotificationBellShell() {
  const active = useActiveHotel()
  const hotelId = active.data?.hotel_id
  if (!hotelId) return null
  return <NotificationBell hotelId={hotelId} />
}
