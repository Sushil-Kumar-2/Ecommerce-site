import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDocument } from '../schemas/notification.schema';
import { EmailService } from '../../email/email.service';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async send(notification: NotificationDocument): Promise<void> {
    const user = await this.userModel
      .findById(notification.userId)
      .select('email name')
      .lean();

    if (!user?.email) {
      this.logger.debug(
        `Skipping email for userId=${notification.userId}: no email on file`,
      );
      return;
    }

    await this.emailService.sendForNotification(
      notification,
      user.email,
      user.name,
    );
  }
}
