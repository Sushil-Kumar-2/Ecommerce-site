import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../email/email.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { User, UserSchema } from '../users/schemas/user.schema';

import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  ProductReport,
  ProductReportSchema,
} from './schemas/product-report.schema';
import { Wishlist, WishlistSchema } from '../wishlists/schemas/wishlist.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { UsersModule } from '../users/users.module';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationEventsService } from './notification-events.service';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { EmailNotificationService } from './services/email-notification.service';
import { NotificationsGateway } from './notifications.gateway';
import { ProductReportsService } from './product-reports.service';
import { ProductReportsController } from './product-reports.controller';

@Module({
  imports: [
    EmailModule,
    AuditLogsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'super-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: ProductReport.name, schema: ProductReportSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController, ProductReportsController],
  providers: [
    NotificationsService,
    NotificationEventsService,
    NotificationDispatcherService,
    EmailNotificationService,
    NotificationsGateway,
    ProductReportsService,
  ],
  exports: [NotificationsService, NotificationEventsService],
})
export class NotificationsModule {}
