import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDocument } from '../schemas/notification.schema';
import { Notification } from '../schemas/notification.schema';
import { EmailNotificationService } from './email-notification.service';
import { NotificationsGateway } from '../notifications.gateway';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async dispatch(notification: NotificationDocument): Promise<void> {
    try {
      await this.emailNotificationService.send(notification);
    } catch (error) {
      this.logger.error('Email dispatch failed', error);
    }

    try {
      const unreadCount = await this.notificationModel.countDocuments({
        userId: notification.userId,
        isRead: false,
      });

      this.notificationsGateway.emitToUser(
        notification.userId,
        notification,
        unreadCount,
      );
    } catch (error) {
      this.logger.error('Socket dispatch failed', error);
    }
  }
}
