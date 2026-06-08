import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop({
    enum: ['user', 'merchant', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({
    enum: ['active', 'blocked', 'pending'],
    default: 'active',
  })
  status: string;

  @Prop()
  avatar: string;

  @Prop()
  shopLogo: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  shopName: string;

  @Prop()
  shopDescription: string;

  @Prop()
  gstNumber: string;

  @Prop()
  businessAddress: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
