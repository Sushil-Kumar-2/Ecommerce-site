import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';

import { Address, AddressDocument } from '../../addresses/schemas/address.schema';
import { AuditLog, AuditLogDocument } from '../../audit-logs/schemas/audit-log.schema';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { Category, CategoryDocument } from '../../categories/schemas/category.schema';
import { Coupon, CouponDocument } from '../../coupons/schemas/coupon.schema';
import {
  InventoryTransaction,
  InventoryTransactionDocument,
} from '../../inventory/schemas/inventory-transaction.schema';
import { InventoryTransactionType } from '../../inventory/inventory.enums';
import { Notification, NotificationDocument } from '../../notifications/schemas/notification.schema';
import {
  ProductReport,
  ProductReportDocument,
} from '../../notifications/schemas/product-report.schema';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { MerchantFulfillmentStatus } from '../../orders/merchant-fulfillment.enums';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../orders/order.enums';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import {
  RecentlyViewed,
  RecentlyViewedDocument,
} from '../../recently-viewed/schemas/recently-viewed.schema';
import { ReturnRequest, ReturnRequestDocument } from '../../returns/schemas/return-request.schema';
import { Review, ReviewDocument } from '../../reviews/schemas/review.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Wishlist, WishlistDocument } from '../../wishlists/schemas/wishlist.schema';

import { SEED_ADDRESSES } from './data/addresses.data';
import { SEED_AUDIT_LOGS } from './data/audit-logs.data';
import { SEED_CATEGORIES } from './data/categories.data';
import {
  SEED_CART_ITEMS,
  SEED_RECENTLY_VIEWED_SLUGS,
  SEED_WISHLIST_SLUGS,
} from './data/customer-extras.data';
import { SEED_COUPONS } from './data/coupons.data';
import { SEED_INVENTORY_ADJUSTMENTS } from './data/inventory.data';
import { SEED_ORDERS } from './data/orders.data';
import { SEED_PRODUCT_REPORTS } from './data/product-reports.data';
import { SEED_PRODUCTS } from './data/products.data';
import { SEED_REVIEWS } from './data/reviews.data';
import { DemoUserKey, SEED_USERS } from './data/users.data';
import {
  assertSeedAllowed,
  DEMO_PASSWORD,
  printDemoCredentials,
} from './seed.constants';

interface SeedContext {
  users: Record<DemoUserKey, string>;
  categories: Record<string, string>;
  products: Record<string, ProductDocument>;
  addresses: Record<string, string>;
  orders: Record<string, string>;
  coupons: Record<string, string>;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    @InjectModel(Address.name) private readonly addressModel: Model<AddressDocument>,
    @InjectModel(Wishlist.name) private readonly wishlistModel: Model<WishlistDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(RecentlyViewed.name)
    private readonly recentlyViewedModel: Model<RecentlyViewedDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(InventoryTransaction.name)
    private readonly inventoryModel: Model<InventoryTransactionDocument>,
    @InjectModel(ProductReport.name)
    private readonly productReportModel: Model<ProductReportDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(ReturnRequest.name)
    private readonly returnRequestModel: Model<ReturnRequestDocument>,
  ) {}

  async seedAll(): Promise<void> {
    assertSeedAllowed();
    this.logger.log('Starting demo seed (idempotent upsert)...');

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const ctx: SeedContext = {
      users: {} as Record<DemoUserKey, string>,
      categories: {},
      products: {},
      addresses: {},
      orders: {},
      coupons: {},
    };

    await this.seedUsers(hashedPassword, ctx);
    await this.seedCategories(ctx);
    await this.seedProducts(ctx);
    await this.seedCoupons(ctx);
    await this.seedAddresses(ctx);
    await this.seedWishlist(ctx);
    await this.seedCart(ctx);
    await this.seedRecentlyViewed(ctx);
    await this.seedOrders(ctx);
    await this.seedReviews(ctx);
    await this.recomputeProductRatings();
    await this.seedInventory(ctx);
    await this.seedProductReports(ctx);
    await this.seedAuditLogs(ctx);

    printDemoCredentials();
  }

  async clearAll(): Promise<void> {
    assertSeedAllowed();
    this.logger.warn('Removing all documents with isDemoSeed: true...');

    const filter = { isDemoSeed: true };

    await this.reviewModel.deleteMany(filter);
    await this.returnRequestModel.deleteMany(filter);
    await this.inventoryModel.deleteMany(filter);
    await this.recentlyViewedModel.deleteMany(filter);
    await this.wishlistModel.deleteMany(filter);
    await this.cartModel.deleteMany(filter);
    await this.orderModel.deleteMany(filter);
    await this.addressModel.deleteMany(filter);
    await this.productReportModel.deleteMany(filter);
    await this.notificationModel.deleteMany(filter);
    await this.auditLogModel.deleteMany(filter);
    await this.couponModel.deleteMany(filter);
    await this.productModel.deleteMany(filter);
    await this.categoryModel.deleteMany(filter);
    await this.userModel.deleteMany(filter);

    this.logger.log('Demo seed data cleared.');
  }

  private async seedUsers(hashedPassword: string, ctx: SeedContext): Promise<void> {
    for (const user of SEED_USERS) {
      const doc = await this.userModel.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            role: user.role,
            status: 'active',
            emailVerified: true,
            shopName: user.shopName,
            shopDescription: user.shopDescription,
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.users[user.key] = doc._id.toString();
    }
    this.logger.log(`Users: ${SEED_USERS.length}`);
  }

  private async seedCategories(ctx: SeedContext): Promise<void> {
    for (const category of SEED_CATEGORIES) {
      const doc = await this.categoryModel.findOneAndUpdate(
        { slug: category.slug },
        {
          $set: {
            ...category,
            isActive: true,
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.categories[category.slug] = doc._id.toString();
    }
    this.logger.log(`Categories: ${SEED_CATEGORIES.length}`);
  }

  private async seedProducts(ctx: SeedContext): Promise<void> {
    for (const product of SEED_PRODUCTS) {
      const categoryId = ctx.categories[product.categorySlug];
      const merchantId = ctx.users[product.merchantKey];
      if (!categoryId || !merchantId) continue;

      const doc = await this.productModel.findOneAndUpdate(
        { slug: product.slug },
        {
          $set: {
            title: product.title,
            slug: product.slug,
            description: product.description,
            categoryId: new Types.ObjectId(categoryId),
            merchantId: new Types.ObjectId(merchantId),
            images: product.images,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            variants: product.variants ?? [],
            featured: product.featured ?? false,
            status: 'approved',
            averageRating: 4.3,
            totalReviews: 18,
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.products[product.slug] = doc;
    }
    this.logger.log(`Products: ${SEED_PRODUCTS.length}`);
  }

  private async seedCoupons(ctx: SeedContext): Promise<void> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    for (const coupon of SEED_COUPONS) {
      const doc = await this.couponModel.findOneAndUpdate(
        { code: coupon.code },
        {
          $set: {
            ...coupon,
            startDate,
            expiryDate,
            isActive: true,
            usageCount: 0,
            usedBy: [],
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.coupons[coupon.code] = doc._id.toString();
    }
    this.logger.log(`Coupons: ${SEED_COUPONS.length}`);
  }

  private async seedAddresses(ctx: SeedContext): Promise<void> {
    for (const address of SEED_ADDRESSES) {
      const userId = ctx.users[address.customerKey];
      const doc = await this.addressModel.findOneAndUpdate(
        { userId, addressLine1: address.addressLine1, isDemoSeed: true },
        {
          $set: {
            userId,
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            country: address.country,
            pincode: address.pincode,
            landmark: address.landmark,
            isDefault: address.isDefault,
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.addresses[address.key] = doc._id.toString();
    }
    this.logger.log(`Addresses: ${SEED_ADDRESSES.length}`);
  }

  private async seedWishlist(ctx: SeedContext): Promise<void> {
    const userId = ctx.users.customer;
    for (const slug of SEED_WISHLIST_SLUGS) {
      const product = ctx.products[slug];
      if (!product) continue;
      await this.wishlistModel.findOneAndUpdate(
        { userId, productId: product._id.toString() },
        { $set: { userId, productId: product._id.toString(), isDemoSeed: true } },
        { upsert: true },
      );
    }
    this.logger.log(`Wishlist items: ${SEED_WISHLIST_SLUGS.length}`);
  }

  private async seedCart(ctx: SeedContext): Promise<void> {
    const userId = ctx.users.customer;
    const items = SEED_CART_ITEMS.map((item) => {
      const product = ctx.products[item.productSlug];
      if (!product) return null;
      return {
        productId: product._id.toString(),
        quantity: item.quantity,
        price: this.getEffectivePrice(product),
        variantName: item.variantName,
        variantValue: item.variantValue,
      };
    }).filter(Boolean) as Array<{
      productId: string;
      quantity: number;
      price: number;
      variantName?: string;
      variantValue?: string;
    }>;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.cartModel.findOneAndUpdate(
      { userId, isDemoSeed: true },
      { $set: { userId, items, totalAmount, isDemoSeed: true } },
      { upsert: true },
    );
    this.logger.log(`Cart items: ${items.length}`);
  }

  private async seedRecentlyViewed(ctx: SeedContext): Promise<void> {
    const userId = ctx.users.customer;
    for (const slug of SEED_RECENTLY_VIEWED_SLUGS) {
      const product = ctx.products[slug];
      if (!product) continue;
      await this.recentlyViewedModel.findOneAndUpdate(
        { userId, productId: product._id.toString() },
        { $set: { userId, productId: product._id.toString(), isDemoSeed: true } },
        { upsert: true },
      );
    }
    this.logger.log(`Recently viewed: ${SEED_RECENTLY_VIEWED_SLUGS.length}`);
  }

  private async seedOrders(ctx: SeedContext): Promise<void> {
    for (const orderDef of SEED_ORDERS) {
      const userId = ctx.users[orderDef.customerKey];
      const defaultAddress = SEED_ADDRESSES.find(
        (a) => a.customerKey === orderDef.customerKey && a.isDefault,
      );

      const items = orderDef.items
        .map((item) => {
          const product = ctx.products[item.productSlug];
          if (!product) return null;
          const price = this.getEffectivePrice(product);
          return {
            productId: product._id.toString(),
            merchantId: product.merchantId.toString(),
            title: product.title,
            image: product.images[0] ?? '',
            price,
            quantity: item.quantity,
            variantDetails: item.variantDetails,
          };
        })
        .filter(Boolean) as Array<{
        productId: string;
        merchantId: string;
        title: string;
        image: string;
        price: number;
        quantity: number;
        variantDetails?: string;
      }>;

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const merchantIds = [...new Set(items.map((item) => item.merchantId))];
      const fulfillmentStatus =
        orderDef.fulfillmentStatus ?? MerchantFulfillmentStatus.PENDING;

      const merchantFulfillments = merchantIds.map((merchantId) => ({
        merchantId,
        status: fulfillmentStatus,
        ...(fulfillmentStatus === MerchantFulfillmentStatus.SHIPPED
          ? {
              shippedAt: orderDef.shippedAt ? new Date(orderDef.shippedAt) : new Date(),
              trackingNumber: orderDef.trackingNumber ?? 'DEMO-TRACK-001',
              carrier: 'Demo Express',
            }
          : {}),
        ...(fulfillmentStatus === MerchantFulfillmentStatus.ACCEPTED
          ? { acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
          : {}),
      }));

      const doc = await this.orderModel.findOneAndUpdate(
        { orderNumber: orderDef.orderNumber },
        {
          $set: {
            orderNumber: orderDef.orderNumber,
            userId,
            items,
            couponCode: orderDef.couponCode,
            shippingAddress: defaultAddress
              ? {
                  fullName: defaultAddress.fullName,
                  phone: defaultAddress.phone,
                  addressLine1: defaultAddress.addressLine1,
                  addressLine2: defaultAddress.addressLine2,
                  city: defaultAddress.city,
                  state: defaultAddress.state,
                  country: defaultAddress.country,
                  pincode: defaultAddress.pincode,
                  landmark: defaultAddress.landmark,
                }
              : {
                  fullName: 'Demo Customer',
                  phone: '9876543210',
                  addressLine1: 'Demo Address',
                  city: 'Bengaluru',
                  state: 'Karnataka',
                  country: 'India',
                  pincode: '560001',
                },
            subtotal,
            shippingCharge: 0,
            discountAmount: 0,
            totalAmount: subtotal,
            paymentMethod: orderDef.paymentMethod as PaymentMethod,
            paymentStatus: orderDef.paymentStatus as PaymentStatus,
            orderStatus: orderDef.orderStatus as OrderStatus,
            merchantIds,
            merchantFulfillments,
            stockRestored: orderDef.orderStatus === 'cancelled',
            paidAt: orderDef.paidAt ? new Date(orderDef.paidAt) : undefined,
            shippedAt: orderDef.shippedAt ? new Date(orderDef.shippedAt) : undefined,
            deliveredAt: orderDef.deliveredAt ? new Date(orderDef.deliveredAt) : undefined,
            cancelledAt: orderDef.cancelledAt ? new Date(orderDef.cancelledAt) : undefined,
            cancelReason: orderDef.cancelReason,
            trackingNumber: orderDef.trackingNumber,
            isDemoSeed: true,
          },
        },
        { upsert: true, new: true },
      );
      ctx.orders[orderDef.orderNumber] = doc._id.toString();
    }
    this.logger.log(`Orders: ${SEED_ORDERS.length}`);
  }

  private async seedReviews(ctx: SeedContext): Promise<void> {
    for (const review of SEED_REVIEWS) {
      const userId = ctx.users[review.customerKey];
      const product = ctx.products[review.productSlug];
      const orderId = ctx.orders[review.orderNumber];
      if (!userId || !product || !orderId) continue;

      await this.reviewModel.findOneAndUpdate(
        { userId, productId: product._id.toString(), orderId, isDemoSeed: true },
        {
          $set: {
            userId,
            productId: product._id.toString(),
            orderId,
            rating: review.rating,
            comment: review.comment,
            images: [],
            isVerifiedPurchase: true,
            isDemoSeed: true,
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Reviews: ${SEED_REVIEWS.length}`);
  }

  private async recomputeProductRatings(): Promise<void> {
    const demoReviews = await this.reviewModel.find({ isDemoSeed: true }).lean();
    const byProduct = new Map<string, { sum: number; count: number }>();

    for (const review of demoReviews) {
      const entry = byProduct.get(review.productId) ?? { sum: 0, count: 0 };
      entry.sum += review.rating;
      entry.count += 1;
      byProduct.set(review.productId, entry);
    }

    for (const [productId, stats] of byProduct.entries()) {
      await this.productModel.updateOne(
        { _id: productId, isDemoSeed: true },
        {
          $set: {
            averageRating: Math.round((stats.sum / stats.count) * 10) / 10,
            totalReviews: stats.count,
          },
        },
      );
    }
  }

  private async seedInventory(ctx: SeedContext): Promise<void> {
    for (const adj of SEED_INVENTORY_ADJUSTMENTS) {
      const product = ctx.products[adj.productSlug];
      if (!product) continue;

      const currentStock = product.stock;
      const previousStock = Math.max(0, currentStock - adj.quantity);

      await this.inventoryModel.findOneAndUpdate(
        {
          productId: product._id.toString(),
          type: InventoryTransactionType.MANUAL_ADD,
          isDemoSeed: true,
        },
        {
          $set: {
            productId: product._id.toString(),
            quantity: adj.quantity,
            type: InventoryTransactionType.MANUAL_ADD,
            previousStock,
            currentStock,
            referenceId: 'demo-seed',
            isDemoSeed: true,
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Inventory transactions: ${SEED_INVENTORY_ADJUSTMENTS.length}`);
  }

  private async seedProductReports(ctx: SeedContext): Promise<void> {
    for (const report of SEED_PRODUCT_REPORTS) {
      const product = ctx.products[report.productSlug];
      const userId = ctx.users[report.reporterKey];
      if (!product || !userId) continue;

      await this.productReportModel.findOneAndUpdate(
        { userId, productId: product._id.toString(), isDemoSeed: true },
        {
          $set: {
            userId,
            productId: product._id.toString(),
            reason: report.reason,
            status: report.status,
            isDemoSeed: true,
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Product reports: ${SEED_PRODUCT_REPORTS.length}`);
  }

  private async seedAuditLogs(ctx: SeedContext): Promise<void> {
    for (const [index, log] of SEED_AUDIT_LOGS.entries()) {
      const userId = ctx.users[log.actorKey];
      let resourceId = 'demo';

      if (log.productSlug) {
        resourceId = ctx.products[log.productSlug]?._id.toString() ?? log.productSlug;
      } else if (log.couponCode) {
        resourceId = ctx.coupons[log.couponCode] ?? log.couponCode;
      }

      await this.auditLogModel.findOneAndUpdate(
        { isDemoSeed: true, action: log.action, 'metadata.seedIndex': index },
        {
          $set: {
            userId: userId ? new Types.ObjectId(userId) : undefined,
            role: log.role,
            action: log.action,
            resource: log.resource,
            resourceId,
            metadata: { ...log.metadata, seedIndex: index },
            isDemoSeed: true,
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Audit logs: ${SEED_AUDIT_LOGS.length}`);
  }

  private getEffectivePrice(product: ProductDocument): number {
    return product.discountPrice > 0 ? product.discountPrice : product.price;
  }
}
