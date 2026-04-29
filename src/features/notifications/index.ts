export type {
  GetNotificationsInput,
  MarkAllNotificationsReadInput,
  MarkNotificationReadInput,
  UpsertNotificationPreferenceInput,
} from './domain/schemas'

export {
  getNotificationsInputSchema,
  markAllNotificationsReadInputSchema,
  markNotificationReadInputSchema,
  notificationPreferenceMapSchema,
  notificationSchema,
  notificationsListSchema,
  upsertNotificationPreferenceSchema,
} from './domain/schemas'

export type {
  Notification,
  NotificationCategory,
  NotificationListFilter,
  NotificationPreferenceMap,
  NotificationPreferences,
  NotificationSeverity,
} from './domain/types'

export {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_SEVERITIES,
  NOTIFICATION_SEVERITY_LABELS,
} from './domain/types'

export {
  NotificationCategoryInvalidError,
  NotificationNotFoundError,
} from './domain/errors'

export {
  NOTIFICATION_QUERY_KEYS,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationPreferences,
  useNotifications,
  useUnreadNotificationsCount,
  useUpsertNotificationPreference,
} from './application/use-notifications'
