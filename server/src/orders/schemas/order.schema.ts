import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../order.enums';
import { MerchantFulfillmentStatus } from '../merchant-fulfillment.enums';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  merchantId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  variantDetails?: string;

  /** Set after inventory is returned on order cancellation (crash-safe idempotency). */
  @Prop({ default: false })
  stockReleased?: boolean;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class MerchantFulfillment {
  @Prop({ required: true })
  merchantId: string;

  @Prop({
    required: true,
    enum: MerchantFulfillmentStatus,
    default: MerchantFulfillmentStatus.PENDING,
  })
  status: MerchantFulfillmentStatus;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  readyToShipAt?: Date;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop()
  trackingNumber?: string;

  @Prop()
  carrier?: string;

  @Prop()
  rejectReason?: string;
}

export const MerchantFulfillmentSchema =
  SchemaFactory.createForClass(MerchantFulfillment);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, trim: true })
  addressLine1: string;

  @Prop()
  addressLine2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true })
  pincode: string;

  @Prop()
  landmark?: string;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    required: true,
    unique: true,
  })
  orderNumber: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [OrderItemSchema],
    required: true,
    default: [],
  })
  items: OrderItem[];

  @Prop()
  couponCode?: string;

  @Prop({
    type: ShippingAddressSchema,
    required: true,
  })
  shippingAddress: ShippingAddress;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  shippingCharge: number;

  @Prop({ required: true, min: 0, default: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop()
  paymentId?: string;

  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({
    required: true,
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  merchantIds: string[];

  @Prop({
    type: [MerchantFulfillmentSchema],
    default: [],
  })
  merchantFulfillments: MerchantFulfillment[];

  @Prop()
  paymentFailureReason?: string;

  @Prop({ type: Date })
  paymentFailedAt?: Date;

  @Prop()
  trackingNumber?: string;

  @Prop({ type: Date })
  estimatedDeliveryDate?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancelReason?: string;

  /** Prevents double stock restore on cancel (idempotency). */
  @Prop({ default: false })
  stockRestored: boolean;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  outForDeliveryAt?: Date;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
