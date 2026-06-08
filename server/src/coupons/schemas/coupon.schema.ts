import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['percentage', 'fixed'],
  })
  discountType: string;

  @Prop({
    required: true,
    min: 0,
  })
  discountValue: number;

  @Prop({
    min: 0,
    default: 0,
  })
  minimumOrderAmount: number;

  @Prop()
  maximumDiscountAmount?: number;

  @Prop({
    required: true,
  })
  startDate: Date;

  @Prop({
    required: true,
  })
  expiryDate: Date;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: 0,
  })
  usageCount: number;

  @Prop()
  usageLimit?: number;

  @Prop({
    type: [String],
    default: [],
  })
  usedBy: string[];

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
export type CouponDocument = HydratedDocument<Coupon>;
