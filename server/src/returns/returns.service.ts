import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  ReturnRequest,
  ReturnRequestDocument,
} from './schemas/return-request.schema';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnStatus } from './return.enums';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { InventoryTransactionType } from '../inventory/inventory.enums';
import { OrderStatus, PaymentStatus } from '../orders/order.enums';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { OrderItem } from '../orders/schemas/order.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(ReturnRequest.name)
    private readonly returnModel: Model<ReturnRequestDocument>,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly notificationEvents: NotificationEventsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(userId: string, dto: CreateReturnDto): Promise<ReturnRequestDocument> {
    if (!isValidObjectId(dto.orderId) || !isValidObjectId(dto.productId)) {
      throw new NotFoundException('Order or product not found');
    }

    const order = await this.ordersService.findOne(dto.orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('You can only request returns for your own orders');
    }

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Returns are allowed only for delivered orders');
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Returns are allowed only for paid orders');
    }

    const orderItem = this.findOrderItem(order.items, dto.productId);

    if (!orderItem) {
      throw new BadRequestException('Product not found in this order');
    }

    const existingActive = await this.returnModel.findOne({
      orderId: dto.orderId,
      productId: dto.productId,
      status: { $in: [ReturnStatus.PENDING, ReturnStatus.APPROVED] },
    });

    if (existingActive) {
      throw new BadRequestException(
        'An active return request already exists for this product',
      );
    }

    const alreadyRefunded = await this.returnModel.findOne({
      orderId: dto.orderId,
      productId: dto.productId,
      status: ReturnStatus.REFUNDED,
    });

    if (alreadyRefunded) {
      throw new BadRequestException('This product has already been refunded');
    }

    return this.returnModel.create({
      orderId: dto.orderId,
      productId: dto.productId,
      userId,
      reason: dto.reason,
      status: ReturnStatus.PENDING,
      requestedAt: new Date(),
      quantity: orderItem.quantity,
      refundAmount: orderItem.price * orderItem.quantity,
    });
  }

  async findMyReturns(userId: string): Promise<ReturnRequestDocument[]> {
    return this.returnModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, user: JwtUser): Promise<ReturnRequestDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Return request not found');
    }

    const returnRequest = await this.returnModel.findById(id);

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (user.role !== 'admin' && returnRequest.userId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return returnRequest;
  }

  async approve(id: string, actor?: JwtUser): Promise<ReturnRequestDocument> {
    const returnRequest = await this.findReturnOrThrow(id);

    if (returnRequest.status !== ReturnStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve a return with status ${returnRequest.status}`,
      );
    }

    returnRequest.status = ReturnStatus.APPROVED;
    returnRequest.approvedAt = new Date();
    await returnRequest.save();

    const order = await this.ordersService.findOne(returnRequest.orderId);
    const orderItem = this.findOrderItem(order.items, returnRequest.productId);

    await this.notificationEvents.notifyReturnApproved(
      returnRequest.userId,
      returnRequest._id.toString(),
      returnRequest.orderId,
      order.orderNumber,
      orderItem?.title ?? 'Product',
    );

    if (actor) {
      await this.auditLogsService.createLog({
        userId: actor.userId,
        role: actor.role,
        action: AuditAction.REFUND_APPROVED,
        resource: AuditResource.RETURN,
        resourceId: returnRequest._id.toString(),
        metadata: {
          orderId: returnRequest.orderId,
          orderNumber: order.orderNumber,
          productId: returnRequest.productId,
          customerId: returnRequest.userId,
        },
      });
    }

    return returnRequest;
  }

  async reject(id: string, adminNote?: string): Promise<ReturnRequestDocument> {
    const returnRequest = await this.findReturnOrThrow(id);

    if (returnRequest.status !== ReturnStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject a return with status ${returnRequest.status}`,
      );
    }

    returnRequest.status = ReturnStatus.REJECTED;
    if (adminNote) {
      returnRequest.reason = `${returnRequest.reason} | Admin: ${adminNote}`;
    }
    await returnRequest.save();

    return returnRequest;
  }

  async processRefund(id: string, actor?: JwtUser): Promise<ReturnRequestDocument> {
    const returnRequest = await this.findReturnOrThrow(id);

    if (returnRequest.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved return requests can be refunded',
      );
    }

    const order = await this.ordersService.findOne(returnRequest.orderId);
    const orderItem = this.findOrderItem(order.items, returnRequest.productId);

    if (!orderItem) {
      throw new BadRequestException('Product not found in order');
    }

    const quantity = returnRequest.quantity ?? orderItem.quantity;
    const refundAmount =
      returnRequest.refundAmount ?? orderItem.price * quantity;

    await this.ordersService.initiateRefund(returnRequest.orderId);

    await this.productsService.releaseStock(returnRequest.productId, quantity, {
      type: InventoryTransactionType.RETURN,
      referenceId: returnRequest._id.toString(),
    });

    returnRequest.status = ReturnStatus.REFUNDED;
    returnRequest.refundedAt = new Date();
    returnRequest.refundAmount = refundAmount;
    await returnRequest.save();

    await this.notificationEvents.notifyRefundCompleted(
      returnRequest.userId,
      returnRequest.orderId,
      order.orderNumber,
      refundAmount,
    );

    const fullyReturned = await this.isOrderFullyReturned(
      returnRequest.orderId,
      order.items,
    );

    if (fullyReturned) {
      await this.ordersService.markOrderRefunded(returnRequest.orderId);
    }

    if (actor) {
      await this.auditLogsService.createLog({
        userId: actor.userId,
        role: actor.role,
        action: AuditAction.REFUND_COMPLETED,
        resource: AuditResource.RETURN,
        resourceId: returnRequest._id.toString(),
        metadata: {
          orderId: returnRequest.orderId,
          orderNumber: order.orderNumber,
          refundAmount,
          customerId: returnRequest.userId,
        },
      });
    }

    return returnRequest;
  }

  private async findReturnOrThrow(id: string): Promise<ReturnRequestDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Return request not found');
    }

    const returnRequest = await this.returnModel.findById(id);

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return returnRequest;
  }

  private findOrderItem(
    items: OrderItem[],
    productId: string,
  ): OrderItem | undefined {
    return items.find((item) => item.productId === productId);
  }

  private async isOrderFullyReturned(
    orderId: string,
    items: OrderItem[],
  ): Promise<boolean> {
    const refundedReturns = await this.returnModel.find({
      orderId,
      status: ReturnStatus.REFUNDED,
    });

    const refundedProductIds = new Set(
      refundedReturns.map((entry) => entry.productId),
    );

    return items.every((item) => refundedProductIds.has(item.productId));
  }
}
