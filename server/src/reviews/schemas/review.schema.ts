import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
