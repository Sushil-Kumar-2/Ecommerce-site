import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MerchantFulfillmentStatus } from '../../orders/merchant-fulfillment.enums';
import { OrderStatus } from '../../orders/order.enums';

export class MerchantOrderFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by merchant fulfillment status',
    enum: MerchantFulfillmentStatus,
    example: MerchantFulfillmentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(MerchantFulfillmentStatus)
  status?: MerchantFulfillmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by overall order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: '20',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
