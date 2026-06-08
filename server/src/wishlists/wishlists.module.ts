import { Module } from '@nestjs/common';
import { WishlistService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { ProductsModule } from 'src/products/products.module';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Wishlist.name,
        schema: WishlistSchema,
      },
    ]),
    ProductsModule,
  ],
  controllers: [WishlistsController],
  providers: [WishlistService],
})
export class WishlistsModule {}
