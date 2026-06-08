import { Injectable, Logger } from '@nestjs/common';
import { NotificationDocument } from '../notifications/schemas/notification.schema';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { EmailTemplate } from './enums/email-template.enum';
import { ResendService } from './resend.service';
import { TemplateService } from './template.service';

const EMAIL_ENABLED_TYPES = new Set<NotificationType>([
  NotificationType.ORDER_CREATED,
  NotificationType.ORDER_CONFIRMED,
  NotificationType.ORDER_SHIPPED,
  NotificationType.ORDER_DELIVERED,
  NotificationType.RETURN_APPROVED,
  NotificationType.REFUND_COMPLETED,
  NotificationType.NEW_MERCHANT_REGISTERED,
]);

const TYPE_TO_TEMPLATE: Partial<Record<NotificationType, EmailTemplate>> = {
  [NotificationType.ORDER_CREATED]: EmailTemplate.ORDER_CREATED,
  [NotificationType.ORDER_CONFIRMED]: EmailTemplate.ORDER_CONFIRMED,
  [NotificationType.ORDER_SHIPPED]: EmailTemplate.ORDER_SHIPPED,
  [NotificationType.ORDER_DELIVERED]: EmailTemplate.ORDER_DELIVERED,
  [NotificationType.RETURN_APPROVED]: EmailTemplate.RETURN_APPROVED,
  [NotificationType.REFUND_COMPLETED]: EmailTemplate.REFUND_COMPLETED,
  [NotificationType.NEW_MERCHANT_REGISTERED]: EmailTemplate.MERCHANT_REGISTRATION,
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly resendService: ResendService,
    private readonly templateService: TemplateService,
  ) {}

  async sendForNotification(
    notification: NotificationDocument,
    recipientEmail: string,
    recipientName?: string,
  ): Promise<void> {
    if (!EMAIL_ENABLED_TYPES.has(notification.type)) {
      return;
    }

    const template = TYPE_TO_TEMPLATE[notification.type];
    if (!template) {
      return;
    }

    const context = {
      name: recipientName ?? recipientEmail,
      title: notification.title,
      message: notification.message,
      year: new Date().getFullYear(),
      ...notification.metadata,
    };

    await this.resendService.send({
      to: recipientEmail,
      subject: notification.title,
      html: this.templateService.render(template, context),
    });

    this.logger.log(
      `Email sent (${notification.type}) to ${recipientEmail}`,
    );
  }

  async sendPasswordChanged(
    recipientEmail: string,
    recipientName?: string,
  ): Promise<void> {
    const context = {
      name: recipientName ?? recipientEmail,
      title: 'Password Changed',
      message: 'Your account password was changed successfully.',
      year: new Date().getFullYear(),
    };

    await this.resendService.send({
      to: recipientEmail,
      subject: 'Password Changed',
      html: this.templateService.render(EmailTemplate.PASSWORD_CHANGED, context),
    });

    this.logger.log(`Password changed email sent to ${recipientEmail}`);
  }
}
