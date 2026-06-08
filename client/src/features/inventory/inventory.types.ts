export type InventoryTransactionType = 'ORDER' | 'CANCEL' | 'RETURN' | 'MANUAL_ADD'

export interface InventoryTransaction {
  _id: string
  productId: string
  quantity: number
  type: InventoryTransactionType
  previousStock: number
  currentStock: number
  referenceId?: string
  createdAt?: string
  updatedAt?: string
}
