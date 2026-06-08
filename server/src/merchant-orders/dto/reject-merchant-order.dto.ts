import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectMerchantOrderDto {
  @ApiProperty({
    description: 'Reason for rejecting the merchant order',
    example: 'Product is out of stock',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
