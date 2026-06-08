export {
  notificationsApi,
  useGetUnreadCountQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from './notificationsApi'
export { useNotifications } from './hooks'
export { NotificationDropdown } from './components/NotificationDropdown'
export type {
  MarkAllReadResponse,
  NotificationItem,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from './notification.types'
