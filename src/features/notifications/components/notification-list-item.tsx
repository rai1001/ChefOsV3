'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_SEVERITY_LABELS,
  type Notification,
} from '../domain/types'
import { SEVERITY_BADGE_VARIANT, formatRelativeTime } from './severity-helpers'

interface Props {
  notification: Notification
  onMarkRead?: (notificationId: string) => void
  isMarking?: boolean
}

export function NotificationListItem({ notification, onMarkRead, isMarking }: Props) {
  const isRead = notification.read_at !== null
  const variant = SEVERITY_BADGE_VARIANT[notification.severity]

  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded border px-4 py-3 text-sm',
        !isRead && 'border-l-4'
      )}
      style={{
        borderColor: 'var(--color-border)',
        background: isRead ? 'transparent' : 'var(--color-bg-card)',
      }}
      data-read={isRead}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{NOTIFICATION_SEVERITY_LABELS[notification.severity]}</Badge>
          <span className="kpi-label">
            {NOTIFICATION_CATEGORY_LABELS[notification.category]}
          </span>
        </div>
        <span className="kpi-label">{formatRelativeTime(notification.created_at)}</span>
      </div>

      <h3 className="font-medium">{notification.title}</h3>
      <p className="text-[color:var(--color-text-secondary)]">{notification.body}</p>

      <div className="flex items-center gap-2">
        {notification.link && (
          <Button asChild size="sm" variant="secondary">
            <Link href={notification.link}>Ver detalle</Link>
          </Button>
        )}
        {!isRead && onMarkRead && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isMarking}
            onClick={() => onMarkRead(notification.id)}
          >
            Marcar leída
          </Button>
        )}
      </div>
    </article>
  )
}
