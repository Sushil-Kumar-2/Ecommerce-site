import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ShipMerchantOrderDto {
  @ApiProperty({
    description: 'Shipment tracking number',
    example: 'TRK1234567890',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  trackingNumber: string;

  @ApiPropertyOptional({
    description: 'Shipping carrier name',
    example: 'FedEx',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string;
}
