import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './enums/notification-type.enum';
import { ReferenceType } from './enums/reference-type.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationDocument } from './schemas/notification.schema';
import {
  Wishlist,
  WishlistDocument,
} from '../wishlists/schemas/wishlist.schema';
import { UsersService } from '../users/users.service';

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class NotificationEventsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
  ) {}

  private async createIfNotDuplicate(
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument | null> {
    if (dto.referenceId) {
      const existing = await this.notificationsService.findDuplicateUnread(
        dto.userId,
        dto.type,
        dto.referenceId,
      );

      if (existing) {
        return existing;
      }
    }

    return this.notificationsService.createNotification(dto);
  }

  private async notifyAllAdmins(
    type: NotificationType,
    title: string,
    message: string,
    referenceId?: string,
    referenceType?: ReferenceType,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const admins = await this.usersService.findByRole('admin');

    await Promise.all(
      admins.map((admin) =>
        this.notificationsService.createNotification({
          userId: admin._id.toString(),
          title,
          message,
          type,
          referenceId,
          referenceType,
          metadata,
        }),
      ),
    );
  }

  // --- Customer: Orders ---

  async notifyOrderCreated(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Placed',
      message: `Your order ${orderNumber} has been placed successfully.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyOrderConfirmed(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Order Confirmed',
      message: `Your order ${orderNumber} has been confirmed.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyOrderShipped(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.ORDER_SHIPPED,
      title: 'Order Shipped',
      message: `Your order ${orderNumber} has been shipped.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyOutForDelivery(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.OUT_FOR_DELIVERY,
      title: 'Out for Delivery',
      message: `Your order ${orderNumber} is out for delivery.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyOrderDelivered(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.ORDER_DELIVERED,
      title: 'Order Delivered',
      message: `Your order ${orderNumber} has been delivered.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyOrderCancelled(
    userId: string,
    orderId: string,
    orderNumber: string,
    reason?: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.ORDER_CANCELLED,
      title: 'Order Cancelled',
      message: reason
        ? `Your order ${orderNumber} was cancelled: ${reason}`
        : `Your order ${orderNumber} has been cancelled.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber, reason },
    });
  }

  // --- Customer: Payments ---

  async notifyPaymentSuccess(
    userId: string,
    orderId: string,
    orderNumber: string,
    amount: number,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Payment Successful',
      message: `Payment of ₹${amount} for order ${orderNumber} was successful.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber, amount },
    });
  }

  async notifyPaymentFailed(
    userId: string,
    orderId: string,
    orderNumber: string,
    reason?: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: reason
        ? `Payment for order ${orderNumber} failed: ${reason}`
        : `Payment for order ${orderNumber} failed. Please try again.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber, reason },
    });
  }

  async notifyRefundInitiated(
    userId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.REFUND_INITIATED,
      title: 'Refund Initiated',
      message: `A refund has been initiated for order ${orderNumber}.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyRefundCompleted(
    userId: string,
    orderId: string,
    orderNumber: string,
    amount: number,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.REFUND_COMPLETED,
      title: 'Refund Completed',
      message: `Refund of ₹${amount} for order ${orderNumber} has been completed.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber, amount },
    });
  }

  async notifyReturnApproved(
    userId: string,
    returnId: string,
    orderId: string,
    orderNumber: string,
    productTitle: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.RETURN_APPROVED,
      title: 'Return Approved',
      message: `Your return request for "${productTitle}" on order ${orderNumber} has been approved.`,
      referenceId: returnId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber, productTitle, orderId },
    });
  }

  // --- Customer: Coupon ---

  async notifyCouponApplied(
    userId: string,
    couponCode: string,
    discount: number,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.COUPON_AVAILABLE,
      title: 'Coupon Applied',
      message: `You saved ₹${discount} with coupon ${couponCode}.`,
      referenceId: couponCode,
      referenceType: ReferenceType.COUPON,
      metadata: { couponCode, discount },
    });
  }

  // --- Customer: Wishlist ---

  async notifyWishlistStockOrPriceChange(
    productId: string,
    productTitle: string,
    previousStock: number,
    newStock: number,
    previousPrice: number,
    newPrice: number,
  ): Promise<void> {
    const wishlistEntries = await this.wishlistModel.find({ productId });

    for (const entry of wishlistEntries) {
      const userId = entry.userId;

      if (previousStock === 0 && newStock > 0) {
        await this.notificationsService.createNotification({
          userId,
          type: NotificationType.WISHLIST_BACK_IN_STOCK,
          title: 'Back in Stock',
          message: `${productTitle} from your wishlist is back in stock.`,
          referenceId: productId,
          referenceType: ReferenceType.PRODUCT,
          metadata: { productTitle, stock: newStock },
        });
      }

      if (newPrice < previousPrice) {
        await this.createIfNotDuplicate({
          userId,
          type: NotificationType.WISHLIST_PRICE_DROP,
          title: 'Price Drop Alert',
          message: `${productTitle} dropped from ₹${previousPrice} to ₹${newPrice}.`,
          referenceId: productId,
          referenceType: ReferenceType.PRODUCT,
          metadata: {
            productTitle,
            previousPrice,
            newPrice,
          },
        });
      }
    }
  }

  // --- Merchant ---

  async notifyMerchantNewOrder(
    merchantId: string,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId: merchantId,
      type: NotificationType.NEW_ORDER,
      title: 'New Order Received',
      message: `You have a new order: ${orderNumber}.`,
      referenceId: orderId,
      referenceType: ReferenceType.ORDER,
      metadata: { orderNumber },
    });
  }

  async notifyMerchantNewReview(
    merchantId: string,
    reviewId: string,
    productTitle: string,
    rating: number,
  ): Promise<void> {
    await this.notificationsService.createNotification({
      userId: merchantId,
      type: NotificationType.NEW_REVIEW,
      title: 'New Product Review',
      message: `${productTitle} received a ${rating}-star review.`,
      referenceId: reviewId,
      referenceType: ReferenceType.REVIEW,
      metadata: { productTitle, rating },
    });
  }

  async notifyMerchantStockLevel(
    merchantId: string,
    productId: string,
    productTitle: string,
    stock: number,
  ): Promise<void> {
    if (stock === 0) {
      await this.createIfNotDuplicate({
        userId: merchantId,
        type: NotificationType.OUT_OF_STOCK,
        title: 'Out of Stock',
        message: `${productTitle} is now out of stock.`,
        referenceId: productId,
        referenceType: ReferenceType.PRODUCT,
        metadata: { productTitle, stock },
      });
    } else if (stock <= LOW_STOCK_THRESHOLD) {
      await this.createIfNotDuplicate({
        userId: merchantId,
        type: NotificationType.LOW_STOCK,
        title: 'Low Stock Alert',
        message: `${productTitle} has only ${stock} units left.`,
        referenceId: productId,
        referenceType: ReferenceType.PRODUCT,
        metadata: { productTitle, stock },
      });
    }
  }

  // --- Admin ---

  async notifyNewMerchantRegistered(
    merchantId: string,
    merchantName: string,
    email: string,
  ): Promise<void> {
    await this.notifyAllAdmins(
      NotificationType.NEW_MERCHANT_REGISTERED,
      'New Merchant Registered',
      `${merchantName} (${email}) has registered as a merchant.`,
      merchantId,
      ReferenceType.USER,
      { merchantName, email },
    );
  }

  async notifyProductReported(
    reportId: string,
    productId: string,
    productTitle: string,
    reason: string,
    reportedBy: string,
  ): Promise<void> {
    await this.notifyAllAdmins(
      NotificationType.PRODUCT_REPORTED,
      'Product Reported',
      `Product "${productTitle}" was reported: ${reason}`,
      reportId,
      ReferenceType.REPORT,
      { productId, productTitle, reason, reportedBy },
    );
  }
}
