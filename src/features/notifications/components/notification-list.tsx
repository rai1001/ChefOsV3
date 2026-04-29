'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../application/use-notifications'
import { NotificationListItem } from './notification-list-item'

interface Props {
  hotelId: string
  initialUnreadOnly?: boolean
}

export function NotificationList({ hotelId, initialUnreadOnly = false }: Props) {
  const [unreadOnly, setUnreadOnly] = useState(initialUnreadOnly)
  const notificationsQuery = useNotifications({ hotelId, unreadOnly, limit: 100 })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items = notificationsQuery.data ?? []
  const hasUnread = items.some((n) => n.read_at === null)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={unreadOnly ? 'secondary' : 'primary'}
          onClick={() => setUnreadOnly(false)}
        >
          Todas
        </Button>
        <Button
          size="sm"
          variant={unreadOnly ? 'primary' : 'secondary'}
          onClick={() => setUnreadOnly(true)}
        >
          No leídas
        </Button>
        <div className="ml-auto">
          <Button
            size="sm"
            variant="ghost"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => markAllRead.mutate({ hotel_id: hotelId })}
          >
            Marcar todas leídas
          </Button>
        </div>
      </div>

      {notificationsQuery.isLoading && (
        <p className="text-sm text-[color:var(--color-text-muted)]">Cargando…</p>
      )}

      {notificationsQuery.isError && (
        <p className="text-sm text-[color:var(--color-danger-fg)]">
          No se pudieron cargar las notificaciones.
        </p>
      )}

      {!notificationsQuery.isLoading && items.length === 0 && (
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {unreadOnly ? 'No hay notificaciones sin leer.' : 'No hay notificaciones.'}
        </p>
      )}

      <div className="space-y-2">
        {items.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            isMarking={markRead.isPending}
            onMarkRead={(notificationId) =>
              markRead.mutate({ hotel_id: hotelId, notification_id: notificationId })
            }
          />
        ))}
      </div>
    </div>
  )
}
