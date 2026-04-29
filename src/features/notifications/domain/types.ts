export const NOTIFICATION_SEVERITIES = [
  'info',
  'success',
  'warning',
  'critical',
] as const

export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number]

export const NOTIFICATION_CATEGORIES = [
  'compliance',
  'inventory',
  'production',
  'procurement',
  'system',
] as const

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  compliance: 'Cumplimiento APPCC',
  inventory: 'Inventario',
  production: 'Producción',
  procurement: 'Compras',
  system: 'Sistema',
}

export const NOTIFICATION_SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  info: 'Información',
  success: 'Correcto',
  warning: 'Aviso',
  critical: 'Crítico',
}

export interface Notification {
  id: string
  hotel_id: string
  user_id: string
  event_id: string | null
  category: NotificationCategory
  event_type: string
  severity: NotificationSeverity
  title: string
  body: string
  payload: Record<string, unknown>
  link: string | null
  read_at: string | null
  created_at: string
}

export type NotificationPreferenceMap = Record<NotificationCategory, boolean>

export interface NotificationPreferences {
  hotel_id: string
  preferences: NotificationPreferenceMap
}

export interface NotificationListFilter {
  hotelId: string
  unreadOnly?: boolean
  limit?: number
}
