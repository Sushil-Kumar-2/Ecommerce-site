import { Injectable } from '@nestjs/common';
import { RecentlyViewed } from './schemas/recently-viewed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecentlyViewedDocument } from './schemas/recently-viewed.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

export interface RecentlyViewedItemResponse {
  productId: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  discountPrice: number;
  stock: number;
  averageRating: number;
  totalReviews: number;
  viewedAt: Date;
}

@Injectable()
export class RecentlyViewedService {
  constructor(
    @InjectModel(RecentlyViewed.name)
    private readonly recentlyViewedModel: Model<RecentlyViewedDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async addView(userId: string, productId: string) {
    await this.recentlyViewedModel.findOneAndUpdate(
      {
        userId,
        productId,
      },
      {
        userId,
        productId,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    const allItems = await this.recentlyViewedModel
      .find({ userId })
      .sort({ updatedAt: -1 });

    if (allItems.length > 20) {
      const extraItems = allItems.slice(20);

      await this.recentlyViewedModel.deleteMany({
        _id: {
          $in: extraItems.map((item) => item._id),
        },
      });
    }
  }

  async findAll(userId: string) {
    const recentItems = await this.recentlyViewedModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const result: RecentlyViewedItemResponse[] = [];

    for (const item of recentItems) {
      const product = await this.productModel.findById(item.productId);

      if (!product) {
        continue;
      }

      result.push({
        productId: product._id.toString(),
        title: product.title,
        slug: product.slug,
        image: product.images?.[0] || null,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        viewedAt: (item as RecentlyViewedDocument & { updatedAt: Date })
          .updatedAt,
      });
    }

    return result;
  }
}
