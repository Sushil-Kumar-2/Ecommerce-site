import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  Order,
  OrderItem,
  ShippingAddress,
  OrderDocument,
} from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { AddressesService } from '../addresses/addresses.service';
import { AddressDocument } from '../addresses/schemas/address.schema';
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enums';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  InsufficientStockException,
  InsufficientStockItem,
} from '../common/exceptions/insufficient-stock.exception';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { InventoryTransactionType } from '../inventory/inventory.enums';
import { MerchantFulfillmentStatus } from './merchant-fulfillment.enums';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  /** Inventory is returned only while fulfilment has not started. */
  private static readonly STOCK_RESTORABLE_STATUSES: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
  ];

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly addressesService: AddressesService,
    private readonly couponsService: CouponsService,
    private readonly notificationEvents: NotificationEventsService,
    private readonly auditLogsService: AuditLogsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const address = await this.resolveOrderAddress(createOrderDto, userId);

    const cart = await this.cartService.findRawCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let discountAmount = 0;
    let couponCode: string | undefined;

    const subtotal = cart.totalAmount;

    if (createOrderDto.couponCode) {
      const couponResult = await this.couponsService.applyCoupon(
        createOrderDto.couponCode,
        subtotal,
        userId,
      );

      discountAmount = couponResult.discount;
      couponCode = couponResult.code;
    }

    const totalAmount = subtotal - discountAmount;

    const productIds = cart.items.map((item) =>
      this.normalizeProductId(item.productId),
    );
    const products = await this.productsService.findByIds(productIds);
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    this.assertCartStockAvailable(cart.items, productMap);

    const reservations = cart.items.map((item) => ({
      productId: this.normalizeProductId(item.productId),
      quantity: item.quantity,
    }));

    const orderNumber = `ORD-${Date.now()}`;

    await this.productsService.reserveMultipleStocks(reservations, {
      type: InventoryTransactionType.ORDER,
      referenceId: orderNumber,
    });

    const orderItems: OrderItem[] = cart.items.map((item) => {
      const product = productMap.get(this.normalizeProductId(item.productId));

      if (!product) {
        throw new BadRequestException(
          `Product not found: ${this.normalizeProductId(item.productId)}`,
        );
      }

      return {
        productId: product._id.toString(),
        merchantId: product.merchantId.toString(),
        title: product.title,
        image: product.images?.[0] || '',
        price: item.price,
        quantity: item.quantity,
        variantDetails:
          item.variantName && item.variantValue
            ? `${item.variantName}: ${item.variantValue}`
            : undefined,
      };
    });

    const merchantIds = [...new Set(orderItems.map((item) => item.merchantId))];

    const orderData = {
      orderNumber,
      userId,
      items: orderItems,
      shippingAddress: this.toShippingAddress(address),
      subtotal,
      shippingCharge: 0,
      discountAmount,
      totalAmount,
      couponCode,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus:
        createOrderDto.paymentMethod === PaymentMethod.COD
          ? OrderStatus.CONFIRMED
          : OrderStatus.PENDING,
      merchantIds,
      merchantFulfillments: merchantIds.map((merchantId) => ({
        merchantId,
        status: MerchantFulfillmentStatus.PENDING,
      })),
      stockRestored: false,
    };

    try {
      const newOrder = new this.orderModel(orderData);
      await newOrder.save();

      await this.paymentsService.createPaymentRecord(newOrder);

      if (couponCode) {
        await this.couponsService.markCouponAsUsed(couponCode, userId);
        await this.notificationEvents.notifyCouponApplied(
          userId,
          couponCode,
          discountAmount,
        );
      }

      // COD is confirmed immediately; online payments clear cart only after success.
      if (createOrderDto.paymentMethod === PaymentMethod.COD) {
        await this.cartService.clearCart(userId);
      }

      await this.notificationEvents.notifyOrderCreated(
        userId,
        newOrder._id.toString(),
        newOrder.orderNumber,
      );

      for (const merchantId of merchantIds) {
        await this.notificationEvents.notifyMerchantNewOrder(
          merchantId,
          newOrder._id.toString(),
          newOrder.orderNumber,
        );
      }

      return {
        order: newOrder,
        requiresPayment:
          createOrderDto.paymentMethod === PaymentMethod.RAZORPAY,
      };
    } catch (error) {
      for (const { productId, quantity } of reservations) {
        await this.productsService.releaseStock(productId, quantity, {
          type: InventoryTransactionType.CANCEL,
          referenceId: orderNumber,
        });
      }
      throw error;
    }
  }

  private async resolveOrderAddress(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<AddressDocument> {
    return this.addressesService.resolveForCheckout(
      userId,
      createOrderDto.addressId,
    );
  }

  private toShippingAddress(address: AddressDocument): ShippingAddress {
    return {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      landmark: address.landmark,
    };
  }

  private normalizeProductId(productId: unknown): string {
    return String(productId);
  }

  private assertCartStockAvailable(
    cartItems: { productId: unknown; quantity: number }[],
    productMap: Map<string, Awaited<ReturnType<ProductsService['findOne']>>>,
  ) {
    const insufficientItems: InsufficientStockItem[] = [];

    for (const item of cartItems) {
      const productId = this.normalizeProductId(item.productId);
      const product = productMap.get(productId);

      if (!product) {
        throw new BadRequestException(`Product not found: ${productId}`);
      }

      if (product.stock === 0 || product.stock < item.quantity) {
        insufficientItems.push({
          productId,
          title: product.title,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
        });
      }
    }

    if (insufficientItems.length === 0) {
      return;
    }

    const first = insufficientItems[0];
    const message =
      first.availableStock === 0
        ? `${first.title} is out of stock`
        : `${first.title} has only ${first.availableStock} items left in stock`;

    throw new InsufficientStockException(message, insufficientItems);
  }

  async findMyOrders(userId: string) {
    return this.orderModel.find({
      userId,
    });
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled order cannot be updated');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],

      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],

      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],

      [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],

      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],

      [OrderStatus.DELIVERED]: [],

      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.orderStatus].includes(orderStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${order.orderStatus} to ${orderStatus}`,
      );
    }

    if (orderStatus === OrderStatus.CANCELLED) {
      return this.finalizeCancellation(order._id.toString(), {
        cancelReason: order.cancelReason ?? 'Cancelled by admin',
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (orderStatus === OrderStatus.OUT_FOR_DELIVERY) {
      order.outForDeliveryAt = new Date();
    }

    if (orderStatus === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    await order.save();

    await this.dispatchOrderStatusNotification(order, orderStatus);

    return order;
  }

  private async dispatchOrderStatusNotification(
    order: OrderDocument,
    orderStatus: OrderStatus,
  ): Promise<void> {
    const orderId = order._id.toString();
    const { orderNumber, userId } = order;

    switch (orderStatus) {
      case OrderStatus.CONFIRMED:
        await this.notificationEvents.notifyOrderConfirmed(
          userId,
          orderId,
          orderNumber,
        );
        break;
      case OrderStatus.SHIPPED:
        await this.notificationEvents.notifyOrderShipped(
          userId,
          orderId,
          orderNumber,
        );
        break;
      case OrderStatus.OUT_FOR_DELIVERY:
        await this.notificationEvents.notifyOutForDelivery(
          userId,
          orderId,
          orderNumber,
        );
        break;
      case OrderStatus.DELIVERED:
        await this.notificationEvents.notifyOrderDelivered(
          userId,
          orderId,
          orderNumber,
        );
        break;
      default:
        break;
    }
  }

  async initiateRefund(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    await this.notificationEvents.notifyRefundInitiated(
      order.userId,
      order._id.toString(),
      order.orderNumber,
    );

    return order;
  }

  async completeRefund(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    await order.save();

    await this.notificationEvents.notifyRefundCompleted(
      order.userId,
      order._id.toString(),
      order.orderNumber,
      order.totalAmount,
    );

    return order;
  }

  async markOrderRefunded(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      return order;
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    await order.save();

    return order;
  }

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findOneForUser(orderId: string, user: JwtUser) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== 'admin' && order.userId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async cancelOrder(orderId: string, user: JwtUser, reason: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== 'admin' && order.userId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      if (order.stockRestored) {
        return order;
      }
      if (
        order.paymentMethod === PaymentMethod.RAZORPAY &&
        order.paymentStatus !== PaymentStatus.PAID
      ) {
        throw new BadRequestException(
          'Payment must be completed before updating order status',
        );
      }

      return this.finalizeCancellation(
        orderId,
        {
          cancelReason: order.cancelReason ?? reason,
        },
        user,
      );
    }

    if (
      order.orderStatus === OrderStatus.SHIPPED ||
      order.orderStatus === OrderStatus.OUT_FOR_DELIVERY ||
      order.orderStatus === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    return this.finalizeCancellation(orderId, { cancelReason: reason }, user);
  }

  /**
   * 1. Mark order cancelled first (safe if server crashes mid-restore).
   * 2. Restore inventory per line item (skips items already marked stockReleased).
   * 3. Set stockRestored when every item is done.
   */
  private async finalizeCancellation(
    orderId: string,
    details: { cancelReason: string },
    actor?: JwtUser,
  ) {
    let wasJustCancelled = false;

    let order = await this.orderModel.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: { $in: OrdersService.STOCK_RESTORABLE_STATUSES },
      },
      {
        $set: {
          orderStatus: OrderStatus.CANCELLED,
          cancelReason: details.cancelReason,
          cancelledAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    if (order) {
      wasJustCancelled = true;
    }

    if (!order) {
      const existing = await this.orderModel.findById(orderId);

      if (!existing) {
        throw new NotFoundException('Order not found');
      }

      if (existing.orderStatus !== OrderStatus.CANCELLED) {
        throw new BadRequestException('Order cannot be cancelled');
      }

      if (existing.stockRestored) {
        return existing;
      }

      order = existing;
    }

    await this.restoreOrderInventory(orderId);

    const completed = await this.orderModel.findByIdAndUpdate(
      orderId,
      { $set: { stockRestored: true } },
      { returnDocument: 'after' },
    );

    let result = completed ?? order;

    if (wasJustCancelled) {
      await this.notificationEvents.notifyOrderCancelled(
        result.userId,
        result._id.toString(),
        result.orderNumber,
        details.cancelReason,
      );

      if (actor) {
        await this.auditLogsService.createLog({
          userId: actor.userId,
          role: actor.role,
          action: AuditAction.ORDER_CANCELLED,
          resource: AuditResource.ORDER,
          resourceId: result._id.toString(),
          metadata: {
            orderNumber: result.orderNumber,
            reason: details.cancelReason,
            customerId: result.userId,
          },
        });
      }

      if (
        result.paymentMethod === PaymentMethod.RAZORPAY &&
        result.paymentStatus === PaymentStatus.PAID &&
        result.paymentId
      ) {
        try {
          result = await this.paymentsService.refundPaidOrder(
            result._id.toString(),
          );
        } catch {
          await this.notificationEvents.notifyRefundInitiated(
            result.userId,
            result._id.toString(),
            result.orderNumber,
          );
        }
      }
    }

    return result;
  }

  /** Restores stock line-by-line; safe to retry after a crash. */
  private async restoreOrderInventory(orderId: string): Promise<void> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    for (const item of order.items) {
      if (item.stockReleased) {
        continue;
      }

      await this.productsService.releaseStock(item.productId, item.quantity, {
        type: InventoryTransactionType.CANCEL,
        referenceId: orderId,
      });

      const marked = await this.orderModel.updateOne(
        {
          _id: orderId,
          items: {
            $elemMatch: {
              productId: item.productId,
              stockReleased: { $ne: true },
            },
          },
        },
        { $set: { 'items.$.stockReleased': true } },
      );

      if (marked.modifiedCount === 0) {
        const fresh = await this.orderModel.findById(orderId);
        const freshItem = fresh?.items.find(
          (entry) => entry.productId === item.productId,
        );

        if (!freshItem?.stockReleased) {
          throw new BadRequestException(
            `Failed to record inventory restore for product ${item.productId}`,
          );
        }
      }
    }
  }

  async handlePaymentFailure(orderId: string, reason: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Cannot mark payment failed for a paid order',
      );
    }

    if (!order.stockRestored) {
      await this.restoreOrderInventory(orderId);
      order.stockRestored = true;
    }

    order.paymentStatus = PaymentStatus.FAILED;
    order.paymentFailureReason = reason;
    order.paymentFailedAt = new Date();

    await order.save();

    if (order.paymentMethod === PaymentMethod.RAZORPAY) {
      await this.cartService.restoreCartFromOrder(order.userId, order.items);
    }

    await this.notificationEvents.notifyPaymentFailed(
      order.userId,
      order._id.toString(),
      order.orderNumber,
      reason,
    );

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findOrderById(orderId: string) {
    return await this.orderModel.findById(orderId);
  }

  async clearUserCartAfterPayment(userId: string) {
    await this.cartService.clearCart(userId);
  }

  async prepareOrderForPaymentRetry(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentMethod !== PaymentMethod.RAZORPAY) {
      throw new BadRequestException(
        'This order does not require online payment',
      );
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    if (
      order.paymentStatus !== PaymentStatus.FAILED &&
      order.paymentStatus !== PaymentStatus.PENDING
    ) {
      throw new BadRequestException('Payment cannot be retried for this order');
    }

    if (order.stockRestored) {
      const reservations = order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await this.productsService.reserveMultipleStocks(reservations, {
        type: InventoryTransactionType.ORDER,
        referenceId: order.orderNumber,
      });

      for (const item of order.items) {
        item.stockReleased = false;
      }

      order.stockRestored = false;
    }

    order.paymentStatus = PaymentStatus.PENDING;
    order.paymentFailureReason = undefined;
    order.paymentFailedAt = undefined;

    await order.save();

    return order;
  }
}
