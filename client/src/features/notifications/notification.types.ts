export interface NotificationItem {
  _id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  referenceId?: string
  referenceType?: string
  metadata: Record<string, unknown>
  createdAt?: string
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    unreadCount: number
  }
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface MarkAllReadResponse {
  modifiedCount: number
}
