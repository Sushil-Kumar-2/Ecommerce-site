import { Module } from '@nestjs/common';
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewedController } from './recently-viewed.controller';
import { RecentlyViewedSchema } from './schemas/recently-viewed.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RecentlyViewed } from './schemas/recently-viewed.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RecentlyViewed.name,
        schema: RecentlyViewedSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [RecentlyViewedController],
  providers: [RecentlyViewedService],
  exports: [RecentlyViewedService],
})
export class RecentlyViewedModule {}
