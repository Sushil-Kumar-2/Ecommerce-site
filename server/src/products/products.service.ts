import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, isValidObjectId } from 'mongoose';

import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InsufficientStockException } from '../common/exceptions/insufficient-stock.exception';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductSort } from './product-sort.enum';
import { RecentlyViewedService } from '../recently-viewed/recently-viewed.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { InventoryService } from '../inventory/inventory.service';
import { StockMutationContext } from '../inventory/interfaces/stock-mutation-context.interface';
import { InventoryTransactionType } from '../inventory/inventory.enums';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

export interface StockReservation {
  productId: string;
  quantity: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    private readonly recentlyViewedService: RecentlyViewedService,
    private readonly notificationEvents: NotificationEventsService,
    private readonly inventoryService: InventoryService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createProductDto: CreateProductDto, merchantId: string) {
    const product = new this.productModel({
      ...createProductDto,
      merchantId,
    });

    const saved = await product.save();

    await this.auditLogsService.createLog({
      userId: merchantId,
      role: 'merchant',
      action: AuditAction.PRODUCT_CREATED,
      resource: AuditResource.PRODUCT,
      resourceId: saved._id.toString(),
      metadata: {
        title: saved.title,
        price: saved.price,
        stock: saved.stock,
      },
    });

    return saved;
  }

  async findAll(filters: ProductFilterDto) {
    const page = Number(filters.page ?? '1');
    const limit = Number(filters.limit ?? '10');
    const skip = (page - 1) * limit;

    const match = this.buildProductMatch(filters);
    const sortStage = this.buildProductSort(filters.sort);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $addFields: {
          effectivePrice: {
            $cond: {
              if: { $gt: ['$discountPrice', 0] },
              then: '$discountPrice',
              else: '$price',
            },
          },
        },
      },
    ];

    const priceMatch: Record<string, unknown> = {};

    if (filters.minPrice) {
      priceMatch.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      priceMatch.$lte = Number(filters.maxPrice);
    }

    if (Object.keys(priceMatch).length > 0) {
      pipeline.push({ $match: { effectivePrice: priceMatch } });
    }

    pipeline.push({ $sort: sortStage });
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    });

    const [result] = await this.productModel.aggregate<{
      data: Product[];
      meta: { total: number }[];
    }>(pipeline);

    const total = result?.meta[0]?.total ?? 0;

    return {
      data: result?.data ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      filters: {
        search: filters.search ?? null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        rating: filters.rating ?? filters.minRating ?? null,
        sort: filters.sort ?? ProductSort.NEWEST,
        categoryId: filters.categoryId ?? null,
        inStock: filters.inStock ?? null,
        featured: filters.featured ?? null,
      },
    };
  }

  private buildProductMatch(
    filters: ProductFilterDto,
  ): Record<string, unknown> {
    const match: Record<string, unknown> = {};

    if (filters.status) {
      match.status = filters.status;
    } else {
      match.status = 'approved';
    }

    if (filters.featured !== undefined) {
      match.featured = filters.featured === 'true';
    }

    if (filters.merchantId) {
      match.merchantId = filters.merchantId;
    }

    if (filters.inStock === 'true') {
      match.stock = { $gt: 0 };
    }

    const ratingThreshold = filters.rating ?? filters.minRating;

    if (ratingThreshold) {
      match.averageRating = { $gte: Number(ratingThreshold) };
    }

    if (filters.search) {
      const escaped = this.escapeRegex(filters.search.trim());
      match.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (filters.categoryId) {
      match.categoryId = filters.categoryId;
    }

    return match;
  }

  private buildProductSort(sort?: ProductSort): Record<string, 1 | -1> {
    switch (sort) {
      case ProductSort.PRICE_ASC:
        return { effectivePrice: 1, createdAt: -1 };
      case ProductSort.PRICE_DESC:
        return { effectivePrice: -1, createdAt: -1 };
      case ProductSort.TOP_RATED:
        return { averageRating: -1, totalReviews: -1, createdAt: -1 };
      case ProductSort.NEWEST:
      default:
        return { createdAt: -1 };
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findOne(id: string, userId?: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userId) {
      await this.recentlyViewedService.addView(userId, id);
    }

    return product;
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.productModel.find({ _id: { $in: ids } });
  }

  async findMyProducts(merchantId: string) {
    return this.productModel.find({
      merchantId,
    });
  }

  /**
   * Atomically reserves stock using a conditional update (optimistic concurrency).
   * Only succeeds when stock >= quantity at write time — prevents race conditions.
   */
  async reserveStock(
    productId: string,
    quantity: number,
    context?: StockMutationContext,
  ): Promise<Product> {
    const session = context?.session;

    const product = await this.productModel.findOneAndUpdate(
      {
        _id: productId,
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity, version: 1 },
      },
      { returnDocument: 'after', session },
    );

    if (!product) {
      const existing = session
        ? await this.productModel.findById(productId).session(session)
        : await this.productModel.findById(productId);

      if (!existing) {
        throw new NotFoundException(`Product not found: ${productId}`);
      }

      throw new InsufficientStockException(
        `${existing.title} has only ${existing.stock} items left in stock`,
        [
          {
            productId: existing._id.toString(),
            title: existing.title,
            requestedQuantity: quantity,
            availableStock: existing.stock,
          },
        ],
      );
    }

    const previousStock = product.stock + quantity;

    if (context?.type) {
      await this.inventoryService.recordTransaction({
        productId,
        quantity,
        type: context.type as InventoryTransactionType,
        previousStock,
        currentStock: product.stock,
        referenceId: context.referenceId,
      });
    }

    await this.handleStockChangeNotifications(
      product,
      previousStock,
      product.stock,
    );

    return product;
  }

  /** Compensating rollback when a multi-item reservation partially fails. */
  async releaseStock(
    productId: string,
    quantity: number,
    context?: StockMutationContext,
  ): Promise<void> {
    const session = context?.session;

    const existing = session
      ? await this.productModel.findById(productId).session(session)
      : await this.productModel.findById(productId);

    if (!existing) {
      return;
    }

    const previousStock = existing.stock;

    const updated = await this.productModel.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity, version: 1 } },
      { returnDocument: 'after', session },
    );

    if (updated) {
      if (context?.type) {
        await this.inventoryService.recordTransaction({
          productId,
          quantity,
          type: context.type as InventoryTransactionType,
          previousStock,
          currentStock: updated.stock,
          referenceId: context.referenceId,
        });
      }

      await this.handleStockChangeNotifications(
        updated,
        previousStock,
        updated.stock,
      );
    }
  }

  private async handleStockChangeNotifications(
    product: ProductDocument,
    previousStock: number,
    newStock: number,
  ): Promise<void> {
    const productId = product._id.toString();
    const merchantId = product.merchantId.toString();
    const effectivePrice = product.discountPrice ?? product.price;

    await this.notificationEvents.notifyMerchantStockLevel(
      merchantId,
      productId,
      product.title,
      newStock,
    );

    await this.notificationEvents.notifyWishlistStockOrPriceChange(
      productId,
      product.title,
      previousStock,
      newStock,
      effectivePrice,
      effectivePrice,
    );
  }

  async reserveMultipleStocks(
    reservations: StockReservation[],
    context?: StockMutationContext,
  ): Promise<Product[]> {
    const reserved: StockReservation[] = [];
    const updatedProducts: Product[] = [];

    try {
      for (const { productId, quantity } of reservations) {
        const product = await this.reserveStock(productId, quantity, context);
        reserved.push({ productId, quantity });
        updatedProducts.push(product);
      }

      return updatedProducts;
    } catch (error) {
      if (!context?.session) {
        for (const { productId, quantity } of reserved) {
          await this.releaseStock(productId, quantity, {
            type: InventoryTransactionType.CANCEL,
            referenceId: context?.referenceId,
          });
        }
      }

      throw error;
    }
  }

  async releaseMultipleStocks(
    reservations: StockReservation[],
    context?: StockMutationContext,
  ): Promise<void> {
    for (const { productId, quantity } of reservations) {
      await this.releaseStock(productId, quantity, context);
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    merchantId: string,
  ) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.merchantId.toString() !== merchantId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const previousStock = product.stock;
    const previousPrice = product.discountPrice ?? product.price;

    const updated = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );

    if (updated) {
      const newPrice = updated.discountPrice ?? updated.price;

      if (
        updateProductDto.stock !== undefined &&
        updated.stock > previousStock
      ) {
        await this.inventoryService.recordTransaction({
          productId: updated._id.toString(),
          quantity: updated.stock - previousStock,
          type: InventoryTransactionType.MANUAL_ADD,
          previousStock,
          currentStock: updated.stock,
          referenceId: merchantId,
        });
      }

      await this.notificationEvents.notifyMerchantStockLevel(
        merchantId,
        updated._id.toString(),
        updated.title,
        updated.stock,
      );

      await this.notificationEvents.notifyWishlistStockOrPriceChange(
        updated._id.toString(),
        updated.title,
        previousStock,
        updated.stock,
        previousPrice,
        newPrice,
      );

      const priceChanged =
        updateProductDto.price !== undefined ||
        updateProductDto.discountPrice !== undefined
          ? newPrice !== previousPrice
          : false;
      const stockChanged =
        updateProductDto.stock !== undefined && updated.stock !== previousStock;

      await this.auditLogsService.createLog({
        userId: merchantId,
        role: 'merchant',
        action: AuditAction.PRODUCT_UPDATED,
        resource: AuditResource.PRODUCT,
        resourceId: updated._id.toString(),
        metadata: {
          title: updated.title,
          changes: updateProductDto,
        },
      });

      if (priceChanged) {
        await this.auditLogsService.createLog({
          userId: merchantId,
          role: 'merchant',
          action: AuditAction.PRICE_CHANGED,
          resource: AuditResource.PRODUCT,
          resourceId: updated._id.toString(),
          metadata: {
            title: updated.title,
            previousPrice,
            newPrice,
          },
        });
      }

      if (stockChanged) {
        await this.auditLogsService.createLog({
          userId: merchantId,
          role: 'merchant',
          action: AuditAction.STOCK_CHANGED,
          resource: AuditResource.PRODUCT,
          resourceId: updated._id.toString(),
          metadata: {
            title: updated.title,
            previousStock,
            newStock: updated.stock,
          },
        });
      }
    }

    return updated;
  }

  async remove(id: string, merchantId: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.merchantId.toString() !== merchantId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return this.productModel.findByIdAndDelete(id);
  }

  async getRelatedProducts(productId: string) {
    if (!isValidObjectId(productId)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Try to find related by category
    let related = await this.productModel
      .find({
        _id: {
          $ne: product._id,
        },
        categoryId: product.categoryId,
        status: 'approved',
      })
      .limit(8);

    if (related.length === 0) {
      // Fallback: no category match, try by same merchant
      related = await this.productModel
        .find({
          _id: {
            $ne: product._id,
          },
          merchantId: product.merchantId,
          status: 'approved',
        })
        .limit(8);
    }

    if (related.length === 0) {
      // Fallback: no category or merchant matches, just get any others
      related = await this.productModel
        .find({
          _id: {
            $ne: product._id,
          },
          status: 'approved',
        })
        .limit(8);
    }

    return related;
  }

  async getBestSellers() {
    return this.productModel
      .find({
        status: 'approved',
      })
      .sort({
        totalReviews: -1,
        averageRating: -1,
      })
      .limit(10);
  }

  async getTopRatedProducts() {
    return this.productModel
      .find({
        status: 'approved',
        totalReviews: {
          $gte: 1,
        },
      })
      .sort({
        averageRating: -1,
      })
      .limit(10);
  }
}
