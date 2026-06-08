import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import {
  ProductReport,
  ProductReportSchema,
} from '../notifications/schemas/product-report.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { AdminMerchantsController } from './admin-merchants.controller';
import { AdminMerchantsService } from './admin-merchants.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminProductReportsController } from './admin-product-reports.controller';
import { AdminProductReportsService } from './admin-product-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ProductReport.name, schema: ProductReportSchema },
    ]),
    AuditLogsModule,
  ],
  controllers: [
    AdminMerchantsController,
    AdminProductsController,
    AdminUsersController,
    AdminProductReportsController,
  ],
  providers: [
    AdminMerchantsService,
    AdminProductsService,
    AdminUsersService,
    AdminProductReportsService,
  ],
})
export class AdminModule {}
