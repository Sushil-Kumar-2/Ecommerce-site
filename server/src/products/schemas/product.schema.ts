import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({
    required: true,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  merchantId: Types.ObjectId;

  @Prop({
    type: [String],
    default: [],
  })
  images: string[];

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  stock: number;

  /** Optimistic locking — incremented on every stock mutation */
  @Prop({
    default: 0,
    min: 0,
  })
  version: number;

  @Prop({
    default: 0,
    min: 0,
  })
  discountPrice: number;

  @Prop({
    type: [
      {
        name: String,
        value: String,
        stock: Number,
      },
    ],
    default: [],
  })
  variants: {
    name: string;
    value: string;
    stock: number;
  }[];

  @Prop({
    default: 0,
  })
  averageRating: number;

  @Prop({
    default: 0,
  })
  totalReviews: number;

  @Prop({
    default: false,
  })
  featured: boolean;

  @Prop({
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ status: 1, averageRating: -1, totalReviews: -1 });
ProductSchema.index({ status: 1, price: 1 });
ProductSchema.index({ title: 1 });
ProductSchema.index({ categoryId: 1, status: 1 });
