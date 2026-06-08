import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductsService } from 'src/products/products.service';

export interface WishlistItemResponse {
  wishlistId: string;
  productId: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number;
  stock: number;
  averageRating: number;
  totalReviews: number;
  image: string | null;
  addedAt: Date;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,

    private readonly productsService: ProductsService,
  ) {}

  async add(productId: string, userId: string) {
    const product = await this.productsService.findOne(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.wishlistModel.findOne({
      userId,
      productId,
    });

    if (existing) {
      throw new BadRequestException('Product already in wishlist');
    }

    return this.wishlistModel.create({
      userId,
      productId,
    });
  }

  async remove(productId: string, userId: string) {
    const deleted = await this.wishlistModel.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      throw new NotFoundException('Product not found in wishlist');
    }

    return {
      success: true,
      message: 'Removed from wishlist',
    };
  }

  async getMyWishlist(userId: string) {
    const wishlist = await this.wishlistModel.find({ userId });

    const result: WishlistItemResponse[] = [];

    for (const item of wishlist) {
      const product = await this.productsService.findOne(item.productId);

      if (!product) continue;

      result.push({
        wishlistId: item._id.toString(),
        productId: product._id.toString(),
        title: product.title,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        image: product.images?.[0] ?? null,
        addedAt:
          (item as Wishlist & { createdAt?: Date }).createdAt ?? new Date(),
      });
    }

    return result;
  }
}
