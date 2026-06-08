import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReturnRequest,
  ReturnRequestSchema,
} from './schemas/return-request.schema';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    OrdersModule,
    ProductsModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
