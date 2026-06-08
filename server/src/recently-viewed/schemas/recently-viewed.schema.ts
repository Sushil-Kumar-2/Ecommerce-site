import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecentlyViewedDocument = HydratedDocument<RecentlyViewed>;

@Schema({
  timestamps: true,
})
export class RecentlyViewed {
  @Prop({
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    required: true,
    index: true,
  })
  productId: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const RecentlyViewedSchema =
  SchemaFactory.createForClass(RecentlyViewed);

RecentlyViewedSchema.index(
  {
    userId: 1,
    productId: 1,
  },
  {
    unique: true,
  },
);
