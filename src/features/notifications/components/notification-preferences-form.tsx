'use client'

import { Button } from '@/components/ui/button'
import {
  useNotificationPreferences,
  useUpsertNotificationPreference,
} from '../application/use-notifications'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  type NotificationCategory,
} from '../domain/types'

interface Props {
  hotelId: string
}

export function NotificationPreferencesForm({ hotelId }: Props) {
  const preferencesQuery = useNotificationPreferences(hotelId)
  const upsert = useUpsertNotificationPreference()

  const prefs = preferencesQuery.data

  if (preferencesQuery.isLoading) {
    return <p className="text-sm text-[color:var(--color-text-muted)]">Cargando preferencias…</p>
  }

  if (preferencesQuery.isError || !prefs) {
    return (
      <p className="text-sm text-[color:var(--color-danger-fg)]">
        No se pudieron cargar las preferencias.
      </p>
    )
  }

  const togglePreference = (category: NotificationCategory) => {
    upsert.mutate({
      hotel_id: hotelId,
      category,
      in_app_enabled: !prefs[category],
    })
  }

  return (
    <div className="space-y-3">
      {NOTIFICATION_CATEGORIES.map((category) => {
        const enabled = prefs[category]
        return (
          <div
            key={category}
            className="flex items-center justify-between gap-4 rounded border px-4 py-3"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium">{NOTIFICATION_CATEGORY_LABELS[category]}</span>
              <span className="text-xs text-[color:var(--color-text-muted)]">
                {enabled
                  ? 'Recibirás notificaciones in-app de esta categoría.'
                  : 'No recibirás notificaciones in-app de esta categoría.'}
              </span>
            </div>
            <Button
              size="sm"
              variant={enabled ? 'secondary' : 'primary'}
              disabled={upsert.isPending}
              onClick={() => togglePreference(category)}
            >
              {enabled ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
