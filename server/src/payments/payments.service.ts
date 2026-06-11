import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '../orders/order.enums';
import { OrdersService } from '../orders/orders.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly notificationEvents: NotificationEventsService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }

  async createPaymentRecord(
    order: OrderDocument,
    status: PaymentStatus = PaymentStatus.PENDING,
  ) {
    return this.paymentModel.create({
      orderId: order._id.toString(),
      userId: order.userId,
      amount: order.totalAmount,
      method: order.paymentMethod,
      status,
      gatewayOrderId: order.razorpayOrderId,
      gatewayPaymentId: order.paymentId,
      paidAt: order.paidAt,
    });
  }

  async createRazorpayOrder(orderId: string) {
    await this.ordersService.prepareOrderForPaymentRetry(orderId);

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    if (amountInPaise < 100) {
      throw new BadRequestException(
        'Order amount must be at least 100 paise (₹1)',
      );
    }

    let razorpayOrder;

    try {
      razorpayOrder = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
      });
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 401) {
        throw new UnauthorizedException('Razorpay authentication failed');
      }

      throw new InternalServerErrorException('Failed to create Razorpay order');
    }
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    await this.paymentModel.findOneAndUpdate(
      { orderId: order._id.toString() },
      {
        status: PaymentStatus.PENDING,
        gatewayOrderId: razorpayOrder.id,
        gatewayPaymentId: undefined,
        paidAt: undefined,
      },
    );

    return {
      key: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const order = await this.orderModel.findById(dto.orderId);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.paymentMethod !== PaymentMethod.RAZORPAY) {
      throw new BadRequestException('This order is not a Razorpay order');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot verify payment for a cancelled order',
      );
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return {
        success: true,
        message: 'Payment already verified',
        order,
      };
    }

    const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
      )
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    order.paymentStatus = PaymentStatus.PAID;
    order.paymentId = dto.razorpayPaymentId;
    order.paidAt = new Date();

    if (order.orderStatus === OrderStatus.PENDING) {
      order.orderStatus = OrderStatus.CONFIRMED;
    }

    await order.save();

    await this.paymentModel.findOneAndUpdate(
      { orderId: order._id.toString() },
      {
        status: PaymentStatus.PAID,
        gatewayPaymentId: dto.razorpayPaymentId,
        paidAt: order.paidAt,
      },
      { upsert: true, new: true },
    );

    await this.notificationEvents.notifyPaymentSuccess(
      order.userId,
      order._id.toString(),
      order.orderNumber,
      order.totalAmount,
    );

    if (order.orderStatus === OrderStatus.CONFIRMED) {
      await this.notificationEvents.notifyOrderConfirmed(
        order.userId,
        order._id.toString(),
        order.orderNumber,
      );
    }

    await this.ordersService.clearUserCartAfterPayment(order.userId);

    return {
      success: true,
      message: 'Payment verified successfully',
      order,
    };
  }

  async refundPaidOrder(orderId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      return order;
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    if (order.paymentMethod !== PaymentMethod.RAZORPAY) {
      throw new BadRequestException('Only Razorpay payments support automatic refund');
    }

    if (!order.paymentId) {
      throw new BadRequestException('Payment ID not found for refund');
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    try {
      await this.razorpay.payments.refund(order.paymentId, {
        amount: amountInPaise,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          reason: 'order_cancelled',
        },
      });
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 401) {
        throw new UnauthorizedException('Razorpay authentication failed');
      }

      throw new InternalServerErrorException('Failed to process refund');
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    await order.save();

    await this.paymentModel.findOneAndUpdate(
      { orderId: order._id.toString() },
      { status: PaymentStatus.REFUNDED },
    );

    await this.notificationEvents.notifyRefundInitiated(
      order.userId,
      order._id.toString(),
      order.orderNumber,
    );

    await this.notificationEvents.notifyRefundCompleted(
      order.userId,
      order._id.toString(),
      order.orderNumber,
      order.totalAmount,
    );

    return order;
  }

  async markPaymentFailed(orderId: string) {
    await this.paymentModel.findOneAndUpdate(
      { orderId },
      { status: PaymentStatus.FAILED },
    );

    return this.ordersService.handlePaymentFailure(
      orderId,
      'Payment gateway failed',
    );
  }

  findAll() {
    return this.paymentModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    await payment.deleteOne();
    return { success: true };
  }
}
