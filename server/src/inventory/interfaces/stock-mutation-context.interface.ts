import { ClientSession } from 'mongoose';
import { InventoryTransactionType } from '../inventory.enums';

export interface StockMutationContext {
  type: InventoryTransactionType;
  referenceId?: string;
  session?: ClientSession;
}
