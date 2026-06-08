import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  createNotificationSocket,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '../lib/notifications';

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }

    const [count, items] = await Promise.all([
      fetchUnreadCount(token),
      fetchNotifications(token),
    ]);

    setUnreadCount(count);
    setNotifications(items);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setConnected(false);
      return;
    }

    void refresh();

    const socket = createNotificationSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (payload: { notification: NotificationItem; unreadCount: number }) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === payload.notification._id);
        if (exists) {
          return prev;
        }
        return [payload.notification, ...prev].slice(0, 20);
      });
      setUnreadCount(payload.unreadCount);
    });

    socket.on('unread_count', (payload: { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        return;
      }

      await markNotificationRead(token, notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) {
      return;
    }

    await markAllNotificationsRead(token);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, [token]);

  return {
    notifications,
    unreadCount,
    connected,
    refresh,
    markRead,
    markAllRead,
  };
}
