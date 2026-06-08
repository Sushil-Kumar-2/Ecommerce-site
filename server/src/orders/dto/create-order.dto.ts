import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../order.enums';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description:
      'MongoDB ID of the shipping address. Uses the default address if omitted.',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  addressId?: string;

  @ApiProperty({
    description: 'Payment method for the order',
    enum: PaymentMethod,
    example: PaymentMethod.RAZORPAY,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Coupon code to apply a discount to the order',
    example: 'SAVE20',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
