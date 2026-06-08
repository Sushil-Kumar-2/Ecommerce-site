import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Review } from './schemas/review.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
