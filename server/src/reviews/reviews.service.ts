import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewDocument } from './schemas/review.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schemas/review.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';
import { UsersService } from 'src/users/users.service';
import { OrderStatus } from 'src/orders/order.enums';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotificationEventsService } from '../notifications/notification-events.service';

type ProductRatingStats = {
  _id: null;
  averageRating: number;
  totalReviews: number;
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    private readonly usersService: UsersService,
    private readonly notificationEvents: NotificationEventsService,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const product = await this.productModel.findById(createReviewDto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const order = await this.orderModel.findOne({
      userId,
      orderStatus: OrderStatus.DELIVERED,
      'items.productId': createReviewDto.productId,
    });

    if (!order) {
      throw new BadRequestException('You can review only delivered products');
    }
    const existingReview = await this.reviewModel.findOne({
      userId,
      productId: createReviewDto.productId,
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }
    const review = await this.reviewModel.create({
      userId,
      productId: createReviewDto.productId,
      orderId: order._id.toString(),

      rating: createReviewDto.rating,
      comment: createReviewDto.comment,

      images: createReviewDto.images ?? [],

      isVerifiedPurchase: true,
    });
    await this.updateProductRating(createReviewDto.productId);

    await this.notificationEvents.notifyMerchantNewReview(
      product.merchantId.toString(),
      review._id.toString(),
      product.title,
      createReviewDto.rating,
    );

    return review;
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate<ProductRatingStats>([
      {
        $match: {
          productId,
        },
      },

      {
        $group: {
          _id: null,

          averageRating: {
            $avg: '$rating',
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

    const averageRating = stats[0]?.averageRating ?? 0;
    const totalReviews = stats[0]?.totalReviews ?? 0;

    await this.productModel.findByIdAndUpdate(productId, {
      averageRating: Number(averageRating.toFixed(1)),

      totalReviews,
    });
  }

  async findByProduct(productId: string) {
    return this.reviewModel.find({ productId }).sort({ createdAt: -1 });
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can edit only your own review');
    }

    Object.assign(review, dto);

    await review.save();

    await this.updateProductRating(review.productId);

    return review;
  }
  async remove(reviewId: string, userId: string) {
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('You can delete only your own review');
    }

    const productId = review.productId.toString();

    await review.deleteOne();

    await this.updateProductRating(productId);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
