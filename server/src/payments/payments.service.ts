import { Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../orders/schemas/order.schema';
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

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly notificationEvents: NotificationEventsService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }
  async createRazorpayOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.totalAmount * 100, // paise
      currency: 'INR',
      receipt: order.orderNumber,
    });
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

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

    return {
      success: true,
      message: 'Payment verified successfully',
      order,
    };
  }

  async markPaymentFailed(orderId: string) {
    return this.ordersService.handlePaymentFailure(
      orderId,
      'Payment gateway failed',
    );
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
