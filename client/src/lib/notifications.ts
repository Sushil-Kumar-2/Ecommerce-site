import { env } from '@/lib/env'
import { createSocket } from '@/lib/socket'

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

export interface NotificationEvent {
  notification: NotificationItem
  unreadCount: number
}

export function createNotificationSocket(token: string) {
  return createSocket('/notifications', token)
}

export async function fetchUnreadCount(token: string): Promise<number> {
  const response = await fetch(`${env.apiUrl}/notifications/unread/count`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch unread count')
  }

  const data = (await response.json()) as { unreadCount: number }
  return data.unreadCount
}

export async function fetchNotifications(
  token: string,
): Promise<NotificationItem[]> {
  const response = await fetch(`${env.apiUrl}/notifications/unread?limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }

  const data = (await response.json()) as { data: NotificationItem[] }
  return data.data
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
): Promise<void> {
  await fetch(`${env.apiUrl}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await fetch(`${env.apiUrl}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}
