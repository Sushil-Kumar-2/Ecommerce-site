import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { PaginatedNotificationsResponse } from './interfaces/paginated-notifications.interface';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from './enums/notification-type.enum';

// interface CreateNotificationDto {
//   userId: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   referenceId?: string;
//   referenceType?: ReferenceType;
//   metadata?: Record<string, unknown>;
// }

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly dispatcher: NotificationDispatcherService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const saved = await this.notificationModel.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      metadata: dto.metadata ?? {},
    });

    await this.dispatcher.dispatch(saved);
    return saved;
  }

  async findAll(
    userId: string,
    filter: NotificationFilterDto = {},
  ): Promise<PaginatedNotificationsResponse> {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;
    const sortField = filter.sortBy ?? 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const query: {
      userId: string;
      type?: NotificationType;
      isRead?: boolean;
    } = { userId };

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.isRead !== undefined) {
      query.isRead = filter.isRead === 'true';
    }

    const [data, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments(query),
      this.getUnreadCount(userId),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        unreadCount,
      },
    };
  }

  async findUnread(
    userId: string,
    filter: NotificationFilterDto = {},
  ): Promise<PaginatedNotificationsResponse> {
    return this.findAll(userId, { ...filter, isRead: 'false' });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    if (!isValidObjectId(notificationId)) {
      throw new NotFoundException('Notification not found');
    }

    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { returnDocument: 'after' },
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.emitUnreadCount(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );

    this.notificationsGateway.emitUnreadCount(userId, 0);

    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!isValidObjectId(notificationId)) {
      throw new NotFoundException('Notification not found');
    }

    const deleted = await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!deleted) {
      throw new NotFoundException('Notification not found');
    }

    return { success: true, message: 'Notification deleted successfully' };
  }

  async findDuplicateUnread(
    userId: string,
    type: NotificationType,
    referenceId: string,
  ): Promise<NotificationDocument | null> {
    return this.notificationModel.findOne({
      userId,
      type,
      referenceId,
      isRead: false,
    });
  }
}
