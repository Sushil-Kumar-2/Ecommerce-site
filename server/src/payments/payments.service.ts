import {
  Inject,
  Injectable,
  NotFoundException,
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

    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: 'INR',
      receipt: order.orderNumber,
    });
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

    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';

    let isValid = isDevelopment;

    if (!isDevelopment) {
      const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac(
          'sha256',
          this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
        )
        .update(body)
        .digest('hex');

      isValid = expectedSignature === dto.razorpaySignature;
    }

    if (!isValid) {
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
