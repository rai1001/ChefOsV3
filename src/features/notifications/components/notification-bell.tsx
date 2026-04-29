'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '../application/use-notifications'
import { NotificationListItem } from './notification-list-item'

interface Props {
  hotelId: string
  initialUnreadCount?: number
}

const DROPDOWN_LIMIT = 20

export function NotificationBell({ hotelId, initialUnreadCount }: Props) {
  const unreadQuery = useUnreadNotificationsCount(hotelId)
  const notificationsQuery = useNotifications({ hotelId, unreadOnly: false, limit: DROPDOWN_LIMIT })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = unreadQuery.data ?? initialUnreadCount ?? 0
  const items = notificationsQuery.data ?? []
  const hasUnread = items.some((n) => n.read_at === null)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className={cn(
            'relative inline-flex h-10 w-10 items-center justify-center rounded border',
            'hover:bg-[color:var(--color-bg-hover)]'
          )}
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="urgent"
              className="absolute -right-1 -top-1 min-w-[20px] px-1 text-[10px]"
              aria-label={`${unreadCount} sin leer`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="w-[380px] max-h-[480px] overflow-auto rounded border p-2 shadow-lg"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-2">
            <span className="kpi-label">
              Notificaciones {unreadCount > 0 && `· ${unreadCount} sin leer`}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={!hasUnread || markAllRead.isPending}
              onClick={() => markAllRead.mutate({ hotel_id: hotelId })}
            >
              Marcar todas
            </Button>
          </div>

          {notificationsQuery.isLoading && (
            <p className="px-3 py-4 text-sm text-[color:var(--color-text-muted)]">Cargando…</p>
          )}

          {!notificationsQuery.isLoading && items.length === 0 && (
            <p className="px-3 py-4 text-sm text-[color:var(--color-text-muted)]">
              No hay notificaciones todavía.
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

          <div className="mt-2 border-t pt-2 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <Button asChild size="sm" variant="ghost">
              <Link href="/notifications">Ver todas</Link>
            </Button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
