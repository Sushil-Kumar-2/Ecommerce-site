import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductReportDocument = HydratedDocument<ProductReport>;

@Schema({
  timestamps: true,
})
export class ProductReport {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const ProductReportSchema = SchemaFactory.createForClass(ProductReport);
