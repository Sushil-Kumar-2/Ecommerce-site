import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AddressesModule } from './addresses/addresses.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { PaymentsModule } from './payments/payments.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecentlyViewedModule } from './recently-viewed/recently-viewed.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReturnsModule } from './returns/returns.module';
import { InventoryModule } from './inventory/inventory.module';
import { MerchantOrdersModule } from './merchant-orders/merchant-orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { ProfileModule } from './profile/profile.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AdminModule } from './admin/admin.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    AddressesModule,
    WishlistsModule,
    PaymentsModule,
    AuthModule,
    CouponsModule,
    DashboardModule,
    RecentlyViewedModule,
    NotificationsModule,
    ReturnsModule,
    InventoryModule,
    MerchantOrdersModule,
    UploadsModule,
    ProfileModule,
    CheckoutModule,
    AuditLogsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
