import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
  })
  parentCategory?: Types.ObjectId;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
