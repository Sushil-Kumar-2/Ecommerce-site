import { useEffect, useRef } from 'react'

import { createNotificationSocket } from '@/lib/notifications'
import { useAuth } from '@/features/auth'

import {
  notificationsApi,
  useGetUnreadCountQuery,
  useGetUnreadNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from './notificationsApi'

export function useNotifications() {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef<ReturnType<typeof createNotificationSocket> | null>(null)

  const unreadCountQuery = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
  })
  const notificationsQuery = useGetUnreadNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  useEffect(() => {
    if (!token || !isAuthenticated) {
      return
    }

    const socket = createNotificationSocket(token)
    socketRef.current = socket
    socket.connect()

    const handleNotification = () => {
      notificationsApi.util.invalidateTags(['Notification'])
    }

    const handleUnreadCount = () => {
      notificationsApi.util.invalidateTags(['Notification'])
    }

    socket.on('notification', handleNotification)
    socket.on('unread_count', handleUnreadCount)

    return () => {
      socket.off('notification', handleNotification)
      socket.off('unread_count', handleUnreadCount)
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, isAuthenticated])

  const markNotificationRead = async (notificationId: string) => {
    await markRead(notificationId).unwrap()
  }

  const markAllNotificationsRead = async () => {
    await markAllRead().unwrap()
  }

  return {
    notifications: notificationsQuery.data?.data ?? [],
    unreadCount: unreadCountQuery.data?.unreadCount ?? 0,
    isLoading: unreadCountQuery.isLoading || notificationsQuery.isLoading,
    connected: socketRef.current?.connected ?? false,
    refetch: () => {
      void unreadCountQuery.refetch()
      void notificationsQuery.refetch()
    },
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  }
}
