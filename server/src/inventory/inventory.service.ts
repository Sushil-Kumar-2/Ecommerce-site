import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryTransaction,
  InventoryTransactionDocument,
} from './schemas/inventory-transaction.schema';
import { InventoryTransactionType } from './inventory.enums';

export interface RecordInventoryTransactionParams {
  productId: string;
  quantity: number;
  type: InventoryTransactionType;
  previousStock: number;
  currentStock: number;
  referenceId?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryTransaction.name)
    private readonly transactionModel: Model<InventoryTransactionDocument>,
  ) {}

  async recordTransaction(
    params: RecordInventoryTransactionParams,
  ): Promise<InventoryTransactionDocument> {
    return this.transactionModel.create({
      productId: params.productId,
      quantity: params.quantity,
      type: params.type,
      previousStock: params.previousStock,
      currentStock: params.currentStock,
      referenceId: params.referenceId,
    });
  }

  async findByProduct(
    productId: string,
    limit = 50,
  ): Promise<InventoryTransactionDocument[]> {
    return this.transactionModel
      .find({ productId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
