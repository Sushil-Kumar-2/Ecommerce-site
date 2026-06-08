import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { InventoryTransactionType } from '../inventory.enums';

export type InventoryTransactionDocument =
  HydratedDocument<InventoryTransaction>;

@Schema({
  timestamps: true,
})
export class InventoryTransaction {
  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, enum: InventoryTransactionType, index: true })
  type: InventoryTransactionType;

  @Prop({ required: true, min: 0 })
  previousStock: number;

  @Prop({ required: true, min: 0 })
  currentStock: number;

  @Prop({ index: true })
  referenceId?: string;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const InventoryTransactionSchema =
  SchemaFactory.createForClass(InventoryTransaction);

InventoryTransactionSchema.index({ productId: 1, createdAt: -1 });
