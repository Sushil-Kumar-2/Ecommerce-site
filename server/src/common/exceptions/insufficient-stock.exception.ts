import { BadRequestException } from '@nestjs/common';

export interface InsufficientStockItem {
  productId: string;
  title: string;
  requestedQuantity: number;
  availableStock: number;
}

export class InsufficientStockException extends BadRequestException {
  constructor(message: string, items?: InsufficientStockItem[]) {
    super({
      statusCode: 400,
      code: 'INSUFFICIENT_STOCK',
      message,
      items,
    });
  }
}
