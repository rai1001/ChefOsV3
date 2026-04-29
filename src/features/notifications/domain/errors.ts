export class NotificationNotFoundError extends Error {
  constructor(notificationId: string, message = 'Notificación no encontrada') {
    super(message)
    this.name = 'NotificationNotFoundError'
    this.notificationId = notificationId
  }

  readonly notificationId: string
}

export class NotificationCategoryInvalidError extends Error {
  constructor(category: string, message = `Categoría de notificación inválida: ${category}`) {
    super(message)
    this.name = 'NotificationCategoryInvalidError'
    this.category = category
  }

  readonly category: string
}
