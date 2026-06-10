import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Address, AddressSchema } from '../../addresses/schemas/address.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../audit-logs/schemas/audit-log.schema';
import { Cart, CartSchema } from '../../cart/schemas/cart.schema';
import {
  Category,
  CategorySchema,
} from '../../categories/schemas/category.schema';
import { Coupon, CouponSchema } from '../../coupons/schemas/coupon.schema';
import {
  InventoryTransaction,
  InventoryTransactionSchema,
} from '../../inventory/schemas/inventory-transaction.schema';
import {
  Notification,
  NotificationSchema,
} from '../../notifications/schemas/notification.schema';
import {
  ProductReport,
  ProductReportSchema,
} from '../../notifications/schemas/product-report.schema';
import { Order, OrderSchema } from '../../orders/schemas/order.schema';
import { Product, ProductSchema } from '../../products/schemas/product.schema';
import {
  RecentlyViewed,
  RecentlyViewedSchema,
} from '../../recently-viewed/schemas/recently-viewed.schema';
import {
  ReturnRequest,
  ReturnRequestSchema,
} from '../../returns/schemas/return-request.schema';
import { Review, ReviewSchema } from '../../reviews/schemas/review.schema';
import { User, UserSchema } from '../../users/schemas/user.schema';
import {
  Wishlist,
  WishlistSchema,
} from '../../wishlists/schemas/wishlist.schema';

import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Cart.name, schema: CartSchema },
      { name: RecentlyViewed.name, schema: RecentlyViewedSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
      { name: ProductReport.name, schema: ProductReportSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
