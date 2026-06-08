import { NotificationDocument } from '../schemas/notification.schema';

export interface PaginatedNotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

export interface PaginatedNotificationsResponse {
  data: NotificationDocument[];
  meta: PaginatedNotificationsMeta;
}
