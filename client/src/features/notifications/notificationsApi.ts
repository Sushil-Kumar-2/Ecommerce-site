import { baseApi } from '@/services/api'

import type {
  MarkAllReadResponse,
  NotificationItem,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from './notification.types'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/notifications/unread/count',
      providesTags: ['Notification'],
    }),
    getUnreadNotifications: builder.query<PaginatedNotificationsResponse, void>({
      query: () => '/notifications/unread?limit=10',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<NotificationItem, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<MarkAllReadResponse, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetUnreadCountQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
