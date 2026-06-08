import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { MerchantOrdersService } from './merchant-orders.service';
import { MerchantOrdersController } from './merchant-orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    NotificationsModule,
  ],
  controllers: [MerchantOrdersController],
  providers: [MerchantOrdersService],
})
export class MerchantOrdersModule {}
