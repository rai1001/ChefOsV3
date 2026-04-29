import type { BadgeVariant } from '@/components/ui/badge'
import type { NotificationSeverity } from '../domain/types'

export const SEVERITY_BADGE_VARIANT: Record<NotificationSeverity, BadgeVariant> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  critical: 'urgent',
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHrs = Math.round(diffMin / 60)
  if (diffHrs < 24) return `hace ${diffHrs} h`
  const diffDays = Math.round(diffHrs / 24)
  if (diffDays < 7) return `hace ${diffDays} d`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
