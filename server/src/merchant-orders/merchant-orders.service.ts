import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  MerchantFulfillment,
} from '../orders/schemas/order.schema';
import { MerchantFulfillmentStatus } from '../orders/merchant-fulfillment.enums';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../orders/order.enums';
import { MerchantOrderFilterDto } from './dto/merchant-order-filter.dto';
import { ShipMerchantOrderDto } from './dto/ship-merchant-order.dto';
import {
  MerchantOrderSummary,
  MerchantOrderView,
  PaginatedMerchantOrders,
} from './interfaces/merchant-order-view.interface';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class MerchantOrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly notificationEvents: NotificationEventsService,
  ) {}

  async findAll(
    merchantId: string,
    filter: MerchantOrderFilterDto = {},
  ): Promise<PaginatedMerchantOrders> {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;
    const normalizedMerchantId = this.normalizeMerchantId(merchantId);

    const query: {
      merchantIds: string;
      orderStatus?: OrderStatus;
      merchantFulfillments?: {
        $elemMatch: { merchantId: string; status: MerchantFulfillmentStatus };
      };
    } = {
      merchantIds: normalizedMerchantId,
    };

    if (filter.orderStatus) {
      query.orderStatus = filter.orderStatus;
    }

    if (filter.status) {
      query['merchantFulfillments'] = {
        $elemMatch: {
          merchantId: normalizedMerchantId,
          status: filter.status,
        },
      };
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.orderModel.countDocuments(query),
    ]);

    const ordersToPersist: OrderDocument[] = [];

    const data = orders.map((order) => {
      const wasPatched = this.ensureMerchantFulfillment(
        order,
        normalizedMerchantId,
      );
      if (wasPatched) {
        ordersToPersist.push(order);
      }
      return this.toMerchantView(order, normalizedMerchantId);
    });

    if (ordersToPersist.length > 0) {
      await Promise.all(ordersToPersist.map((order) => order.save()));
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(
    merchantId: string,
    orderId: string,
  ): Promise<MerchantOrderView> {
    const order = await this.findMerchantOrderOrThrow(merchantId, orderId);
    return this.toMerchantView(order, merchantId);
  }

  async getSummary(merchantId: string): Promise<MerchantOrderSummary> {
    const normalizedMerchantId = this.normalizeMerchantId(merchantId);
    const orders = await this.orderModel.find({
      merchantIds: normalizedMerchantId,
    });

    const summary: MerchantOrderSummary = {
      total: orders.length,
      pending: 0,
      accepted: 0,
      readyToShip: 0,
      shipped: 0,
      rejected: 0,
    };

    const ordersToPersist: OrderDocument[] = [];

    for (const order of orders) {
      const wasPatched = this.ensureMerchantFulfillment(
        order,
        normalizedMerchantId,
      );
      if (wasPatched) {
        ordersToPersist.push(order);
      }

      const fulfillment = this.getMerchantFulfillment(
        order,
        normalizedMerchantId,
      );
      if (!fulfillment) continue;

      switch (fulfillment.status) {
        case MerchantFulfillmentStatus.PENDING:
          summary.pending++;
          break;
        case MerchantFulfillmentStatus.ACCEPTED:
          summary.accepted++;
          break;
        case MerchantFulfillmentStatus.READY_TO_SHIP:
          summary.readyToShip++;
          break;
        case MerchantFulfillmentStatus.SHIPPED:
          summary.shipped++;
          break;
        case MerchantFulfillmentStatus.REJECTED:
          summary.rejected++;
          break;
      }
    }

    if (ordersToPersist.length > 0) {
      await Promise.all(ordersToPersist.map((order) => order.save()));
    }

    return summary;
  }

  async accept(
    merchantId: string,
    orderId: string,
  ): Promise<MerchantOrderView> {
    const order = await this.findMerchantOrderOrThrow(merchantId, orderId);
    this.assertOrderActionable(order);

    const fulfillment = this.getMerchantFulfillment(order, merchantId);

    if (!fulfillment) {
      throw new NotFoundException('Merchant fulfillment record not found');
    }

    if (fulfillment.status !== MerchantFulfillmentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept order with status ${fulfillment.status}`,
      );
    }

    fulfillment.status = MerchantFulfillmentStatus.ACCEPTED;
    fulfillment.acceptedAt = new Date();

    if (order.orderStatus === OrderStatus.CONFIRMED) {
      order.orderStatus = OrderStatus.PROCESSING;
    }

    await order.save();
    return this.toMerchantView(order, merchantId);
  }

  async readyToShip(
    merchantId: string,
    orderId: string,
  ): Promise<MerchantOrderView> {
    const order = await this.findMerchantOrderOrThrow(merchantId, orderId);
    this.assertOrderActionable(order);

    const fulfillment = this.getMerchantFulfillment(order, merchantId);

    if (!fulfillment) {
      throw new NotFoundException('Merchant fulfillment record not found');
    }

    if (fulfillment.status !== MerchantFulfillmentStatus.ACCEPTED) {
      throw new BadRequestException(
        'Order must be accepted before marking ready to ship',
      );
    }

    fulfillment.status = MerchantFulfillmentStatus.READY_TO_SHIP;
    fulfillment.readyToShipAt = new Date();

    await order.save();
    return this.toMerchantView(order, merchantId);
  }

  async ship(
    merchantId: string,
    orderId: string,
    dto: ShipMerchantOrderDto,
  ): Promise<MerchantOrderView> {
    const order = await this.findMerchantOrderOrThrow(merchantId, orderId);
    this.assertOrderActionable(order);

    const fulfillment = this.getMerchantFulfillment(order, merchantId);

    if (!fulfillment) {
      throw new NotFoundException('Merchant fulfillment record not found');
    }

    if (fulfillment.status !== MerchantFulfillmentStatus.READY_TO_SHIP) {
      throw new BadRequestException(
        'Order must be ready to ship before dispatching',
      );
    }

    fulfillment.status = MerchantFulfillmentStatus.SHIPPED;
    fulfillment.shippedAt = new Date();
    fulfillment.trackingNumber = dto.trackingNumber;
    fulfillment.carrier = dto.carrier;

    await this.syncGlobalOrderStatus(order);
    await order.save();

    await this.notificationEvents.notifyOrderShipped(
      order.userId,
      order._id.toString(),
      order.orderNumber,
    );

    return this.toMerchantView(order, merchantId);
  }

  async reject(
    merchantId: string,
    orderId: string,
    reason: string,
  ): Promise<MerchantOrderView> {
    const order = await this.findMerchantOrderOrThrow(merchantId, orderId);
    this.assertOrderActionable(order);

    const fulfillment = this.getMerchantFulfillment(order, merchantId);

    if (!fulfillment) {
      throw new NotFoundException('Merchant fulfillment record not found');
    }

    if (
      fulfillment.status !== MerchantFulfillmentStatus.PENDING &&
      fulfillment.status !== MerchantFulfillmentStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot reject order with status ${fulfillment.status}`,
      );
    }

    fulfillment.status = MerchantFulfillmentStatus.REJECTED;
    fulfillment.rejectReason = reason;

    await order.save();
    return this.toMerchantView(order, merchantId);
  }

  private async findMerchantOrderOrThrow(
    merchantId: string,
    orderId: string,
  ): Promise<OrderDocument> {
    if (!isValidObjectId(orderId)) {
      throw new NotFoundException('Order not found');
    }

    const normalizedMerchantId = this.normalizeMerchantId(merchantId);
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      !order.merchantIds.some(
        (id) => this.normalizeMerchantId(id) === normalizedMerchantId,
      )
    ) {
      throw new ForbiddenException('This order does not belong to you');
    }

    const wasPatched = this.ensureMerchantFulfillment(
      order,
      normalizedMerchantId,
    );
    if (wasPatched) {
      await order.save();
    }

    return order;
  }

  private ensureMerchantFulfillment(
    order: OrderDocument,
    merchantId: string,
  ): boolean {
    if (!order.merchantFulfillments) {
      order.merchantFulfillments = [];
    }

    const normalizedMerchantId = this.normalizeMerchantId(merchantId);
    const exists = order.merchantFulfillments.some(
      (entry) =>
        this.normalizeMerchantId(entry.merchantId) === normalizedMerchantId,
    );

    if (!exists) {
      order.merchantFulfillments.push({
        merchantId: normalizedMerchantId,
        status: MerchantFulfillmentStatus.PENDING,
      });
      return true;
    }

    return false;
  }

  private getMerchantFulfillment(
    order: OrderDocument,
    merchantId: string,
  ): MerchantFulfillment | undefined {
    const normalizedMerchantId = this.normalizeMerchantId(merchantId);
    return order.merchantFulfillments?.find(
      (entry) =>
        this.normalizeMerchantId(entry.merchantId) === normalizedMerchantId,
    );
  }

  private normalizeMerchantId(id: unknown): string {
    if (id === null || id === undefined) {
      return '';
    }

    if (typeof id === 'object' && id !== null && 'toString' in id) {
      return (id as { toString: () => string }).toString();
    }

    return String(id);
  }

  private assertOrderActionable(order: OrderDocument): void {
    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled orders cannot be updated');
    }

    if (order.orderStatus === OrderStatus.DELIVERED) {
      throw new BadRequestException('Delivered orders cannot be updated');
    }

    if (
      order.paymentMethod === PaymentMethod.RAZORPAY &&
      order.paymentStatus !== PaymentStatus.PAID
    ) {
      throw new BadRequestException(
        'Cannot process order until payment is completed',
      );
    }

    if (
      order.paymentMethod === PaymentMethod.COD &&
      order.orderStatus === OrderStatus.PENDING
    ) {
      throw new BadRequestException(
        'Order must be confirmed before merchant processing',
      );
    }
  }

  private async syncGlobalOrderStatus(order: OrderDocument): Promise<void> {
    const fulfillments = order.merchantFulfillments ?? [];

    if (fulfillments.length === 0) {
      return;
    }

    const allShipped = fulfillments.every(
      (entry) => entry.status === MerchantFulfillmentStatus.SHIPPED,
    );

    if (
      allShipped &&
      (order.orderStatus === OrderStatus.PROCESSING ||
        order.orderStatus === OrderStatus.CONFIRMED)
    ) {
      order.orderStatus = OrderStatus.SHIPPED;
      order.shippedAt = new Date();
      order.trackingNumber =
        fulfillments.find((entry) => entry.trackingNumber)?.trackingNumber ??
        order.trackingNumber;
    }
  }

  private toMerchantView(
    order: OrderDocument,
    merchantId: string,
  ): MerchantOrderView {
    const normalizedMerchantId = this.normalizeMerchantId(merchantId);
    this.ensureMerchantFulfillment(order, normalizedMerchantId);

    const merchantItems = order.items.filter(
      (item) =>
        this.normalizeMerchantId(item.merchantId) === normalizedMerchantId,
    );

    const fulfillment = this.getMerchantFulfillment(
      order,
      normalizedMerchantId,
    );

    if (!fulfillment) {
      throw new NotFoundException('Merchant fulfillment record not found');
    }

    const merchantSubtotal = merchantItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      items: merchantItems,
      merchantFulfillment: fulfillment,
      merchantSubtotal,
      createdAt:
        (order as Order & { createdAt?: Date }).createdAt ?? new Date(),
    };
  }
}
