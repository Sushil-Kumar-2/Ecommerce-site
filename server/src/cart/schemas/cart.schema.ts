import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({
  _id: false,
})
export class CartItem {
  @Prop({
    required: true,
  })
  productId: string;

  @Prop({
    required: true,
  })
  quantity: number;

  @Prop({
    required: true,
  })
  price: number;

  @Prop()
  variantName?: string;

  @Prop()
  variantValue?: string;
}

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    type: [CartItem],
    default: [],
  })
  items: CartItem[];

  @Prop({
    default: 0,
  })
  totalAmount: number;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
