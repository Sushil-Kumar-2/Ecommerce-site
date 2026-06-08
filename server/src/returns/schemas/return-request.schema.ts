import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ReturnStatus } from '../return.enums';

export type ReturnRequestDocument = HydratedDocument<ReturnRequest>;

@Schema({
  timestamps: true,
})
export class ReturnRequest {
  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({
    required: true,
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
    index: true,
  })
  status: ReturnStatus;

  @Prop({ type: Date, required: true, default: Date.now })
  requestedAt: Date;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ min: 1 })
  quantity?: number;

  @Prop({ min: 0 })
  refundAmount?: number;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);

ReturnRequestSchema.index({ userId: 1, createdAt: -1 });
ReturnRequestSchema.index({ orderId: 1, productId: 1, status: 1 });
