import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

WishlistSchema.index(
  {
    userId: 1,
    productId: 1,
  },
  {
    unique: true,
  },
);
